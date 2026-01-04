import {
  PLAYLINE_SLOT_COUNT,
  playLineSchema,
  type PlayLine,
  type PlayerState,
  type StateSnapshotMessage,
  type TurnResolvedMessage,
  type TurnSummary,
} from '@cars-and-magic/shared';
import { create } from 'zustand';

const DEFAULT_AUTOFILL_CARD_ID = 1000;

function createEmptyPlayLine(): PlayLine {
  return Array.from({ length: PLAYLINE_SLOT_COUNT }, () => null) as PlayLine;
}

type MatchStoreState = {
  turn: number;
  expiresAt?: string;
  players: Record<string, PlayerState>;
  localPlayLine: PlayLine;
  autofillCardId: number;
  lastTurnSummary?: TurnSummary;
  setLocalSlot: (slotIndex: number, cardId: PlayLine[number]) => void;
  resetLocalPlayLine: () => void;
  setAutofillCardId: (cardId: number) => void;
  applyStateSnapshot: (message: StateSnapshotMessage) => void;
  applyTurnResolved: (message: TurnResolvedMessage) => void;
  getAutofilledPlayLine: () => PlayLine;
};

export const useMatchStore = create<MatchStoreState>((set, get) => ({
  turn: 1,
  players: {},
  localPlayLine: createEmptyPlayLine(),
  autofillCardId: DEFAULT_AUTOFILL_CARD_ID,
  setLocalSlot: (slotIndex, cardId) =>
    set((state) => {
      if (slotIndex < 0 || slotIndex >= PLAYLINE_SLOT_COUNT) {
        return state;
      }

      const nextPlayLine = [...state.localPlayLine];
      nextPlayLine[slotIndex] = cardId;

      const parsed = playLineSchema.safeParse(nextPlayLine);
      if (!parsed.success) {
        return state;
      }

      return { localPlayLine: parsed.data };
    }),
  resetLocalPlayLine: () => set({ localPlayLine: createEmptyPlayLine() }),
  setAutofillCardId: (cardId) => set({ autofillCardId: cardId }),
  applyStateSnapshot: (message) =>
    set((state) => {
      const players = Object.fromEntries(
        message.payload.players.map((player) => [player.id, player])
      );
      const inferredAutofill =
        message.payload.players.flatMap((player) => player.hand)[0] ??
        state.autofillCardId ??
        DEFAULT_AUTOFILL_CARD_ID;

      return {
        turn: message.payload.turn,
        expiresAt: message.payload.expiresAt,
        players,
        autofillCardId: inferredAutofill,
      } satisfies Partial<MatchStoreState>;
    }),
  applyTurnResolved: (message) =>
    set({
      lastTurnSummary: message.payload.turnSummary,
      expiresAt: message.payload.nextTurnAt,
    }),
  getAutofilledPlayLine: () => {
    const { localPlayLine, autofillCardId } = get();
    return localPlayLine.map((slot) => slot ?? autofillCardId) as PlayLine;
  },
}));
