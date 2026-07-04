import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileHeader() {
  const { profile, signOut } = useAuth();
  if (!profile) return null;

  return (
    <View style={styles.container}>
      {profile.avatarUrl ? (
        <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>{(profile.name || profile.email || "?")[0].toUpperCase()}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{profile.name || "Signed in"}</Text>
        <Text style={styles.email} numberOfLines={1}>{profile.email}</Text>
      </View>
      <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: "#1A2422", borderRadius: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: "#1F6F5C", alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: "#fff", fontWeight: "700" },
  name: { color: "#EAF2EF", fontWeight: "600", fontSize: 14 },
  email: { color: "#8FA39D", fontSize: 12 },
  logoutButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#2A3835" },
  logoutText: { color: "#EAF2EF", fontSize: 12, fontWeight: "600" },
});
