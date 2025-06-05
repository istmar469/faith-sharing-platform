
import { useState, useRef, SetStateAction, Dispatch, MutableRefObject } from 'react';

// Simplified state hook - the "safe" wrapper was causing React import issues
export function useSafeState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  return useState(initialState);
}

// Simplified ref hook
export function useSafeRef<T>(initialValue: T): MutableRefObject<T> {
  return useRef(initialValue);
}
