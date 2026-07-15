import { getEnv } from '../config';
import { getLogger } from '../logger';

export type OddsUpdateHandler = (data: Record<string, unknown>) => void;

const MAX_RECONNECT_DELAY = 30000;
const BASE_DELAY = 1000;

function parseSseBlock(block: string): { event?: string; data?: string } | null {
  const message: { event?: string; data?: string } = {};
  for (const rawLine of block.split(/\r?\n/)) {
    if (!rawLine || rawLine.startsWith(':')) continue;
    const sep = rawLine.indexOf(':');
    const field = sep === -1 ? rawLine : rawLine.slice(0, sep);
    const value = sep === -1 ? '' : rawLine.slice(sep + 1).replace(/^ /, '');
    if (field === 'data') message.data = (message.data ?? '') + value + '\n';
    if (field === 'event') message.event = value;
  }
  if (message.data) message.data = message.data.replace(/\n$/, '');
  return message.data || message.event ? message : null;
}

export class TxLINEStream {
  private abortController: AbortController | null = null;
  private apiToken: string | null = null;
  private guestToken: string | null = null;
  private handlers: Set<OddsUpdateHandler> = new Set();
  private shouldReconnect = true;
  private reconnectAttempt = 0;

  constructor(private subscriptionId: string) {}

  setApiToken(token: string): void {
    this.apiToken = token;
  }

  setGuestToken(token: string): void {
    this.guestToken = token;
  }

  onOddsUpdate(handler: OddsUpdateHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async connect(): Promise<void> {
    const log = getLogger();
    const url = getEnv().TXLINE_SSE_URL;

    this.abortController = new AbortController();

    try {
      log.info({ url, subscriptionId: this.subscriptionId }, 'Connecting to TxLINE SSE stream');
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.guestToken ?? ''}`,
          'X-Api-Token': this.apiToken ?? '',
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE stream failed: ${response.status} ${response.statusText}`);
      }

      log.info('TxLINE SSE stream connected');
      this.reconnectAttempt = 0;

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let separator = buffer.match(/\r?\n\r?\n/);

        while (separator?.index !== undefined) {
          const block = buffer.slice(0, separator.index);
          buffer = buffer.slice(separator.index + separator[0].length);

          const parsed = parseSseBlock(block);
          if (parsed?.data) {
            try {
              const raw = JSON.parse(parsed.data) as Record<string, unknown>;
              if (parsed.event === 'heartbeat' || raw.type === 'heartbeat') continue;
              if (raw.type === 'odds_update' || raw.event === 'odds.update') {
                for (const handler of this.handlers) {
                  try { handler(raw); } catch (err) { log.error({ err }, 'Odds update handler error'); }
                }
              }
            } catch {
              log.warn({ data: parsed.data.slice(0, 200) }, 'Failed to parse SSE data');
            }
          }
          separator = buffer.match(/\r?\n\r?\n/);
        }
      }

      log.warn('TxLINE SSE stream ended');
      if (this.shouldReconnect) this.scheduleReconnect();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        log.info('TxLINE SSE stream aborted');
        return;
      }
      log.error({ err }, 'TxLINE SSE stream error');
      if (this.shouldReconnect) this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.abortController?.abort();
    this.abortController = null;
  }

  private scheduleReconnect(): void {
    const delay = Math.min(BASE_DELAY * Math.pow(2, this.reconnectAttempt), MAX_RECONNECT_DELAY);
    this.reconnectAttempt++;
    getLogger().info({ delay, attempt: this.reconnectAttempt }, 'Scheduling TxLINE SSE reconnect');
    setTimeout(() => this.connect(), delay);
  }
}
