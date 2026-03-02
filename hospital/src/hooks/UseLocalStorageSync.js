import { useState, useEffect, useCallback, useRef } from 'react';
import { getFromLocalStorage, saveToLocalStorage } from '../Utils/dataUtils';

export const useLocalStorageSync = (key, defaultValue) => {
  const [value, setValue] = useState(() =>
    getFromLocalStorage(key, defaultValue)
  );

  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const setSyncedValue = useCallback(
    (newValue) => {
      const valueToStore =
        typeof newValue === 'function'
          ? newValue(valueRef.current)
          : newValue;

      setValue(valueToStore);
      valueRef.current = valueToStore;

      saveToLocalStorage(key, valueToStore);
    },
    [key]
  );

  // Listen for same-tab updates
  useEffect(() => {
    const handleStorageUpdate = (e) => {
      // Check if this event is for our key
      if (e.detail && e.detail.key === key) {
        setValue(e.detail.value);
        valueRef.current = e.detail.value;
      }
    };

    // Listen for the specific custom event
    window.addEventListener('storageUpdate', handleStorageUpdate);
    
    // Also listen for the generic event as a fallback
    const handleGenericUpdate = () => {
      const newValue = getFromLocalStorage(key, defaultValue);
      setValue(newValue);
      valueRef.current = newValue;
    };
    
    window.addEventListener('localStorageUpdated', handleGenericUpdate);
    
    // Listen for storage events from other tabs
    const handleStorageChange = (e) => {
      if (e.key === key) {
        const newValue = getFromLocalStorage(key, defaultValue);
        setValue(newValue);
        valueRef.current = newValue;
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storageUpdate', handleStorageUpdate);
      window.removeEventListener('localStorageUpdated', handleGenericUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  return [value, setSyncedValue];
};