import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Welcome from "../views/Welcome";
import CaseList from "../views/CaseList";
import CaseDetail from "../views/CaseDetail";
import { MyTransition } from "../components/navigationslide";
import notifee from "@notifee/react-native";
import { getMessaging, getInitialNotification } from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();
const CASES_KEY = "@cases_list";

const saveTappedCase = async (id, desc) => {
    if (!id) return;
    try {
        const stored = await AsyncStorage.getItem(CASES_KEY);
        const existing = stored ? JSON.parse(stored) : [];
        const filtered = existing.filter((c) => c.id !== id);
        const updated = filtered.map((c) => ({
            ...c,
            isNew: false,
            status: c.status === "NEW" ? "Open" : c.status,
        }));
        const newCase = {
            id,
            desc: desc || "A new service case has been assigned",
            status: "NEW",
            isNew: true,
        };
        await AsyncStorage.setItem(CASES_KEY, JSON.stringify([newCase, ...updated]));
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
                    const notifData = notifeeInitial.notification?.data;
                    const id = notifData?.id;
                    const desc = notifeeInitial.notification?.body;
                    await saveTappedCase(id, desc);
                    setInitialRoute("CaseList");
                    return;
                }

                // 2. Check if app was opened by tapping a FCM notification (killed state)
                const messaging = getMessaging();
                const fcmInitial = await getInitialNotification(messaging);
                if (fcmInitial) {
                    console.log("Opened from FCM notification:", fcmInitial);
                    const data = fcmInitial.data;
                    const id = data?.id || data?.caseId || fcmInitial.messageId;
                    const desc = fcmInitial.notification?.body || data?.body || data?.desc;
                    await saveTappedCase(id, desc);
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
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Routes;
