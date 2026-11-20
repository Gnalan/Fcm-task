import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  StatusBar,
  Alert,
  AppState,
  ActivityIndicator,
} from "react-native";
import { colors } from "../components/colors";
import { useNavigation } from "@react-navigation/native";
import { Fonts } from "../components/fonts";
import { devicewidth, deviceheight, borderradius } from "../components/Dimensions";
import { Images } from "../components/images";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  checkNotificationPermission,
  requestNotificationPermission,
  openSettings,
} from "../helpers/Permission";
import {
  getMessaging,
  registerDeviceForRemoteMessages,
  getToken,
} from "@react-native-firebase/messaging";

const Welcome = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const navigateToCaseList = useCallback(() => {
    navigation.navigate("CaseList");
  }, [navigation]);

  const getFcmToken = async () => {
    try {
      const messaging = getMessaging();
      await registerDeviceForRemoteMessages(messaging);
      const token = await getToken(messaging);
      console.log("FCM Token:", token);
      return token;
    } catch (error) {
      console.log("Error getting FCM Token:", error);
    }
  };

  useEffect(() => {
    // 1. Check if permission is already granted on app launch
    const checkInitial = async () => {
      const status = await checkNotificationPermission();
      if (status === "granted") {
        await getFcmToken();
        navigateToCaseList();
      }
    };
    checkInitial();

    // 2. Re-check status when user returns from Settings
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "active") {
        const status = await checkNotificationPermission();
        if (status === "granted") {
          await getFcmToken();
          navigateToCaseList();
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [navigateToCaseList]);

  const showPermissionOffAlert = () => {
    Alert.alert(
      "Notifications are off",
      "Allow notifications to get new cases instantly.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            openSettings().catch((err) =>
              console.log("Unable to open settings:", err)
            );
          },
        },
      ]
    );
  };

  const onAllowNotifications = async () => {
    if (loading) return; // Guard against double taps
    setLoading(true);

    try {
      const status = await requestNotificationPermission();

      if (status === "granted") {
        await getFcmToken();
        navigateToCaseList();
      } else if (status === "denied" || status === "blocked") {
        showPermissionOffAlert();
      }
    } catch (err) {
      console.log("Permission request error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onNotNow = () => {
    showPermissionOffAlert();
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
              (pressed || loading) && styles.buttonPressed,
            ]}
            onPress={onAllowNotifications}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Allow notifications"
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Allow notifications</Text>
            )}
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
    fontSize: RFValue(18),
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: deviceheight * 0.015,
  },
  subheading: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue(13),
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
