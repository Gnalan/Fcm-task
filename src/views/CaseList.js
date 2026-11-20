import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
    AppState,
} from "react-native";
import { colors } from "../components/colors";
import { Fonts } from "../components/fonts";
import { Images } from "../components/images";
import { devicewidth, deviceheight } from "../components/Dimensions";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
    getMessaging,
    onMessage,
    onNotificationOpenedApp,
    getInitialNotification,
} from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";

const CASES_KEY = "@cases_list";

const CaseList = () => {
    const navigation = useNavigation();
    const [cases, setCases] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const listRef = useRef(null);
    const openedCaseIdRef = useRef(null);

    // Load cases from AsyncStorage
    const loadCases = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(CASES_KEY);
            if (stored) {
                const list = JSON.parse(stored);
                // Purge any old mock data and dedupe existing stored records
                const seen = new Set();
                const deduped = [];
                for (const c of list) {
                    if (["CASE1004", "CASE1003", "CASE1002"].includes(c.id)) {
                        continue;
                    }
                    if (!seen.has(c.id)) {
                        seen.add(c.id);
                        deduped.push(c);
                    }
                }
                setCases(deduped);
            } else {
                setCases([]);
            }
        } catch (err) {
            console.log("Load error:", err);
            setCases([]);
        } finally {
            setLoaded(true);
        }
    }, []);

    // Add a single case to list & AsyncStorage
    const addCase = useCallback((newCase) => {
        setCases((prev) => {
            // Dedupe by id only
            const alreadyExists = prev.some((c) => c.id === newCase.id);
            if (alreadyExists) {
                return prev;
            }
            // Prepend newCase WITHOUT changing status of previous cases
            const next = [newCase, ...prev];
            AsyncStorage.setItem(CASES_KEY, JSON.stringify(next)).catch((err) =>
                console.log("Save error:", err)
            );
            return next;
        });

        // Scroll to top
        setTimeout(() => {
            listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 300);
    }, []);

    // Show system notification using notifee in foreground
    const showNotification = async (title, body, id) => {
        try {
            const channelId = await notifee.createChannel({
                id: "cases_channel",
                name: "Case Notifications",
                importance: AndroidImportance.HIGH,
                vibration: true,
            });

            await notifee.displayNotification({
                title: title || "New Case Received",
                body: body || "A new service case has been assigned",
                data: { id: id },
                android: {
                    channelId,
                    importance: AndroidImportance.HIGH,
                    pressAction: { id: "default" },
                },
            });
        } catch (err) {
            console.log("Foreground notification display error:", err);
        }
    };

    // 1. Initial load on mount and when screen regains focus
    useFocusEffect(
        useCallback(() => {
            if (openedCaseIdRef.current) {
                const targetId = openedCaseIdRef.current;
                openedCaseIdRef.current = null;
                setCases((prev) => {
                    const next = prev.map((c) =>
                        c.id === targetId
                            ? { ...c, isNew: false, status: "Open" }
                            : c
                    );
                    AsyncStorage.setItem(CASES_KEY, JSON.stringify(next)).catch(
                        (err) => console.log("Save error:", err)
                    );
                    return next;
                });
            } else {
                loadCases();
            }
        }, [loadCases])
    );

    // 2. Listen for foreground FCM messages
    useEffect(() => {
        const messaging = getMessaging();
        const unsubscribe = onMessage(messaging, async (remoteMessage) => {
            console.log("Foreground notification received:", remoteMessage);

            const data = remoteMessage?.data || {};
            const notification = remoteMessage?.notification || {};

            let id = data.id || data.caseId;
            if (!id && remoteMessage?.messageId) {
                const timePart = remoteMessage.messageId.split(":")[1]?.split("%")[0];
                if (timePart && timePart.length >= 4) {
                    id = `CASE${timePart.slice(-4)}`;
                }
            }
            if (!id) {
                id = `CASE${Date.now().toString().slice(-4)}`;
            }
            const title =
                notification.title || data.title || "New Case Received";
            const desc =
                notification.body ||
                data.body ||
                data.desc ||
                "A new service case has been assigned";

            const newCase = {
                id,
                title,
                desc,
                status: "NEW",
                isNew: true,
            };

            // Add to list immediately (no refresh needed)
            addCase(newCase);

            // Display system notification in tray
            await showNotification(title, desc, id);
        });

        return () => unsubscribe();
    }, [addCase]);

    // 3. Listen for AppState change (re-check cases when returning from background)
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextState) => {
            if (nextState === "active") {
                loadCases();
            }
        });
        return () => subscription.remove();
    }, [loadCases]);

    // 4. Listen for notifee tap events while app is running/backgrounded
    useEffect(() => {
        const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) {
                console.log("Notifee notification pressed:", detail);
                loadCases();
            }
        });
        return () => unsubscribe();
    }, [loadCases]);

    // 5. Listen for FCM notification opened from background
    useEffect(() => {
        const messaging = getMessaging();
        const unsubscribe = onNotificationOpenedApp(
            messaging,
            async (remoteMessage) => {
                console.log("FCM notification opened from background:", remoteMessage);
                if (remoteMessage) {
                    const data = remoteMessage.data || {};
                    const notification = remoteMessage.notification || {};
                    let id = data.id || data.caseId;
                    if (!id && remoteMessage.messageId) {
                        const timePart = remoteMessage.messageId.split(":")[1]?.split("%")[0];
                        if (timePart && timePart.length >= 4) {
                            id = `CASE${timePart.slice(-4)}`;
                        }
                    }
                    if (!id) {
                        id = `CASE${Date.now().toString().slice(-4)}`;
                    }
                    const title = notification.title || data.title || "New Case Received";
                    const desc = notification.body || data.body || data.desc || "A new service case has been assigned";
                    addCase({
                        id,
                        title,
                        desc,
                        status: "NEW",
                        isNew: true,
                    });
                } else {
                    loadCases();
                }
            }
        );
        return () => unsubscribe();
    }, [addCase, loadCases]);

    // 6. Check if app was opened from killed state by tapping notification
    useEffect(() => {
        const checkInitial = async () => {
            try {
                const messaging = getMessaging();
                const fcmInitial = await getInitialNotification(messaging);
                if (fcmInitial) {
                    console.log("Initial FCM notification in CaseList:", fcmInitial);
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
                    addCase({
                        id,
                        title,
                        desc,
                        status: "NEW",
                        isNew: true,
                    });
                }
            } catch (err) {
                console.log("Error checking initial notification in CaseList:", err);
            }
        };
        checkInitial();
    }, [addCase]);

    const openCase = useCallback(
        (item) => {
            if (item.isNew || item.status === "NEW" || item.status === "New") {
                openedCaseIdRef.current = item.id;
            }
            navigation.navigate("CaseDetail", { item });
        },
        [navigation]
    );

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.card, item.isNew && styles.newCard]}
                onPress={() => openCase(item)}
                activeOpacity={0.8}
            >
                <View style={styles.row}>
                    <Text style={styles.cardId} numberOfLines={1}>
                        {item.title || item.id}
                    </Text>
                    <View style={[styles.badge, item.isNew && styles.newBadge]}>
                        <Text style={[styles.badgeTxt, item.isNew && styles.newBadgeTxt]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
                <Text style={styles.cardSub}>{item.desc}</Text>
            </TouchableOpacity>
        );
    };

    if (!loaded) return null;

    const unreadCount = cases.filter(
        (c) => c.isNew || c.status === "NEW" || c.status === "New"
    ).length;

    return (
        <SafeAreaProvider style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.cardBackground} />

            {/* Header */}
            <View style={styles.head}>
                <View style={styles.headLeft}>
                    <Text style={styles.title}>Cases</Text>
                    <Text style={styles.sub}>{cases.length} cases assigned to you</Text>
                </View>

                <View style={styles.bellBtn}>
                    <Image
                        source={Images.notificationicon}
                        style={styles.bell}
                        resizeMode="contain"
                    />
                    {unreadCount > 0 && (
                        <View style={styles.badgeCount}>
                            <Text style={styles.badgeCountText}>
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Cases List */}
            <FlatList
                ref={listRef}
                data={cases}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.list,
                    cases.length === 0 && styles.emptyList,
                ]}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>No cases assigned yet</Text>
                        <Text style={styles.emptySub}>
                            New service cases will automatically appear here when notifications arrive.
                        </Text>
                    </View>
                }
            />
        </SafeAreaProvider>
    );
};

