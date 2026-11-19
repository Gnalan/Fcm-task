import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
} from "react-native";
import { colors } from "../components/colors";
import { Fonts } from "../components/fonts";
import { devicewidth, deviceheight, borderradius } from "../components/Dimensions";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";


const CaseDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const item = route.params?.item || {
        id: "CASE1005",
        desc: "A new service case has been assigned",
        status: "NEW",
    };

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
                        <Text style={styles.backTxt}>Back</Text>
                    </TouchableOpacity>

                    {/* Header Row */}
                    <View style={styles.headRow}>
                        <Text style={styles.idTxt}>{item.id}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeTxt}>{item.status}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text style={styles.descTxt}>{item.desc}</Text>

                    {/* Info Card */}
                    <View style={styles.card}>
                        <View style={styles.itemRow}>
                            <Text style={styles.label}>Title</Text>
                            <Text style={styles.val}>New Case Received</Text>
                        </View>

                        <View style={styles.itemRow}>
                            <Text style={styles.label}>Case ID</Text>
                            <Text style={styles.val}>{item.id}</Text>
                        </View>

                        <View style={styles.itemRow}>
                            <Text style={styles.label}>Received</Text>
                            <Text style={styles.val}>Just now</Text>
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
        paddingVertical: deviceheight * 0.055,
        alignSelf: "flex-start",
    },
    backTxt: {
        fontFamily: Fonts.Medium,
        fontSize: RFValue(14),
        color: colors.indigo,
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
    },
    badge: {
        backgroundColor: colors.indigo,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeTxt: {
        fontFamily: Fonts.Bold,
        fontSize: RFValue(11),
        color: colors.white,
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
