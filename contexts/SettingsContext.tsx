import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';

// Define the types for our settings
export type ViewMode = 'original' | 'tabbed';
export type DisplayMode = 'hp' | 'vests';
export type ProgressBarType = 'radial' | 'linear';

const SETTINGS_KEY = 'app-settings';

export interface AppSettings {
  accountPageView: ViewMode;
  displayMode: DisplayMode;
  progressBarType: ProgressBarType;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>({
    // Default settings
    accountPageView: 'tabbed',
    displayMode: 'hp',
    progressBarType: 'radial',
  });

  // Effect to load settings from localStorage on initial mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
  }, []);
  
  // This effect adds an event listener to sync state across browser tabs.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SETTINGS_KEY && event.newValue) {
        try {
          const newSettings = JSON.parse(event.newValue);
          setSettings(prev => ({...prev, ...newSettings}));
        } catch (error) {
          console.error("Failed to parse settings from storage event", error);
        }
      }
    };
    
    // Add the event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  // Function to update and save settings
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      } catch (error) {
        console.error("Failed to save settings to localStorage", error);
      }
      return updatedSettings;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// The custom hook remains unchanged
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};