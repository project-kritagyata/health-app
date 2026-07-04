import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { ShieldCheck, Check, Square } from "lucide-react-native";
import { useAppData } from "../context/AppDataContext";
import { Button, Card } from "../components/ui";

function CheckRow({ checked, onToggle, children, theme }) {
  return (
    <TouchableOpacity onPress={onToggle} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
      {checked ? <Check size={18} color={theme.primary} /> : <Square size={18} color={theme.muted} />}
      <Text style={{ flex: 1, fontSize: 13, color: theme.ink }}>{children}</Text>
    </TouchableOpacity>
  );
}

export default function ConsentScreen() {
  const { theme, acceptConsent } = useAppData();
  const [t1, setT1] = useState(false);
  const [t2, setT2] = useState(false);
  const [t3, setT3] = useState(false);
  const allChecked = t1 && t2 && t3;

  const blocks = [
    ["Not medical advice", "This app estimates calories, BMI, meal ideas, and exercises for general wellness only. It does not diagnose, treat, or replace advice from a doctor or dietitian — especially for allergies, chronic conditions, or pregnancy."],
    ["AI estimates can be wrong", "Photo-based food detection and calorie counts are AI-generated estimates and may misidentify foods or portions. Always check results before saving, and never rely on the allergy check alone."],
    ["Camera access", "The app asks for camera permission only when you tap the camera in Add Food. You can allow, deny, or revisit this in your device's app settings, and you can always type food in manually instead."],
    ["Your data", "Your profile, food logs, and settings are stored on your device and tied to your signed-in account. Photos are sent to our AI service only at the moment you scan a meal and are not stored afterward."],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, padding: 20, justifyContent: "center" }}>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <ShieldCheck size={20} color={theme.primary} />
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.ink }}>Before you start</Text>
        </View>
        <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 14 }}>Please review and accept the following.</Text>

        <ScrollView style={{ maxHeight: 260, marginBottom: 14 }}>
          {blocks.map(([title, body]) => (
            <View key={title} style={{ backgroundColor: theme.bgSoft, borderRadius: 10, padding: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink, marginBottom: 4 }}>{title}</Text>
              <Text style={{ fontSize: 12, color: theme.muted, lineHeight: 17 }}>{body}</Text>
            </View>
          ))}
        </ScrollView>

        <CheckRow checked={t1} onToggle={() => setT1((v) => !v)} theme={theme}>I have read and accept the Terms of Use.</CheckRow>
        <CheckRow checked={t2} onToggle={() => setT2((v) => !v)} theme={theme}>I have read and accept the Privacy & Data notice above.</CheckRow>
        <CheckRow checked={t3} onToggle={() => setT3((v) => !v)} theme={theme}>I understand this is not medical advice.</CheckRow>

        <Button disabled={!allChecked} onPress={acceptConsent} style={{ marginTop: 8 }}>Agree and continue</Button>
      </Card>
    </View>
  );
}
