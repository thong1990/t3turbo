import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Check if we're in Expo Go
const isExpoGo = Constants.executionEnvironment === 'storeClient'

// Lazy load MMKV only when not in Expo Go
let sendbirdStorage: any = null

const initializeStorage = () => {
  if (isExpoGo) {
    // Use AsyncStorage in Expo Go as fallback
    console.log('Using AsyncStorage for Sendbird in Expo Go (MMKV not available)')
    return null
  }

  if (!sendbirdStorage) {
    try {
      const { MMKVLoader } = require('react-native-mmkv')
      sendbirdStorage = new MMKVLoader()
        .withInstanceID('sendbird-chat')
        .withEncryption()
        .initialize()
      console.log('MMKV initialized for Sendbird')
    } catch (error) {
      console.warn('MMKV initialization failed, falling back to AsyncStorage:', error)
      return null
    }
  }
  return sendbirdStorage
}

// Smart Storage adapter for Sendbird UIKit (MMKV in dev builds, AsyncStorage in Expo Go)
export const MMKVStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const storage = initializeStorage()
    
    if (!storage) {
      // Fallback to AsyncStorage
      try {
        return await AsyncStorage.getItem(key)
      } catch (error) {
        console.error('AsyncStorage getItem error:', error)
        return null
      }
    }

    // Use MMKV
    try {
      const value = storage.getStringForKey(key)
      return Promise.resolve(value ?? null)
    } catch (error) {
      console.error('MMKV getItem error:', error)
      return Promise.resolve(null)
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    const storage = initializeStorage()
    
    if (!storage) {
      // Fallback to AsyncStorage
      try {
        await AsyncStorage.setItem(key, value)
        return Promise.resolve()
      } catch (error) {
        console.error('AsyncStorage setItem error:', error)
        return Promise.reject(error)
      }
    }

    // Use MMKV
    try {
      storage.setStringForKey(key, value)
      return Promise.resolve()
    } catch (error) {
      console.error('MMKV setItem error:', error)
      return Promise.reject(error)
    }
  },

  removeItem: async (key: string): Promise<void> => {
    const storage = initializeStorage()
    
    if (!storage) {
      // Fallback to AsyncStorage
      try {
        await AsyncStorage.removeItem(key)
        return Promise.resolve()
      } catch (error) {
        console.error('AsyncStorage removeItem error:', error)
        return Promise.reject(error)
      }
    }

    // Use MMKV
    try {
      storage.removeValueForKey(key)
      return Promise.resolve()
    } catch (error) {
      console.error('MMKV removeItem error:', error)
      return Promise.reject(error)
    }
  },

  clear: async (): Promise<void> => {
    const storage = initializeStorage()
    
    if (!storage) {
      // Fallback to AsyncStorage
      try {
        await AsyncStorage.clear()
        return Promise.resolve()
      } catch (error) {
        console.error('AsyncStorage clear error:', error)
        return Promise.reject(error)
      }
    }

    // Use MMKV
    try {
      storage.clearStore()
      return Promise.resolve()
    } catch (error) {
      console.error('MMKV clear error:', error)
      return Promise.reject(error)
    }
  },

  getAllKeys: async (): Promise<string[]> => {
    const storage = initializeStorage()
    
    if (!storage) {
      // Fallback to AsyncStorage
      try {
        return await AsyncStorage.getAllKeys()
      } catch (error) {
        console.error('AsyncStorage getAllKeys error:', error)
        return []
      }
    }

    // Use MMKV
    try {
      const keys = storage.getAllKeys()
      return Promise.resolve(keys)
    } catch (error) {
      console.error('MMKV getAllKeys error:', error)
      return Promise.resolve([])
    }
  },
}

export default MMKVStorage