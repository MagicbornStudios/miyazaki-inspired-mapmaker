import { createServer } from 'http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { netRoomNames } from '@cars-and-magic/shared';
import { RaceRoom } from './race-room.js';

const port = Number(process.env.PORT ?? 2567);
const httpServer = createServer();

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer
  })
});

gameServer.define(netRoomNames.race, RaceRoom);

httpServer.listen(port, () => {
  console.log(`Cars & Magic server listening on ${port}`);
});
