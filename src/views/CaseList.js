import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
} from "react-native";
import { colors } from "../components/colors";
import { Fonts } from "../components/fonts";
import { Images } from "../components/images";
import { devicewidth, deviceheight } from "../components/Dimensions";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const initialCases = [
    {
        id: "CASE1005",
        desc: "A new service case has been assigned",
        status: "NEW",
        isNew: true,
    },
    {
        id: "CASE1004",
        desc: "Printer service request",
        status: "Open",
        isNew: false,
    },
    {
        id: "CASE1003",
        desc: "AC maintenance visit",
        status: "Open",
        isNew: false,
    },
    {
        id: "CASE1002",
        desc: "Router replacement",
        status: "Done",
        isNew: false,
    },
];

const CaseList = () => {
    const navigation = useNavigation();
    const [cases, setCases] = useState(initialCases);

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
                data={cases}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
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
