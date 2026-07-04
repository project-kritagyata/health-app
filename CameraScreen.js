import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

/**
 * Renders a full-screen live camera. On capture, calls onCapture(uri) with
 * the local file URI of the photo (e.g. "file:///.../Camera/xyz.jpg").
 * Call onClose() to dismiss without capturing.
 */
export default function CameraScreen({ onCapture, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef(null);

  // Permission status hasn't loaded yet
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1F6F5C" />
      </View>
    );
  }

  // Not granted yet — show the runtime request UI
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>
          NutriTrack needs camera access to scan meal photos and estimate calories.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant camera access</Text>
        </TouchableOpacity>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false, exif: false });
      onCapture?.(photo.uri);
    } catch (err) {
      Alert.alert("Camera error", "Could not capture the photo. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.topBar}>
          {onClose && (
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Text style={styles.iconText}>Close</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
          >
            <Text style={styles.iconText}>Flip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.shutter} onPress={takePicture} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <View style={styles.shutterInner} />}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1, justifyContent: "space-between" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#0F1613" },
  msg: { color: "#EAF2EF", textAlign: "center", fontSize: 15, marginBottom: 16 },
  button: { backgroundColor: "#1F6F5C", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  cancel: { color: "#8FA39D", fontSize: 14 },
  topBar: { flexDirection: "row", justifyContent: "space-between", padding: 16, marginTop: 8 },
  iconButton: { backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  iconText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  bottomBar: { alignItems: "center", paddingBottom: 32 },
  shutter: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff" },
});
