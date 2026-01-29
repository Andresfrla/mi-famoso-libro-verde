// =====================================================
// Measurement Context - handles unit system preference
// =====================================================

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { MeasurementSystem } from '../types';

interface MeasurementContextType {
  measurementSystem: MeasurementSystem;
  setMeasurementSystem: (system: MeasurementSystem) => Promise<void>;
  toggleMeasurementSystem: () => Promise<void>;
}

const STORAGE_KEY = '@measurementSystem';

const MeasurementContext = createContext<MeasurementContextType | undefined>(undefined);

export function MeasurementProvider({ children }: { children: React.ReactNode }) {
  const [measurementSystem, setMeasurementSystemState] = useState<MeasurementSystem>('metric');

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'metric' || stored === 'imperial') {
          setMeasurementSystemState(stored);
        }
      } catch (error) {
        console.warn('Failed to load measurement preference', error);
      }
    };

    loadPreference();
  }, []);

  const setMeasurementSystem = useCallback(async (system: MeasurementSystem) => {
    try {
      setMeasurementSystemState(system);
      await AsyncStorage.setItem(STORAGE_KEY, system);
    } catch (error) {
      console.warn('Failed to save measurement preference', error);
    }
  }, []);

  const toggleMeasurementSystem = useCallback(async () => {
    const nextSystem: MeasurementSystem = measurementSystem === 'metric' ? 'imperial' : 'metric';
    await setMeasurementSystem(nextSystem);
  }, [measurementSystem, setMeasurementSystem]);

  const value: MeasurementContextType = {
    measurementSystem,
    setMeasurementSystem,
    toggleMeasurementSystem,
  };

  return <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>;
}

export function useMeasurementSystem(): MeasurementContextType {
  const context = useContext(MeasurementContext);
  if (!context) {
    throw new Error('useMeasurementSystem must be used within MeasurementProvider');
  }
  return context;
}
