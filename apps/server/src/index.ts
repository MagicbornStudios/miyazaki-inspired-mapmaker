import { createServer } from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { netRoomNames } from '@cars-and-magic/shared';
import { RaceRoom } from './race-room.js';
import { createGreyboxAssetManifest } from './greybox-manifest.js';

const port = Number(process.env.PORT ?? 2567);
const greyboxAssetManifest = createGreyboxAssetManifest(process.env.GREYBOX_ASSET_BASE_URL);
const httpServer = createServer();

httpServer.on('request', (req, res) => {
  if (req.method !== 'GET' || !req.url) {
    return;
  }

  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  if (req.url === '/assets/greybox-manifest.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(greyboxAssetManifest));
  }
});

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer
  })
});

gameServer.define(netRoomNames.race, RaceRoom);

httpServer.listen(port, () => {
  console.log(`Cars & Magic server listening on ${port}`);
});
