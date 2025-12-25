import { create } from 'zustand';

interface UIState {
  isReaderOpen: boolean;
  setIsReaderOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isReaderOpen: false,
  setIsReaderOpen: (isOpen) => set({ isReaderOpen: isOpen }),
}));
