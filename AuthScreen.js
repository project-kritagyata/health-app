import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth, isExpoGo } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { Button } from "../components/ui";

export default function AuthScreen() {
  const { signInPreview } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NutriTrack</Text>
      <Text style={styles.subtitle}>Sign in to keep your profile and food log saved.</Text>
      <View style={styles.buttonWrap}>
        <GoogleSignInButton />

        {isExpoGo && (
          <>
            <Text style={styles.divider}>Running in Expo Go</Text>
            <Text style={styles.hint}>
              Google Sign-In needs a native dev build. Use preview mode to look
              around the app right now — this skips real sign-in and doesn't
              touch Supabase or Google.
            </Text>
            <Button variant="secondary" onPress={signInPreview} style={{ marginTop: 10 }}>
              Continue in preview mode
            </Button>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#131A18", alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: "#EAF2EF", fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#8FA39D", fontSize: 14, marginBottom: 28, textAlign: "center" },
  buttonWrap: { width: "100%", maxWidth: 320 },
  divider: { color: "#8FA39D", fontSize: 11, fontWeight: "700", textTransform: "uppercase", textAlign: "center", marginTop: 22, marginBottom: 8 },
  hint: { color: "#8FA39D", fontSize: 12, textAlign: "center", lineHeight: 17 },
});
