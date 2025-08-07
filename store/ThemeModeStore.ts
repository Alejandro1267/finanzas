import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeModeStore {
  selectedMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeModeStore = create<ThemeModeStore>()(
  persist(
    (set) => ({
      selectedMode: 'auto',
      
      setThemeMode: (mode: ThemeMode) => {
        set({ selectedMode: mode });
      },
    }),
    {
      name: 'theme-mode-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);