/**
 * @format
 */

import '@react-native-firebase/app';
import { AppRegistry } from 'react-native';
import App from './App';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { name as appName } from './app.json';

const CASES_KEY = '@cases_list';

const showSystemNotification = async (title, body, id) => {
    try {
        const channelId = await notifee.createChannel({
            id: 'cases_channel',
            name: 'Case Notifications',
            importance: AndroidImportance.HIGH,
            vibration: true,
        });

        await notifee.displayNotification({
            title: title || 'New Case Received',
            body: body || 'A new service case has been assigned',
            data: { id: id },
            android: {
                channelId,
                importance: AndroidImportance.HIGH,
                smallIcon: 'ic_notification',
                largeIcon: 'ic_launcher',
                pressAction: { id: 'default' },
            },
        });
    } catch (err) {
        console.log('Background notification display error:', err);
    }
};

const messaging = getMessaging();
setBackgroundMessageHandler(messaging, async remoteMessage => {
    console.log('Message handled in the background/quit state:', remoteMessage);

    const data = remoteMessage?.data || {};
    const notification = remoteMessage?.notification || {};

    let id = data.id || data.caseId;
    if (!id && remoteMessage?.messageId) {
        const timePart = remoteMessage.messageId.split(':')[1]?.split('%')[0];
        if (timePart && timePart.length >= 4) {
            id = `CASE${timePart.slice(-4)}`;
        }
    }
    if (!id) {
        id = `CASE${Date.now().toString().slice(-4)}`;
    }

    const title = notification.title || data.title || 'New Case Received';
    const desc = notification.body || data.body || data.desc || 'A new service case has been assigned';

    try {
        const stored = await AsyncStorage.getItem(CASES_KEY);
        const existing = stored ? JSON.parse(stored) : [];
        const isDuplicate = existing.some(c => c.id === id);

        if (!isDuplicate) {
            const newCase = {
                id: id,
                title: title,
                desc: desc,
                status: 'NEW',
                isNew: true,
                receivedAt: Date.now(),
            };
            await AsyncStorage.setItem(CASES_KEY, JSON.stringify([newCase, ...existing]));
        }
        if (!remoteMessage?.notification) {
            await showSystemNotification(title, desc, id);
        }
    } catch (err) {
        console.log('Background save error:', err);
    }
});


notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('Notifee background event:', type, detail);
});

AppRegistry.registerComponent(appName, () => App);