export default CaseList;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.cardBackground,
    },
    head: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: devicewidth * 0.06,
        paddingTop: deviceheight * 0.07,
        paddingBottom: deviceheight * 0.015,
    },
    headLeft: {
        flex: 1,
    },
    title: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(28),
        color: colors.textPrimary,
    },
    sub: {
        fontFamily: Fonts.Regular,
        fontSize: RFValue(13.5),
        color: colors.textSecondary,
        marginTop: deviceheight * 0.005,
    },
    bellBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    bell: {
        width: 20,
        height: 20,
        tintColor: colors.textPrimary,
    },
    badgeCount: {
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 19,
        height: 19,
        borderRadius: 9.5,
        backgroundColor: colors.indigo,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: colors.white,
    },
    badgeCountText: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(9.5),
        color: colors.white,
        textAlign: "center",
        lineHeight: RFValue(12),
    },
    list: {
        paddingHorizontal: devicewidth * 0.06,
        paddingTop: deviceheight * 0.015,
        paddingBottom: deviceheight * 0.03,
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: "center",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: devicewidth * 0.08,
        paddingVertical: deviceheight * 0.1,
    },
    emptyTitle: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(16),
        color: colors.textPrimary,
        marginBottom: deviceheight * 0.01,
    },
    emptySub: {
        fontFamily: Fonts.Regular,
        fontSize: RFValue(13),
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: RFValue(18),
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: devicewidth * 0.045,
        marginBottom: deviceheight * 0.015,
    },
    newCard: {
        backgroundColor: colors.tint,
        borderWidth: 2,
        borderColor: colors.indigo,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardId: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(15),
        color: colors.textPrimary,
        flex: 1,
        marginRight: 10,
    },
    cardSub: {
        fontFamily: Fonts.Regular,
        fontSize: RFValue(13.5),
        color: colors.textSecondary,
        marginTop: deviceheight * 0.008,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: colors.tagBg,
    },
    newBadge: {
        backgroundColor: colors.indigo,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeTxt: {
        fontFamily: Fonts.Medium,
        fontSize: RFValue(11.5),
        color: colors.tagText,
    },
    newBadgeTxt: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(11),
        color: colors.white,
    },
});
