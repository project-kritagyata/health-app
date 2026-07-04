import { Pedometer } from "expo-sensors";

export async function isPedometerAvailable() {
  try {
    return await Pedometer.isAvailableAsync();
  } catch {
    return false; // e.g. simulators / devices with no step sensor
  }
}

export async function getStepPermissionStatus() {
  try {
    const { status } = await Pedometer.getPermissionsAsync();
    return status; // 'granted' | 'denied' | 'undetermined'
  } catch {
    return "unavailable";
  }
}

export async function requestStepPermission() {
  try {
    const { status } = await Pedometer.requestPermissionsAsync();
    return status;
  } catch {
    return "unavailable";
  }
}

export async function getTodayStepCount() {
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  try {
    const result = await Pedometer.getStepCountAsync(start, end);
    return result?.steps ?? 0;
  } catch {
    // Historical range queries aren't well supported on some Android devices —
    // fall back to 0 and let the live subscription build the count from here.
    return 0;
  }
}

// Returns an EventSubscription — call .remove() to unsubscribe.
export function subscribeToStepUpdates(onDelta) {
  return Pedometer.watchStepCount((result) => onDelta(result.steps));
}
