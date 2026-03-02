/**
 * Safely gets an item from localStorage and parses it as JSON.
 * @param {string} key The key of the item to retrieve.
 * @param {any} defaultValue The default value to return if the item is not found.
 * @returns {any} The parsed item from localStorage or the default value.
 */
export const getFromLocalStorage = (key, defaultValue) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`[dataUtils] Error reading item "${key}":`, error);
    return defaultValue;
  }
};

export const generateId = (prefix = '') => {
  return prefix ? `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` : Date.now().toString() + Math.random().toString(36).substr(2, 5);
};

/**
 * The ONE AND ONLY function to save data to localStorage.
 * It saves the data and dispatches the correct custom event for real-time updates.
 * @param {string} key The key to save the item under.
 * @param {any} value The value to save.
 */

export const initializeDepartments = () => {
  const existingDepartments = getFromLocalStorage('departments', []);
  
  if (existingDepartments.length === 0) {
    const defaultDepartments = [
      { id: 'cardiology', name: 'Cardiology' },
      { id: 'neurology', name: 'Neurology' },
      { id: 'orthopedics', name: 'Orthopedics' },
      { id: 'pediatrics', name: 'Pediatrics' },
      { id: 'general', name: 'General Medicine' },
      { id: 'dermatology', name: 'Dermatology' },
      { id: 'gynecology', name: 'Gynecology' },
      { id: 'ophthalmology', name: 'Ophthalmology' },
      { id: 'ent', name: 'ENT (Ear, Nose, Throat)' },
      { id: 'psychiatry', name: 'Psychiatry' }
    ];
    saveToLocalStorage('departments', defaultDepartments);
    return defaultDepartments;
  }
  
  return existingDepartments;
};

export const saveToLocalStorage = (key, value) => {
  try {
    console.log(`[dataUtils] SAVING key: "${key}" with value:`, value); // Log every save action
    const serializedValue = JSON.stringify(value);
    window.localStorage.setItem(key, serializedValue);

    // THIS IS THE CRITICAL LINE
    // It announces to all other components on the page that data has changed.
    window.dispatchEvent(new CustomEvent('storageUpdate', { 
      detail: { key, value } 
    }));
    
    // Also dispatch a generic event for broader compatibility
    window.dispatchEvent(new Event('localStorageUpdated'));
    
    console.log(`[dataUtils] Successfully dispatched event for key: "${key}"`);
  } catch (error) {
    console.error(`[dataUtils] Error saving item "${key} to localStorage:`, error);
  }
};

// Helper functions to avoid direct access to localStorage
export const saveUsers = (users) => saveToLocalStorage('users', users);
export const saveAppointments = (appointments) => saveToLocalStorage('appointments', appointments);
export const saveDoctors = (doctors) => saveToLocalStorage('doctors', doctors); // For legacy code, redirect to 'users'
export const savePatients = (patients) => saveToLocalStorage('patients', patients);
export const saveBills = (bills) => saveToLocalStorage('bills', bills);
export const saveInventory = (inventory) => saveToLocalStorage('inventory', inventory);
export const saveMedicalRecords = (records) => saveToLocalStorage('medicalRecords', records);
export const saveNotifications = (notifications) => saveToLocalStorage('notifications', notifications);