import { Theme } from '../context/ThemeContext';

export type MotifIntensity = 'low' | 'medium' | 'high';
export type MotifType = 'snow' | 'lights' | 'ribbons' | 'stripes' | 'ornaments' | 'sparkles' | 'starbursts' | 'glow';

export interface MotifConfig {
  snow: {
    enabled: boolean;
    intensity: MotifIntensity;
  };
  lights: {
    enabled: boolean;
    intensity: MotifIntensity;
  };
  ribbons: {
    enabled: boolean;
  };
  stripes: {
    enabled: boolean;
  };
  ornaments: {
    enabled: boolean;
  };
  sparkles: {
    enabled: boolean;
    intensity: MotifIntensity;
  };
  starbursts: {
    enabled: boolean;
  };
  glow: {
    enabled: boolean;
    intensity: MotifIntensity;
  };
}

// Default configurations per theme
export const getDefaultMotifConfig = (theme: Theme): MotifConfig => {
  const baseConfig: MotifConfig = {
    snow: {
      enabled: theme === 'christmas' || theme === 'newyear',
      intensity: 'medium',
    },
    lights: {
      enabled: theme !== 'classic',
      intensity: 'medium',
    },
    ribbons: {
      enabled: true,
    },
    stripes: {
      enabled: theme === 'christmas',
    },
    ornaments: {
      enabled: theme === 'christmas',
    },
    sparkles: {
      enabled: theme === 'newyear' || theme === 'christmas',
      intensity: 'medium',
    },
    starbursts: {
      enabled: theme === 'newyear',
    },
    glow: {
      enabled: theme === 'newyear' || theme === 'christmas',
      intensity: 'medium',
    },
  };

  return baseConfig;
};

// Storage key for user preferences
const STORAGE_KEY = 'cryptogifting-motif-config';

// Load user preferences from localStorage
export const loadMotifConfig = (theme: Theme): MotifConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return {
        ...getDefaultMotifConfig(theme),
        ...parsed,
      };
    }
  } catch (error) {
    console.warn('Failed to load motif config from localStorage:', error);
  }
  return getDefaultMotifConfig(theme);
};

// Save user preferences to localStorage
export const saveMotifConfig = (config: MotifConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('Failed to save motif config to localStorage:', error);
  }
};

// Reset to defaults
export const resetMotifConfig = (theme: Theme): MotifConfig => {
  const defaults = getDefaultMotifConfig(theme);
  saveMotifConfig(defaults);
  return defaults;
};




