/**
 * Android Expo Go cannot load expo-notifications (SDK 53+).
 * Production and development builds use notifications.impl.ts.
 */
import { isRunningInExpoGo } from 'expo';

import type * as NotificationsApi from './notifications.impl';

const notifications: typeof NotificationsApi = isRunningInExpoGo()
  ? require('./notifications.stub')
  : require('./notifications.impl');

export const BIRTHDAY_CHANNEL_ID = notifications.BIRTHDAY_CHANNEL_ID;
export const isExpoGo = notifications.isExpoGo;
export const notificationIdForPerson = notifications.notificationIdForPerson;
export const ensureAndroidChannel = notifications.ensureAndroidChannel;
export const requestNotificationPermission = notifications.requestNotificationPermission;
export const openNotificationSettings = notifications.openNotificationSettings;
export const getNotificationPermissionStatus = notifications.getNotificationPermissionStatus;
export const cancelBirthdayNotification = notifications.cancelBirthdayNotification;
export const scheduleBirthdayNotification = notifications.scheduleBirthdayNotification;
export const rescheduleBirthdayNotification = notifications.rescheduleBirthdayNotification;
export const cancelAllBirthdayNotifications = notifications.cancelAllBirthdayNotifications;
export const getScheduledNotifications = notifications.getScheduledNotifications;
export const rescheduleAllBirthdayNotifications = notifications.rescheduleAllBirthdayNotifications;
export const scheduleTestNotification = notifications.scheduleTestNotification;
export const personIdFromNotificationData = notifications.personIdFromNotificationData;
export const registerNotificationNavigation = notifications.registerNotificationNavigation;
