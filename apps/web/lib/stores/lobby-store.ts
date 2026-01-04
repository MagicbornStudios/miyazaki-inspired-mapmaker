import { create } from 'zustand';

type LobbyConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

type LobbyStoreState = {
  status: LobbyConnectionState;
  roomId?: string;
  sessionId?: string;
  ready: boolean;
  error?: string;
  setStatus: (status: LobbyConnectionState) => void;
  setRoom: (roomId?: string, sessionId?: string) => void;
  setReady: (ready: boolean) => void;
  setError: (error?: string) => void;
  reset: () => void;
};

const initialState: Omit<
  LobbyStoreState,
  'setStatus' | 'setRoom' | 'setReady' | 'setError' | 'reset'
> = {
  status: 'idle',
  ready: false,
};

export const useLobbyStore = create<LobbyStoreState>((set) => ({
  ...initialState,
  setStatus: (status) => set({ status }),
  setRoom: (roomId, sessionId) => set({ roomId, sessionId }),
  setReady: (ready) => set({ ready }),
  setError: (error) =>
    set((state) => ({
      error,
      status: error ? 'error' : state.status,
    })),
  reset: () => set(initialState),
}));
