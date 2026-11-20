import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
} from "react-native";
import { colors } from "../components/colors";
import { Fonts } from "../components/fonts";
import { Images } from "../components/images";
import { devicewidth, deviceheight, borderradius } from "../components/Dimensions";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CASES_KEY = "@cases_list";

const formatDateTime = (ts) => {
    const d = ts ? new Date(ts) : new Date();
    if (isNaN(d.getTime())) return "Just now";

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours.toString().padStart(2, "0");

    return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
};

const CaseDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const item = route.params?.item || {
        id: "CASE0000",
        title: "New Case Received",
        desc: "A new service case has been assigned",
        status: "NEW",
        receivedAt: Date.now(),
    };

    const isOpen = item.status === "Open";

    useEffect(() => {
        if (!isOpen) {
            (async () => {
                try {
                    const stored = await AsyncStorage.getItem(CASES_KEY);
                    if (stored) {
                        const list = JSON.parse(stored);
                        const next = list.map((c) =>
                            c.id === item.id ? { ...c, isNew: false, status: "Open" } : c
                        );
                        await AsyncStorage.setItem(CASES_KEY, JSON.stringify(next));
                    }
                } catch (err) {
                    console.log("Storage update error:", err);
                }
            })();
        }
    }, [isOpen, item.id]);

    const onStart = () => {
        console.log("Start working on", item.id);
    };

    return (
        <SafeAreaProvider style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.cardBackground} />

            <View style={styles.container}>
                {/* Top Content */}
                <View>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={Images.back}
                            style={styles.backImg}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    {/* Header Row */}
                    <View style={styles.headRow}>
                        <Text style={styles.idTxt} numberOfLines={1}>
                            {item.title || item.id}
                        </Text>
                        <View style={[styles.badge, isOpen && styles.openBadge]}>
                            <Text style={[styles.badgeTxt, isOpen && styles.openBadgeTxt]}>
                                {item.status}
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text style={styles.descTxt}>{item.desc}</Text>

                    {/* Info Card */}
                    <View style={styles.card}>
                        <View style={styles.itemRow}>
                            <Text style={styles.label}>Title</Text>
                            <Text style={styles.val} numberOfLines={1}>
                                {item.title || "New Case Received"}
                            </Text>
                        </View>

                        <View style={styles.itemRow}>
                            <Text style={styles.label}>Case ID</Text>
                            <Text style={styles.val} numberOfLines={1}>{item.id}</Text>
                        </View>

                        <View style={styles.itemRow}>
                            <Text style={styles.label}>Received</Text>
                            <Text style={styles.val}>
                                {formatDateTime(item.receivedAt || item.timestamp)}
                            </Text>
                        </View>

                        <View style={[styles.itemRow, styles.noBorder]}>
                            <Text style={styles.label}>Source</Text>
                            <Text style={styles.val}>Push notification</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Button */}
                {/* <View style={styles.btnWrap}>
                    <TouchableOpacity
                        style={styles.btn}
                        onPress={onStart}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.btnTxt}>Start working</Text>
                    </TouchableOpacity>
                </View> */}
            </View>
        </SafeAreaProvider>
    );
};

export default CaseDetail;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.cardBackground,
    },
    container: {
        flex: 1,
        paddingHorizontal: devicewidth * 0.06,
        justifyContent: "space-between",
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        marginTop: deviceheight * 0.065,
        marginBottom: deviceheight * 0.015,
    },
    backImg: {
        width: 50,
        height: 50,

    },
    headRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: deviceheight * 0.01,
    },
    idTxt: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(24),
        color: colors.textPrimary,
        flex: 1,
        marginRight: 10,
    },
    badge: {
        backgroundColor: colors.indigo,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    openBadge: {
        backgroundColor: colors.tagBg,
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 10,
    },
    badgeTxt: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(11),
        color: colors.white,
    },
    openBadgeTxt: {
        fontFamily: Fonts.Medium,
        fontSize: RFValue(11.5),
        color: colors.tagText,
    },
    descTxt: {
        fontFamily: Fonts.Regular,
        fontSize: RFValue(13.5),
        color: colors.textSecondary,
        marginTop: deviceheight * 0.008,
        marginBottom: deviceheight * 0.025,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: devicewidth * 0.045,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: deviceheight * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    label: {
        fontFamily: Fonts.Regular,
        fontSize: RFValue(13),
        color: colors.textSecondary,
    },
    val: {
        fontFamily: Fonts.SemiBold,
        fontSize: RFValue(13),
        color: colors.textPrimary,
        flex: 1,
        textAlign: "right",
    },
    btnWrap: {
        paddingBottom: deviceheight * 0.035,
    },
    btn: {
        height: deviceheight * 0.065,
        backgroundColor: colors.indigo,
        borderRadius: borderradius * 0.72,
        justifyContent: "center",
        alignItems: "center",
    },
    btnTxt: {
        fontFamily: Fonts.SemiBold,
        fontSize: RFValue(14),
        color: colors.white,
    },
});
