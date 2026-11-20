import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Welcome from "../views/Welcome";
import CaseList from "../views/CaseList";
import CaseDetail from "../views/CaseDetail";
import SettingsPage from "../views/SettingsPage";
import { MyTransition } from "../components/navigationslide";
import notifee from "@notifee/react-native";
import { getMessaging, getInitialNotification } from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();
const CASES_KEY = "@cases_list";

const saveTappedCase = async (id, title, desc) => {
    if (!id && !title) return;
    try {
        const stored = await AsyncStorage.getItem(CASES_KEY);
        const existing = stored ? JSON.parse(stored) : [];

        // Check if case is already stored by id
        const isDuplicate = id ? existing.some((c) => c.id === id) : false;
        if (isDuplicate) {
            return;
        }

        const newCase = {
            id: id || `CASE${Date.now().toString().slice(-4)}`,
            title: title || "New Case Received",
            desc: desc || "A new service case has been assigned",
            status: "NEW",
            isNew: true,
            receivedAt: Date.now(),
        };
        // Prepend WITHOUT modifying existing cases' statuses
        await AsyncStorage.setItem(CASES_KEY, JSON.stringify([newCase, ...existing]));
    } catch (e) {
        console.log("Error saving tapped case:", e);
    }
};

const Routes = () => {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        const checkLaunchNotification = async () => {
            try {
                // 1. Check if app was opened by tapping a notifee notification (killed state)
                const notifeeInitial = await notifee.getInitialNotification();
                if (notifeeInitial) {
                    console.log("Opened from notifee notification:", notifeeInitial);
                    const notif = notifeeInitial.notification;
                    const notifData = notif?.data;
                    const id = notifData?.id;
                    const title = notif?.title || "New Case Received";
                    const desc = notif?.body || "A new service case has been assigned";
                    await saveTappedCase(id, title, desc);
                    setInitialRoute("CaseList");
                    return;
                }

                // 2. Check if app was opened by tapping a FCM notification (killed state)
                const messaging = getMessaging();
                const fcmInitial = await getInitialNotification(messaging);
                if (fcmInitial) {
                    console.log("Opened from FCM notification:", fcmInitial);
                    const data = fcmInitial.data || {};
                    const notification = fcmInitial.notification || {};
                    let id = data.id || data.caseId;
                    if (!id && fcmInitial.messageId) {
                        const timePart = fcmInitial.messageId.split(":")[1]?.split("%")[0];
                        if (timePart && timePart.length >= 4) {
                            id = `CASE${timePart.slice(-4)}`;
                        }
                    }
                    if (!id) {
                        id = `CASE${Date.now().toString().slice(-4)}`;
                    }
                    const title = notification.title || data.title || "New Case Received";
                    const desc = notification.body || data.body || data.desc || "A new service case has been assigned";
                    await saveTappedCase(id, title, desc);
                    setInitialRoute("CaseList");
                    return;
                }
            } catch (err) {
                console.log("Error checking launch notification:", err);
            }

            setInitialRoute("Welcome");
        };

        checkLaunchNotification();
    }, []);

    if (!initialRoute) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    ...MyTransition,
                    headerShown: false,
                }}
                initialRouteName={initialRoute}
            >
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="CaseList" component={CaseList} />
                <Stack.Screen name="CaseDetail" component={CaseDetail} />
                <Stack.Screen name="SettingsPage" component={SettingsPage} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Routes;
