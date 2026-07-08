import WebSocket from 'ws';
import { getEnv } from '../config';
import { getLogger } from '../logger';

export type OddsUpdateHandler = (data: Record<string, unknown>) => void;

const MAX_RECONNECT_DELAY = 30000;
const BASE_DELAY = 1000;
const HEARTBEAT_INTERVAL = 30000;

export class TxLINEStream {
  private ws: WebSocket | null = null;
  private apiToken: string | null = null;
  private handlers: Set<OddsUpdateHandler> = new Set();
  private shouldReconnect = true;
  private reconnectAttempt = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private subscriptionId: string) {}

  setApiToken(token: string): void {
    this.apiToken = token;
  }

  onOddsUpdate(handler: OddsUpdateHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async connect(): Promise<void> {
    const log = getLogger();
    const wsUrl = getEnv().TXLINE_WS_URL;

    log.info({ url: wsUrl, subscriptionId: this.subscriptionId }, 'Connecting to TxLINE WebSocket');

    this.ws = new WebSocket(wsUrl, {
      headers: {
        'X-Subscription-Id': this.subscriptionId,
        'X-API-Token': this.apiToken ?? '',
      },
    });

    this.ws.on('open', () => {
      log.info('TxLINE WebSocket connected');
      this.reconnectAttempt = 0;
      this.startHeartbeat();

      this.ws?.send(JSON.stringify({
        type: 'subscribe',
        subscription_id: this.subscriptionId,
      }));
    });

    this.ws.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString()) as Record<string, unknown>;
        if (msg.type === 'heartbeat' || msg.type === 'pong') {
          return;
        }
        if (msg.type === 'odds_update' || msg.event === 'odds.update') {
          for (const handler of this.handlers) {
            try {
              handler(msg);
            } catch (err) {
              log.error({ err }, 'Odds update handler error');
            }
          }
        }
      } catch {
        log.warn({ raw: raw.toString().slice(0, 200) }, 'Failed to parse WS message');
      }
    });

    this.ws.on('close', (code: number, reason: Buffer) => {
      log.warn({ code, reason: reason.toString() }, 'TxLINE WebSocket closed');
      this.stopHeartbeat();
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    });

    this.ws.on('error', (err) => {
      log.error({ err }, 'TxLINE WebSocket error');
      this.ws?.close();
    });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      try {
        this.ws?.send(JSON.stringify({ type: 'ping' }));
      } catch {
        this.ws?.close();
      }
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(BASE_DELAY * Math.pow(2, this.reconnectAttempt), MAX_RECONNECT_DELAY);
    this.reconnectAttempt++;
    getLogger().info({ delay, attempt: this.reconnectAttempt }, 'Scheduling TxLINE reconnect');
    setTimeout(() => this.connect(), delay);
  }
}
