"use client";

const DEVICE_ID_KEY = "device_id";
const DEVICE_NAME_KEY = "device_name";
const DEFAULT_DEVICE_NAME = "This device";

export interface DeviceIdentity {
  device_id: string;
  device_name: string;
}

export function getDeviceId(): string | null {
  return localStorage.getItem(DEVICE_ID_KEY);
}

export function getDeviceName(): string | null {
  return localStorage.getItem(DEVICE_NAME_KEY);
}

export function generateDeviceId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function saveDeviceId(deviceId: string): void {
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
}

export function saveDeviceName(deviceName: string): void {
  localStorage.setItem(DEVICE_NAME_KEY, deviceName);
}

export function getOrCreateDeviceId(): string {
  const existingDeviceId = getDeviceId();

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const deviceId = generateDeviceId();
  saveDeviceId(deviceId);

  return deviceId;
}

export function getOrCreateDeviceIdentity(
  fallbackDeviceName = DEFAULT_DEVICE_NAME,
): DeviceIdentity {
  const device_id = getOrCreateDeviceId();
  const existingDeviceName = getDeviceName();

  if (existingDeviceName) {
    return {
      device_id,
      device_name: existingDeviceName,
    };
  }

  saveDeviceName(fallbackDeviceName);

  return {
    device_id,
    device_name: fallbackDeviceName,
  };
}
