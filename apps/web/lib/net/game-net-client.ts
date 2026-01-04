import { Client, Room } from 'colyseus.js';
import {
  netMessageCodes,
  netRoomNames,
  stateSnapshotMessageSchema,
  submitPlayLineMessageSchema,
  turnResolvedMessageSchema,
  type PlayLine,
  type StateSnapshotMessage,
  type TurnResolvedMessage,
} from '@cars-and-magic/shared';

export type GameNetClientListeners = {
  onStateSnapshot?: (message: StateSnapshotMessage) => void;
  onTurnResolved?: (message: TurnResolvedMessage) => void;
  onLeave?: (code?: number) => void;
  onError?: (code: number, message?: string) => void;
};

export class GameNetClient {
  private readonly client: Client;
  private room?: Room;

  constructor(private readonly serverUrl: string) {
    this.client = new Client(serverUrl);
  }

  async joinRaceRoom(listeners: GameNetClientListeners = {}) {
    if (this.room) {
      await this.leave();
    }

    const room = await this.client.joinOrCreate(netRoomNames.race);
    this.room = room;

    room.onLeave((code) => listeners.onLeave?.(code));
    room.onError((code, message) => listeners.onError?.(code, message));

    room.onMessage(netMessageCodes.stateSnapshot, (payload) => {
      const parsed = stateSnapshotMessageSchema.safeParse({
        code: netMessageCodes.stateSnapshot,
        payload,
      });

      if (parsed.success) {
        listeners.onStateSnapshot?.(parsed.data);
      }
    });

    room.onMessage(netMessageCodes.turnResolved, (payload) => {
      const parsed = turnResolvedMessageSchema.safeParse({
        code: netMessageCodes.turnResolved,
        payload,
      });

      if (parsed.success) {
        listeners.onTurnResolved?.(parsed.data);
      }
    });

    return room;
  }

  async leave() {
    if (!this.room) {
      return;
    }

    await this.room.leave();
    this.room = undefined;
  }

  setReady(ready: boolean) {
    this.room?.send('ready', { ready });
  }

  submitPlayLine(playLine: PlayLine) {
    if (!this.room) {
      return;
    }

    const parsed = submitPlayLineMessageSchema.parse({
      code: netMessageCodes.submitPlayLine,
      payload: { playLine },
    });

    this.room.send(parsed.code, parsed.payload);
  }

  get roomId() {
    return this.room?.roomId;
  }

  get sessionId() {
    return this.room?.sessionId;
  }

  get connected() {
    return !!this.room && this.room.connection.isOpen;
  }
}
