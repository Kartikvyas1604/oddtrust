import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';
import { getRedis } from '../lib/redis.js';
import { getLogger } from '../lib/logger.js';
import { metricsRegistry } from '../metrics/registry.js';

const PROOF_FEED_CHANNEL = 'proof-feed:live';

export function registerWebSocketHandlers(app: FastifyInstance): void {
  const log = getLogger();
  const subscribers = new Set<WebSocket>();

  app.get('/ws/proof-feed', { websocket: true }, (socket: WebSocket, _req) => {
    subscribers.add(socket);
    metricsRegistry.wsConnections.set(subscribers.size);
    log.info({ total: subscribers.size }, 'WebSocket client connected');

    socket.on('close', () => {
      subscribers.delete(socket);
      metricsRegistry.wsConnections.set(subscribers.size);
      log.info({ total: subscribers.size }, 'WebSocket client disconnected');
    });

    socket.on('error', (err) => {
      log.error({ err }, 'WebSocket error');
      subscribers.delete(socket);
      metricsRegistry.wsConnections.set(subscribers.size);
    });

    socket.send(JSON.stringify({
      type: 'connected',
      message: 'Proof-feed stream active',
      timestamp: new Date().toISOString(),
    }));
  });

  const redis = getRedis();
  const subscriber = redis.duplicate();

  subscriber.subscribe(PROOF_FEED_CHANNEL, (err) => {
    if (err) {
      log.error({ err }, 'Failed to subscribe to proof-feed channel');
      return;
    }
    log.info('Subscribed to proof-feed Redis channel');
  });

  subscriber.on('message', (_channel, message) => {
    for (const socket of subscribers) {
      if (socket.readyState === socket.OPEN) {
        try {
          socket.send(message);
        } catch (err) {
          log.error({ err }, 'Failed to send WS message');
        }
      }
    }
  });

  app.addHook('onClose', (_instance, done) => {
    subscriber.unsubscribe();
    subscriber.quit();
    for (const socket of subscribers) {
      socket.close();
    }
    done();
  });
}
