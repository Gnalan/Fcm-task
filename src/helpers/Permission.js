import { Platform, Alert } from "react-native";
import {
  check,
  request,
  checkNotifications,
  requestNotifications,
  openSettings,
  PERMISSIONS,
  RESULTS,
} from "react-native-permissions";

export { openSettings };

const mapPermissionStatus = (status) => {
  switch (status) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return "granted";
    case RESULTS.DENIED:
      return "denied";
    case RESULTS.BLOCKED:
      return "blocked";
    case RESULTS.UNAVAILABLE:
    default:
      return "unavailable";
  }
};

/**
 * Check current notification permission status
 * @returns {Promise<'granted' | 'denied' | 'blocked' | 'unavailable'>}
 */
export const checkNotificationPermission = async () => {
  try {
    // Android < 13 does not have POST_NOTIFICATIONS runtime permission; enabled by default
    if (Platform.OS === "android" && Platform.Version < 33) {
      return "granted";
    }

    const { status } = await checkNotifications();
    return mapPermissionStatus(status);
  } catch (error) {
    console.log("Notification check error:", error);
    return "unavailable";
  }
};

/**
 * Request notification permission (alert, badge, sound)
 * Shows system popup on Android 13+ (API 33+) and iOS.
 * @returns {Promise<'granted' | 'denied' | 'blocked' | 'unavailable'>}
 */
export const requestNotificationPermission = async () => {
  try {
    // Android < 13 does not have POST_NOTIFICATIONS runtime permission; treated as granted
    if (Platform.OS === "android" && Platform.Version < 33) {
      return "granted";
    }

    const { status } = await requestNotifications(["alert", "badge", "sound"]);
    return mapPermissionStatus(status);
  } catch (error) {
    console.log("Notification request error:", error);
    return "unavailable";
  }
};

/**
 * Request storage permission for downloading or file access
 * @returns {Promise<boolean>} true if granted, false otherwise
 */
export const requestStoragePermission = async () => {
  try {
    if (Platform.OS === "ios") {
      return true;
    }

    if (Platform.OS === "android") {
      if (Platform.Version >= 33) {
        return true;
      } else {
        const permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
        const status = await check(permission);

        if (status === RESULTS.GRANTED) {
          return true;
        }

        const reqStatus = await request(permission);

        if (reqStatus === RESULTS.GRANTED) {
          return true;
        } else {
          Alert.alert(
            "Permission Denied",
            "Storage permission is required to download or upload files."
          );
          return false;
        }
      }
    }

    return false;
  } catch (error) {
    console.log("Permission check error:", error);
    return false;
  }
};
