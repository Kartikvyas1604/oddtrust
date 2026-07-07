import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { loadEnv, getEnv } from './lib/config';
import { createLogger, getLogger } from './lib/logger';
import { createRedis, createRedisSubscriber, closeRedis } from './lib/redis';
import { metricsRegistry } from './lib/metrics';

async function main() {
  loadEnv();
  createLogger();
  const log = getLogger();
  const env = getEnv();

  const redis = createRedis(env.REDIS_URL);
  const subscriber = createRedisSubscriber(env.REDIS_URL);
  await Promise.all([redis.connect(), subscriber.connect()]);

  const httpServer = createServer();
  const wss = new WebSocketServer({ server: httpServer });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    metricsRegistry.wsConnections.set(clients.size);
    log.info({ total: clients.size }, 'WebSocket client connected');

    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Proof-feed stream active',
      timestamp: new Date().toISOString(),
    }));

    ws.on('close', () => {
      clients.delete(ws);
      metricsRegistry.wsConnections.set(clients.size);
      log.info({ total: clients.size }, 'WebSocket client disconnected');
    });

    ws.on('error', (err) => {
      log.error({ err }, 'WebSocket client error');
      clients.delete(ws);
      metricsRegistry.wsConnections.set(clients.size);
    });

    ws.on('pong', () => {
      (ws as unknown as { lastPong: number }).lastPong = Date.now();
    });

    (ws as unknown as { lastPong: number }).lastPong = Date.now();
  });

  const pingInterval = setInterval(() => {
    const now = Date.now();
    for (const ws of clients) {
      const lPong = (ws as unknown as { lastPong?: number }).lastPong ?? now;
      if (now - lPong > 30000) {
        ws.terminate();
        continue;
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }
  }, 15000);

  await subscriber.subscribe(env.REDIS_PROOF_FEED_CHANNEL);
  log.info('Subscribed to proof-feed Redis channel');

  subscriber.on('message', (_channel: string, message: string) => {
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (err) {
          log.error({ err }, 'Failed to send WS message');
        }
      }
    }
  });

  wss.on('close', () => {
    clearInterval(pingInterval);
    subscriber.unsubscribe();
    subscriber.quit();
    closeRedis();
  });

  const port = env.WS_PORT;
  httpServer.listen(port, () => {
    log.info({ port, path: '/ws/proof-feed' }, 'WebSocket server ready');

    setInterval(() => {
      const count = clients.size;
      redis.set('metrics:ws-connections', String(count)).catch(() => {});
    }, 10000);
  });
}

main().catch((err) => {
  console.error('WebSocket server failed:', err);
  process.exit(1);
});
