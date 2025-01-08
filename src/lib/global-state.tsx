import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the type for your global state
export type GlobalState = {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  transcriptionLanguage: string;
  audioQuality: 'standard' | 'high';
  hotkeys: { start: string; stop: string };
};

// Define the context type to include both state and setState
interface GlobalStateContextType {
  state: GlobalState;
  setState: React.Dispatch<React.SetStateAction<GlobalState>>;
}

// Create the context with an initial undefined value
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

// Provider component to manage and provide the global state
export const GlobalStateProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [state, setState] = useState<GlobalState>(() => {
    const storedState = localStorage.getItem('globalState');
    return storedState
      ? JSON.parse(storedState)
      : {
          sidebarOpen: false,
          theme: 'system',
          transcriptionLanguage: 'en',
          audioQuality: 'standard',
          hotkeys: { start: 'Ctrl+Shift+R', stop: 'Ctrl+Shift+S' },
        };
  });

  // Persist global state in local storage
  useEffect(() => {
    localStorage.setItem('globalState', JSON.stringify(state));
  }, [state]);

  // Explicitly define the context value type
  const contextValue: GlobalStateContextType = { state, setState };

  // Render the provider and pass down state and setState
  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to access and update global state
export const useGlobalState = <T extends keyof GlobalState>(
  key: T,
  defaultValue: GlobalState[T]
): [GlobalState[T], (value: GlobalState[T]) => void] => {
  const context = useContext(GlobalStateContext);

  // Throw an error if the context is not available (provider is not wrapped)
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }

  const { state, setState } = context;

  const updateState = (value: GlobalState[T]) => {
    const newState = { ...state, [key]: value };
    setState(newState); // Update state using the setter
    localStorage.setItem('globalState', JSON.stringify(newState)); // Persist updated state in local storage
  };

  return [state[key], updateState];
};
