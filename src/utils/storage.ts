/**
 * @file storage.ts
 * @description Utility functions for interacting with local storage.
 * @note This code is taken from a boiler-plate created by Monde Sineke
 * @author Your Name
 */

/**
 * Stores a value in the local storage with the specified key.
 *
 * @param {string} key - The key under which the value will be stored.
 * @param {*} value - The value to be stored in local storage.
 */
export function setLocalItem(key = '', value: any) {
  // Handle different data types appropriately
  if (typeof value === 'string') {
    window.localStorage.setItem(key, value);
  } else {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Retrieves an item from the local storage and parses it as JSON if needed.
 *
 * @param {string} [key=""] - The key of the item to retrieve from local storage.
 * @returns {any} The value from local storage, parsed if it's JSON, or null if the key does not exist.
 */
export function getLocalItem(key = '') {
  const item = window.localStorage.getItem(key);
  if (item === null) return null;

  // Try to parse as JSON, if it fails, return as string
  try {
    return JSON.parse(item);
  } catch (e) {
    // If parsing fails, it's probably a plain string
    return item;
  }
}

/**
 * Removes an item from local storage
 *
 * @param {string} key - The key to remove from local storage
 */
export function removeLocalItem(key = '') {
  window.localStorage.removeItem(key);
}

/**
 * Clears all authentication-related data from local storage
 */
export function clearAuthData() {
  removeLocalItem('accessToken');
  removeLocalItem('user');
  removeLocalItem('apiKey');
}

/**
 * Gets all stored authentication data
 */
export function getAuthData() {
  return {
    accessToken: getLocalItem('accessToken'),
    user: getLocalItem('user'),
    apiKey: getLocalItem('apiKey'),
  };
}
