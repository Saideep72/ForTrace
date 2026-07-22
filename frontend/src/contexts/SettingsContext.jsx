import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

// Helper to safely get and parse JSON from localStorage
const getStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const SettingsProvider = ({ children }) => {
  // Profile State
  const [profile, setProfile] = useState(() => getStorageItem('ft-settings-profile', {
    avatar: null,
    fullName: 'John Doe',
    email: 'john.doe@ForTrace.com',
    phone: '+1 (555) 123-4567',
    department: 'Operations',
    plantAssigned: 'Plant Alpha',
    location: 'Houston, TX',
    bio: ''
  }));

  // Security State
  const [security, setSecurity] = useState(() => getStorageItem('ft-settings-security', {
    twoFactorEnabled: false,
    sessions: [
      { id: '1', device: 'Chrome on Windows 11', location: 'Houston, TX', lastLogin: 'Today 10:42 AM', isCurrent: true, icon: 'monitor' },
      { id: '2', device: 'MacBook Pro (Safari)', location: 'Mumbai', lastLogin: 'Yesterday 08:15 AM', isCurrent: false, icon: 'monitor' },
      { id: '3', device: 'iPhone 14 (App)', location: 'Mumbai', lastLogin: 'Oct 12, 11:30 PM', isCurrent: false, icon: 'smartphone' }
    ]
  }));

  // Notifications State
  const [notifications, setNotifications] = useState(() => getStorageItem('ft-settings-notifications', {
    alerts: {
      'Maintenance Alerts': true,
      'Compliance Alerts': true,
      'Critical Asset Failure': true,
      'Weekly Reports': true,
      'AI Recommendations': false,
      'System Updates': true
    },
    frequency: 'Immediately'
  }));

  // Appearance specific settings that don't belong in ThemeContext (Language, Font Size)
  const [appearance, setAppearance] = useState(() => getStorageItem('ft-settings-appearance', {
    language: 'English',
    fontSize: 'Medium'
  }));

  // Plant Preferences
  const [plantPrefs, setPlantPrefs] = useState(() => getStorageItem('ft-settings-plant', {
    defaultPlant: 'Plant Alpha',
    defaultDashboard: 'Overview',
    timeZone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    measurementUnits: 'metric'
  }));

  // AI Preferences
  const [aiPrefs, setAiPrefs] = useState(() => getStorageItem('ft-settings-ai', {
    aiSuggestions: true,
    confidenceScore: true,
    defaultModel: 'ForTrace AI'
  }));

  // Persist state changes to localStorage
  useEffect(() => { localStorage.setItem('ft-settings-profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('ft-settings-security', JSON.stringify(security)); }, [security]);
  useEffect(() => { localStorage.setItem('ft-settings-notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('ft-settings-appearance', JSON.stringify(appearance)); }, [appearance]);
  useEffect(() => { localStorage.setItem('ft-settings-plant', JSON.stringify(plantPrefs)); }, [plantPrefs]);
  useEffect(() => { localStorage.setItem('ft-settings-ai', JSON.stringify(aiPrefs)); }, [aiPrefs]);

  // Toast Notification System
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const value = {
    profile, setProfile,
    security, setSecurity,
    notifications, setNotifications,
    appearance, setAppearance,
    plantPrefs, setPlantPrefs,
    aiPrefs, setAiPrefs,
    showToast
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
      {/* Global Toast Component */}
      <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 transform ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="font-medium text-sm">{toast.message}</div>
        </div>
      </div>
    </SettingsContext.Provider>
  );
};
