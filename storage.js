import AsyncStorage from "@react-native-async-storage/async-storage";

export async function storageGet(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function storageSet(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function storageDelete(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export async function storageListKeys(prefix) {
  try {
    const all = await AsyncStorage.getAllKeys();
    return all.filter((k) => k.startsWith(prefix));
  } catch {
    return [];
  }
}
