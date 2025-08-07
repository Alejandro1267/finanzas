import { useThemeModeStore } from '@/store/ThemeModeStore';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme() {
  const systemColorScheme = useSystemColorScheme();
  const { selectedMode } = useThemeModeStore();

  // If mode is auto, use system preference
  if (selectedMode === 'auto') {
    return systemColorScheme;
  }

  // Otherwise, use the manually selected mode
  return selectedMode;
}