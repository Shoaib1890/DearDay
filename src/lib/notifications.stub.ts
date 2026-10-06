import * as Linking from 'expo-linking';

import type { Person } from '@/types/person';

const expoGoMessage =
  'Birthday reminders cannot run in Expo Go on Android. Use a development build for notifications.';

export const BIRTHDAY_CHANNEL_ID = 'birthday-reminders';

export function isExpoGo(): boolean {
  return true;
}

export function notificationIdForPerson(personId: string): string {
  return `birthday:${personId}`;
}

export async function ensureAndroidChannel(): Promise<void> {}

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function openNotificationSettings(): Promise<void> {
  await Linking.openSettings();
}

export async function getNotificationPermissionStatus(): Promise<{ granted: boolean }> {
  return { granted: false };
}

export async function cancelBirthdayNotification(_personId: string): Promise<void> {}

export async function scheduleBirthdayNotification(_person: Person): Promise<string | null> {
  console.warn('[DearDay]', expoGoMessage);
  return null;
}

export async function rescheduleBirthdayNotification(_person: Person): Promise<string | null> {
  return null;
}

export async function cancelAllBirthdayNotifications(): Promise<void> {}

export async function getScheduledNotifications() {
  return [];
}

export async function rescheduleAllBirthdayNotifications(): Promise<void> {}

export async function scheduleTestNotification(_person: Person, _seconds = 10): Promise<void> {
  throw new Error(expoGoMessage);
}

export function personIdFromNotificationData(_data: unknown): string | null {
  return null;
}

export function registerNotificationNavigation(_openPerson: (personId: string) => void): () => void {
  return () => {};
}
