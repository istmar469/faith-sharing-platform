import React, { useState, SetStateAction, Dispatch } from 'react';

// Safe wrapper for useState that checks React availability
export function useSafeState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  // Check if React and useState are available
  if (!React) {
    console.error('React is not available');
    throw new Error('React is not properly initialized');
  }
  
  if (!React.useState) {
    console.error('React.useState is not available');
    throw new Error('React hooks are not available. This usually indicates a version mismatch or improper React setup.');
  }
  
  try {
    return useState(initialState);
  } catch (error) {
    console.error('Error calling useState:', error);
    throw new Error(`Failed to initialize state: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Safe wrapper for useRef
export function useSafeRef<T>(initialValue: T): React.MutableRefObject<T> {
  if (!React || !React.useRef) {
    console.error('React.useRef is not available');
    throw new Error('React hooks are not available');
  }
  
  try {
    return React.useRef(initialValue);
  } catch (error) {
    console.error('Error calling useRef:', error);
    throw new Error(`Failed to initialize ref: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 