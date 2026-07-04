import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Pencil, Check, Droplet, LogOut } from "lucide-react-native";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Field, TextField, Segmented } from "../components/ui";
import { COMMON_ALLERGENS, ACTIVITY_LABEL } from "../lib/domain";

export default function ProfileScreen() {
  const { theme, profile, saveProfile, settings, updateSettings, resetAllData } = useAppData();
  const { profile: authProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);

  const toggleAllergy = (a) => setForm((f) => ({ ...f, allergies: f.allergies.includes(a) ? f.allergies.filter((x) => x !== a) : [...f.allergies, a] }));

  const confirmReset = () => {
    Alert.alert("Delete all data", "This permanently removes your profile and food logs. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: resetAllData },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: theme.ink }}>Profile</Text>
        {!editing ? (
          <Button variant="secondary" onPress={() => { setForm(profile); setEditing(true); }}><Pencil size={13} color={theme.ink} /></Button>
        ) : (
          <Button onPress={() => { saveProfile(form); setEditing(false); }}><Check size={13} color="#fff" /></Button>
        )}
      </View>

      <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {authProfile?.avatarUrl ? (
          <Image source={{ uri: authProfile.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{(authProfile?.name || "?")[0]?.toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: theme.ink }}>{authProfile?.name}</Text>
          <Text style={{ fontSize: 11, color: theme.muted }}>{authProfile?.email}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: theme.bgSoft, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 }}>
          <LogOut size={13} color={theme.ink} />
          <Text style={{ fontSize: 11, fontWeight: "600", color: theme.ink }}>Log out</Text>
        </TouchableOpacity>
      </Card>

      {!editing ? (
        <Card>
          {[
            ["Age", profile.age], ["Gender", profile.gender], ["Height", `${profile.heightCm} cm`],
            ["Weight", `${profile.weightKg} kg`], ["Activity", ACTIVITY_LABEL[profile.activityLevel]],
            ["Goal", `${profile.goal} weight`], ["Allergies", profile.allergies?.length ? profile.allergies.join(", ") : "None listed"],
          ].map(([label, value]) => (
            <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }}>
              <Text style={{ fontSize: 12, color: theme.muted }}>{label}</Text>
              <Text style={{ fontSize: 12, color: theme.ink, fontWeight: "600" }}>{value}</Text>
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          <Field label="Age"><TextField value={String(form.age)} onChangeText={(v) => setForm((f) => ({ ...f, age: v }))} keyboardType="number-pad" /></Field>
          <Field label="Height (cm)"><TextField value={String(form.heightCm)} onChangeText={(v) => setForm((f) => ({ ...f, heightCm: v }))} keyboardType="number-pad" /></Field>
          <Field label="Weight (kg)"><TextField value={String(form.weightKg)} onChangeText={(v) => setForm((f) => ({ ...f, weightKg: v }))} keyboardType="number-pad" /></Field>
          <Field label="Goal">
            <Segmented value={form.goal} onChange={(v) => setForm((f) => ({ ...f, goal: v }))} options={[{ value: "lose", label: "Lose" }, { value: "maintain", label: "Maintain" }, { value: "gain", label: "Gain" }]} />
          </Field>
          <Text style={{ fontSize: 11, fontWeight: "700", color: theme.muted, textTransform: "uppercase", marginBottom: 8 }}>Allergies</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {COMMON_ALLERGENS.map((a) => {
              const on = form.allergies.includes(a);
              return (
                <TouchableOpacity key={a} onPress={() => toggleAllergy(a)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: on ? theme.danger : theme.border, backgroundColor: on ? theme.danger : "transparent" }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: on ? "#fff" : theme.ink }}>{a}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      )}

      <Card>
        <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink, marginBottom: 12 }}>App settings</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: theme.ink }}>Appearance</Text>
          <Segmented value={settings.theme} onChange={(v) => updateSettings({ ...settings, theme: v })} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: theme.ink }}>Daily water goal</Text>
          <Segmented
            value={settings.waterGoalMl}
            onChange={(v) => updateSettings({ ...settings, waterGoalMl: v })}
            options={[{ value: 1500, label: "1.5L" }, { value: 2000, label: "2L" }, { value: 2500, label: "2.5L" }]}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: theme.ink }}>Daily step goal</Text>
          <Segmented
            value={settings.stepGoal}
            onChange={(v) => updateSettings({ ...settings, stepGoal: v })}
            options={[{ value: 6000, label: "6k" }, { value: 10000, label: "10k" }, { value: 15000, label: "15k" }]}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Droplet size={13} color="#3B82C4" />
            <Text style={{ fontSize: 12, color: theme.ink }}>Water reminders</Text>
          </View>
          <TouchableOpacity
            onPress={() => updateSettings({ ...settings, waterReminder: { ...settings.waterReminder, enabled: !settings.waterReminder.enabled } })}
            style={{ width: 42, height: 24, borderRadius: 12, backgroundColor: settings.waterReminder.enabled ? theme.primary : theme.border, justifyContent: "center" }}
          >
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#fff", marginLeft: settings.waterReminder.enabled ? 21 : 3 }} />
          </TouchableOpacity>
        </View>
      </Card>

      <Card>
        <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink, marginBottom: 6 }}>Data & privacy</Text>
        <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 10 }}>Delete your profile and all logs from this device.</Text>
        <Button variant="danger" onPress={confirmReset} style={{ alignSelf: "flex-start" }}>Delete all my data</Button>
      </Card>
    </ScrollView>
  );
}
