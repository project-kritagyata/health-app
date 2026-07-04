import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function GoogleSignInButton() {
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);

  const handlePress = async () => {
    setBusy(true);
    try {
      await signIn();
    } catch (err) {
      Alert.alert("Sign-in failed", err?.message || "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} disabled={busy}>
      {busy ? (
        <ActivityIndicator color="#182C28" />
      ) : (
        <View style={styles.row}>
          <Text style={styles.g}>G</Text>
          <Text style={styles.text}>Continue with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#DEE6E1",
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  g: { fontWeight: "800", color: "#4285F4", fontSize: 16 },
  text: { fontWeight: "600", color: "#182C28", fontSize: 14 },
});
