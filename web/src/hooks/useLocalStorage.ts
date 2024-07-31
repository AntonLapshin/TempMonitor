import { useState, useEffect } from "react";

const readLocalStorage = <T>(key: string, initialValue: T) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readLocalStorage(key, initialValue)
  );

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      window.dispatchEvent(new Event("localStorageChange"));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readLocalStorage(key, initialValue));
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChange", handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue] as const;
};
