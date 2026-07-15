import { getEnv } from '../config/env.js';
import { getLogger } from '../lib/logger.js';
import type { TxLINEStreamMessage } from './types.js';

export type StreamHandler = (msg: TxLINEStreamMessage) => void;

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
  private apiToken: string;
  private guestToken: string;
  private handlers: Set<StreamHandler> = new Set();
  private shouldReconnect = true;
  private reconnectAttempt = 0;

  constructor(apiToken: string, guestToken: string) {
    this.apiToken = apiToken;
    this.guestToken = guestToken;
  }

  onMessage(handler: StreamHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  async connect(): Promise<void> {
    const log = getLogger();
    const url = getEnv().TXLINE_SSE_URL;

    this.abortController = new AbortController();

    try {
      log.info({ url }, 'Connecting to TxLINE SSE stream');
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.guestToken}`,
          'X-Api-Token': this.apiToken,
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
              const raw = JSON.parse(parsed.data);
              const msg: TxLINEStreamMessage = {
                type: parsed.event === 'heartbeat' ? 'heartbeat' : (raw.type ?? 'odds_update'),
                fixture_id: raw.fixture_id ?? raw.fixtureId ?? '',
                data: raw.data ?? raw,
                timestamp: raw.timestamp ?? new Date().toISOString(),
              };
              if (msg.type === 'heartbeat') continue;
              for (const handler of this.handlers) {
                try { handler(msg); } catch (err) { log.error({ err }, 'Stream handler error'); }
              }
            } catch (err) {
              log.warn({ err, data: parsed.data.slice(0, 200) }, 'Failed to parse SSE data');
            }
          }
          separator = buffer.match(/\r?\n\r?\n/);
        }
      }

      log.warn('TxLINE SSE stream ended');
      this.cleanup();
      if (this.shouldReconnect) this.scheduleReconnect();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        log.info('TxLINE SSE stream aborted');
        return;
      }
      log.error({ err }, 'TxLINE SSE stream error');
      this.cleanup();
      if (this.shouldReconnect) this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 30000);
    this.reconnectAttempt++;
    getLogger().info({ attempt: this.reconnectAttempt, delay }, 'TxLINE SSE reconnecting');
    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect().catch((err) => {
          getLogger().error({ err }, 'TxLINE SSE reconnect failed');
        });
      }
    }, delay);
  }

  private cleanup(): void {}

  disconnect(): void {
    this.shouldReconnect = false;
    this.abortController?.abort();
    this.abortController = null;
  }
}
