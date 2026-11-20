import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar,
    ScrollView,
} from "react-native";
import { colors } from "../components/colors";
import { Fonts } from "../components/fonts";
import { Images } from "../components/images";
import { devicewidth, deviceheight, borderradius } from "../components/Dimensions";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
    getMessaging,
    registerDeviceForRemoteMessages,
    getToken,
} from "@react-native-firebase/messaging";
import Clipboard from "@react-native-clipboard/clipboard";

const SettingsPage = () => {
    const navigation = useNavigation();
    const [token, setToken] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const messaging = getMessaging();
                await registerDeviceForRemoteMessages(messaging);
                const t = await getToken(messaging);
                if (t) {
                    setToken(t);
                }
            } catch (err) {
                console.log("Token fetch error:", err);
            }
        };
        fetchToken();
    }, []);

    const onCopy = () => {
        if (displayToken) {
            try {
                Clipboard.setString(displayToken);
            } catch (err) {
                console.log("Clipboard copy error:", err);
            }
        }
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2500);
    };

    const displayToken =
        token;

    return (
        <SafeAreaProvider style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.cardBackground} />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.head}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={Images.back}
                            style={styles.backIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                    <Text style={styles.title}>Settings</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.deviceRow}>
                        <Image
                            source={Images.deviceicon}
                            style={styles.deviceIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.deviceTitle}>Device Information</Text>
                    </View>

                    <Text style={styles.label}>FCM Token</Text>

                    <View style={styles.tokenBox}>
                        <Text style={styles.tokenTxt}>{displayToken}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={onCopy}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={Images.copyicon}
                            style={styles.copyIcon}
                            resizeMode="contain"
                        />
                        <Text style={styles.copyTxt}>Copy Token</Text>
                    </TouchableOpacity>

                    {copied && (
                        <View style={styles.successRow}>
                            <View style={styles.checkCircle}>
                                <Text style={styles.checkMark}>✓</Text>
                            </View>
                            <Text style={styles.successTxt}>Token copied successfully</Text>
                        </View>
                    )}
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <View style={styles.infoCircle}>
                            <Text style={styles.infoI}>i</Text>
                        </View>
                        <Text style={styles.infoTxt}>
                            Use this token to identify this device for push notifications.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaProvider>
    );
};

export default SettingsPage;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.cardBackground,
    },
    scroll: {
        paddingBottom: deviceheight * 0.05,
    },
    head: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: devicewidth * 0.06,
        paddingTop: deviceheight * 0.065,
        paddingBottom: deviceheight * 0.02,
    },
    backBtn: {
        paddingRight: 14,
        paddingVertical: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    backIcon: {
        width: 40,
        height: 40
    },
    title: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(18),
        color: colors.textPrimary,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        padding: devicewidth * 0.055,
        marginHorizontal: devicewidth * 0.05,
        marginTop: deviceheight * 0.01,
    },
    deviceRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: deviceheight * 0.025,
    },
    deviceIcon: {
        width: 32,
        height: 44,
    },
    deviceTitle: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(16),
        color: colors.textPrimary,
        marginLeft: 14,
    },
    label: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(12),
        color: colors.textPrimary,
        marginBottom: deviceheight * 0.012,
    },
    tokenBox: {
        backgroundColor: colors.tint,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#D8DCFC",
        padding: devicewidth * 0.04,
        marginBottom: deviceheight * 0.02,
    },
    tokenTxt: {
        fontFamily: Fonts.Regular,
        fontSize: RFValue(12),
        color: colors.textPrimary,
        lineHeight: RFValue(20),
    },
    copyBtn: {
        height: deviceheight * 0.062,
        backgroundColor: colors.indigo,
        borderRadius: borderradius * 0.72,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: deviceheight * 0.015,
    },
    copyIcon: {
        width: 18,
        height: 20,
        tintColor: colors.white,
        marginRight: 8,
    },
    copyTxt: {
        fontFamily: Fonts.SemiBold,
        fontSize: RFValue(12),
        color: colors.white,
    },
    successRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: deviceheight * 0.008,
        marginBottom: deviceheight * 0.01,
    },
    checkCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#16A34A",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    checkMark: {
        color: colors.white,
        fontSize: RFValue(10.5),
        fontFamily: Fonts.Bold,
        lineHeight: RFValue(13),
    },
    successTxt: {
        fontFamily: Fonts.Medium,
        fontSize: RFValue(12),
        color: "#16A34A",
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginTop: deviceheight * 0.01,
        marginBottom: deviceheight * 0.02,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    infoCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: colors.indigo,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        marginTop: 1,
    },
    infoI: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(10.5),
        color: colors.indigo,
        lineHeight: RFValue(12),
    },
    infoTxt: {
        fontFamily: Fonts.Regular,
        fontSize: RFValue(12),
        color: colors.textSecondary,
        flex: 1,
        lineHeight: RFValue(17),
    },
});
