import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getBirthdayInfo } from '@/lib/birthdays';
import { jsDateFromCalendar, observedBirthdayInYear, parseBirthday } from '@/lib/dates';
import { getPeople } from '@/lib/storage';
import type { Person } from '@/types/person';

export const BIRTHDAY_CHANNEL_ID = 'birthday-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

export function notificationIdForPerson(personId: string): string {
  return `birthday:${personId}`;
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(BIRTHDAY_CHANNEL_ID, {
    name: 'Birthday reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1A7F5A',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  if (current.status === 'denied' && current.canAskAgain === false) {
    return false;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function openNotificationSettings(): Promise<void> {
  await Linking.openSettings();
}

export async function getNotificationPermissionStatus(): Promise<{ granted: boolean }> {
  const status = await Notifications.getPermissionsAsync();
  return { granted: Boolean(status.granted) };
}

function buildNotificationContent(person: Person) {
  const info = getBirthdayInfo(person);
  const firstName = person.name.trim();
  const relationship = person.relationship?.toLowerCase();
  const isParent =
    relationship === 'mother' || relationship === 'mom' || relationship === 'father' || relationship === 'dad';

  const title = `🎂 It's ${firstName}'s Birthday!`;
  const body = isParent
    ? `Don't forget to make ${relationship === 'father' || relationship === 'dad' ? 'his' : 'her'} day special ❤️`
    : info
      ? `${firstName} turns ${info.nextAge} today. Don't forget to wish them! ❤️`
      : `Don't forget to wish ${firstName}! ❤️`;

  return {
    title,
    body,
    sound: true,
    data: {
      personId: person.id,
      url: `/person/${person.id}`,
    },
  };
}

function nextReminderDate(person: Person): Date | null {
  const birthday = parseBirthday(person.birthday);
  const info = getBirthdayInfo(person);
  if (!birthday || !info) return null;
  const fireAt = jsDateFromCalendar(info.nextBirthday, person.reminderHour, person.reminderMinute);
  if (fireAt.getTime() <= Date.now()) {
    const following = observedBirthdayInYear(birthday, info.nextBirthday.year + 1);
    return jsDateFromCalendar(following, person.reminderHour, person.reminderMinute);
  }
  return fireAt;
}

export async function cancelBirthdayNotification(personId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationIdForPerson(personId));
  await Notifications.cancelScheduledNotificationAsync(`birthday-test:${personId}`);
}

export async function scheduleBirthdayNotification(person: Person): Promise<string | null> {
  if (!person.reminderEnabled) {
    await cancelBirthdayNotification(person.id);
    return null;
  }

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
    console.warn('[DearDay] Skipping schedule; notifications are not permitted.');
    return null;
  }

  await ensureAndroidChannel();
  await cancelBirthdayNotification(person.id);

  const date = nextReminderDate(person);
  if (!date) return null;

  const identifier = notificationIdForPerson(person.id);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: buildNotificationContent(person),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: BIRTHDAY_CHANNEL_ID,
    },
  });
  return identifier;
}

export async function rescheduleBirthdayNotification(person: Person): Promise<string | null> {
  await cancelBirthdayNotification(person.id);
  return scheduleBirthdayNotification(person);
}

export async function cancelAllBirthdayNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith('birthday:') || item.identifier.startsWith('birthday-test:'))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
}

export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

export async function rescheduleAllBirthdayNotifications(): Promise<void> {
  const people = await getPeople();
  for (const person of people) {
    try {
      await rescheduleBirthdayNotification(person);
    } catch (error) {
      console.warn(`[DearDay] Failed to schedule reminder for ${person.id}`, error);
    }
  }
}

export async function scheduleTestNotification(person: Person, seconds = 10): Promise<void> {
  const permitted = await requestNotificationPermission();
  if (!permitted) {
    throw new Error('Notifications are disabled.');
  }
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: `birthday-test:${person.id}`,
    content: {
      ...buildNotificationContent(person),
      title: `🎂 Test: ${person.name}'s Birthday!`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      channelId: BIRTHDAY_CHANNEL_ID,
    },
  });
}

export function personIdFromNotificationData(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  if (typeof record.personId === 'string') return record.personId;
  if (typeof record.url === 'string') {
    const match = /\/person\/([^/?]+)/.exec(record.url);
    return match?.[1] ?? null;
  }
  return null;
}

export function registerNotificationNavigation(openPerson: (personId: string) => void): () => void {
  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response) {
        const personId = personIdFromNotificationData(response.notification.request.content.data);
        if (personId) openPerson(personId);
      }
    })
    .catch((error) => console.warn('[DearDay] Last notification lookup failed', error));

  const received = Notifications.addNotificationReceivedListener((notification) => {
    const personId = personIdFromNotificationData(notification.request.content.data);
    if (personId) {
      rescheduleAllBirthdayNotifications().catch((error) => {
        console.warn('[DearDay] Reschedule after received failed', error);
      });
    }
  });

  const tapped = Notifications.addNotificationResponseReceivedListener((response) => {
    const personId = personIdFromNotificationData(response.notification.request.content.data);
    if (personId) openPerson(personId);
  });

  return () => {
    received.remove();
    tapped.remove();
  };
}
