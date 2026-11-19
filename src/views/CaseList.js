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
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
    getMessaging,
    onMessage,
    onNotificationOpenedApp,
} from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";

const CASES_KEY = "@cases_list";

const CaseList = () => {
    const navigation = useNavigation();
    const [cases, setCases] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const listRef = useRef(null);

    // Load cases from AsyncStorage
    const loadCases = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(CASES_KEY);
            if (stored) {
                const list = JSON.parse(stored);
                // Purge any old mock data
                const cleaned = list.filter(
                    (c) => !["CASE1004", "CASE1003", "CASE1002"].includes(c.id)
                );
                setCases(cleaned);
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
            // Dedupe by id: remove existing case if present, mark previous as not new, prepend
            const filtered = prev.filter((c) => c.id !== newCase.id);
            const updated = filtered.map((c) => ({
                ...c,
                isNew: false,
                status: c.status === "NEW" ? "Open" : c.status,
            }));
            const next = [newCase, ...updated];
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

    // 1. Initial load on mount
    useEffect(() => {
        loadCases();
    }, [loadCases]);

    // 2. Listen for foreground FCM messages
    useEffect(() => {
        const messaging = getMessaging();
        const unsubscribe = onMessage(messaging, async (remoteMessage) => {
            console.log("Foreground notification received:", remoteMessage);

            const data = remoteMessage?.data || {};
            const notification = remoteMessage?.notification || {};

            const id =
                data.id ||
                data.caseId ||
                remoteMessage?.messageId ||
                `CASE${Date.now().toString().slice(-4)}`;
            const title =
                notification.title || data.title || "New Case Received";
            const desc =
                notification.body ||
                data.body ||
                data.desc ||
                "A new service case has been assigned";

            const newCase = {
                id,
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
                const data = remoteMessage?.data || {};
                const id = data.id || data.caseId || remoteMessage?.messageId;
                if (id) {
                    const desc =
                        remoteMessage?.notification?.body ||
                        data.body ||
                        data.desc ||
                        "A new service case has been assigned";
                    addCase({
                        id,
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

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.card, item.isNew && styles.newCard]}
                onPress={() => navigation.navigate("CaseDetail", { item })}
                activeOpacity={0.8}
            >
                <View style={styles.row}>
                    <Text style={styles.cardId}>{item.id}</Text>
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

    return (
        <SafeAreaProvider style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.cardBackground} />

            {/* Header */}
            <View style={styles.head}>
                <View style={styles.headLeft}>
                    <Text style={styles.title}>Cases</Text>
                    <Text style={styles.sub}>{cases.length} cases assigned to you</Text>
                </View>

                <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                    <Image
                        source={Images.notificationicon}
                        style={styles.bell}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
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
