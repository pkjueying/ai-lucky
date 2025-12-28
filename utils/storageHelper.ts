import { ActivityLog } from '../types';

const STORAGE_KEY = 'hr_toolkit_history';

export const getHistory = (): ActivityLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveActivity = (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
  try {
    const current = getHistory();
    const newActivity: ActivityLog = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    // Prepend new activity
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newActivity, ...current]));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};

export const deleteActivity = (id: string) => {
  try {
    const current = getHistory();
    const updated = current.filter(log => log.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to delete activity", e);
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};