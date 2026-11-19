import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  StatusBar,
} from "react-native";
import { colors } from "../components/colors";
import { useNavigation } from "@react-navigation/native";
import { Fonts } from "../components/fonts";
import { devicewidth, deviceheight, borderradius } from "../components/Dimensions";
import { Images } from "../components/images";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Welcome = () => {
  const navigation = useNavigation();

  const onAllowNotifications = () => {
    navigation.navigate("CaseList");
  };

  const onNotNow = () => {
    // Placeholder handler for dismissing/skipping permission request
    console.log("Not now pressed");
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.container}>
        {/* Upper content: Bell icon and description */}
        <View style={styles.contentContainer}>
          <View style={styles.iconCircle}>
            <Image
              source={Images.notificationicon}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.heading}>Never miss a case</Text>
          <Text style={styles.subheading}>
            Get notified the moment a new service{"\n"}case is assigned to you.
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onAllowNotifications}
            accessibilityRole="button"
            accessibilityLabel="Allow notifications"
          >
            <Text style={styles.primaryButtonText}>Allow notifications</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.textButtonPressed,
            ]}
            onPress={onNotNow}
            accessibilityRole="button"
            accessibilityLabel="Not now"
          >
            <Text style={styles.secondaryButtonText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaProvider>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: devicewidth * 0.06,
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: deviceheight * 0.06,
  },
  iconCircle: {
    width: devicewidth * 0.32,
    height: devicewidth * 0.32,
    borderRadius: (devicewidth * 0.42) * 0.5,
    backgroundColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: deviceheight * 0.045,
  },
  icon: {
    width: devicewidth * 0.18,
    height: devicewidth * 0.18,
    tintColor: colors.indigo,
  },
  heading: {
    fontFamily: Fonts.Bold,
    fontSize: RFValue(22),
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: deviceheight * 0.015,
  },
  subheading: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue(13.5),
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: RFValue(20),
    paddingHorizontal: devicewidth * 0.04,
  },
  actionContainer: {
    width: "100%",
    paddingBottom: deviceheight * 0.045,
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    height: deviceheight * 0.065,
    backgroundColor: colors.indigo,
    borderRadius: borderradius * 0.72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: deviceheight * 0.012,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    fontFamily: Fonts.SemiBold,
    fontSize: RFValue(13),
    color: colors.white,
  },
  secondaryButton: {
    width: "100%",
    height: deviceheight * 0.06,
    alignItems: "center",
    justifyContent: "center",
  },
  textButtonPressed: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontFamily: Fonts.Medium,
    fontSize: RFValue(13),
    color: colors.textSecondary,
  },
});
