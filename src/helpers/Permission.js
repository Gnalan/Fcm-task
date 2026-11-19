//persmission helper
import { Platform, Alert } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

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
      // Android 13+ (API 33+)
      if (Platform.Version >= 33) {
        // For Android 13+, reading/writing documents (like PDFs) in public directories 
        // or using the Storage Access Framework does not require runtime permissions.
        // READ_MEDIA_* permissions are strictly for images, video, and audio.
        return true;
      } 
      // Android 12 and below
      else {
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
