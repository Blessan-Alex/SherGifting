import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  MotifConfig,
  getDefaultMotifConfig,
  loadMotifConfig,
  saveMotifConfig,
  resetMotifConfig,
} from '../lib/motifConfig';

export const useMotifConfig = () => {
  const { theme } = useTheme();
  const [config, setConfig] = useState<MotifConfig>(() => loadMotifConfig(theme));

  // Update config when theme changes
  useEffect(() => {
    const loaded = loadMotifConfig(theme);
    setConfig(loaded);
  }, [theme]);

  // Update a specific motif setting
  const updateMotif = useCallback(<K extends keyof MotifConfig>(
    motif: K,
    updates: Partial<MotifConfig[K]>
  ) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        [motif]: {
          ...prev[motif],
          ...updates,
        },
      };
      saveMotifConfig(newConfig);
      return newConfig;
    });
  }, []);

  // Toggle a motif on/off
  const toggleMotif = useCallback((motif: keyof MotifConfig) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        [motif]: {
          ...prev[motif],
          enabled: !prev[motif].enabled,
        },
      };
      saveMotifConfig(newConfig);
      return newConfig;
    });
  }, []);

  // Reset to defaults
  const reset = useCallback(() => {
    const defaults = resetMotifConfig(theme);
    setConfig(defaults);
  }, [theme]);

  return {
    config,
    updateMotif,
    toggleMotif,
    reset,
  };
};

export default useMotifConfig;




