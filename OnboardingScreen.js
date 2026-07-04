import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";
import { useAppData } from "../context/AppDataContext";
import { Button, Card, Field, TextField, Segmented } from "../components/ui";
import { COMMON_ALLERGENS, ACTIVITY_LABEL, bmiOf, bmiCategory } from "../lib/domain";

export default function OnboardingScreen() {
  const { theme, saveProfile } = useAppData();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", age: "", gender: "female", heightCm: "", weightKg: "",
    activityLevel: "moderate", goal: "maintain", allergies: [],
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const steps = ["Basics", "Body stats", "Activity & goal", "Allergies"];

  const toggleAllergy = (a) => setForm((f) => ({ ...f, allergies: f.allergies.includes(a) ? f.allergies.filter((x) => x !== a) : [...f.allergies, a] }));

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.age > 0 && form.age < 120;
    if (step === 1) return form.heightCm > 0 && form.weightKg > 0;
    return true;
  };

  const bmi = form.heightCm > 0 && form.weightKg > 0 ? bmiOf(+form.weightKg, +form.heightCm) : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, padding: 20, justifyContent: "center" }}>
      <Card>
        <View style={{ flexDirection: "row", gap: 4, marginBottom: 12 }}>
          {steps.map((s, i) => (
            <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? theme.primary : theme.bgSoft }} />
          ))}
        </View>
        <Text style={{ fontSize: 11, fontWeight: "700", color: theme.primary, textTransform: "uppercase", marginBottom: 4 }}>
          Step {step + 1} of {steps.length} — {steps[step]}
        </Text>

        <ScrollView style={{ maxHeight: 380 }}>
          {step === 0 && (
            <>
              <Field label="Name"><TextField value={form.name} onChangeText={(v) => set("name", v)} placeholder="Your name" /></Field>
              <Field label="Age"><TextField value={form.age} onChangeText={(v) => set("age", v)} placeholder="e.g. 29" keyboardType="number-pad" /></Field>
              <Field label="Gender (used for calorie calculation)">
                <Segmented value={form.gender} onChange={(v) => set("gender", v)} options={[{ value: "female", label: "Female" }, { value: "male", label: "Male" }]} />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Height (cm)"><TextField value={form.heightCm} onChangeText={(v) => set("heightCm", v)} placeholder="e.g. 165" keyboardType="number-pad" /></Field>
              <Field label="Weight (kg)"><TextField value={form.weightKg} onChangeText={(v) => set("weightKg", v)} placeholder="e.g. 60" keyboardType="number-pad" /></Field>
              {bmi != null && (
                <View style={{ backgroundColor: theme.bgSoft, borderRadius: 10, padding: 10 }}>
                  <Text style={{ fontSize: 13, color: theme.ink }}>Your BMI would be {bmi.toFixed(1)} — {bmiCategory(bmi).label}</Text>
                </View>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Activity level">
                <Segmented
                  value={form.activityLevel}
                  onChange={(v) => set("activityLevel", v)}
                  options={[{ value: "sedentary", label: "Low" }, { value: "moderate", label: "Moderate" }, { value: "active", label: "High" }]}
                />
                <Text style={{ fontSize: 11, color: theme.muted, marginTop: 6 }}>{ACTIVITY_LABEL[form.activityLevel]}</Text>
              </Field>
              <Field label="Goal">
                <Segmented value={form.goal} onChange={(v) => set("goal", v)} options={[{ value: "lose", label: "Lose" }, { value: "maintain", label: "Maintain" }, { value: "gain", label: "Gain" }]} />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 10 }}>We'll warn you when a scanned or logged food may contain these.</Text>
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
            </>
          )}
        </ScrollView>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}>
          {step > 0 ? (
            <Button variant="ghost" onPress={() => setStep((s) => s - 1)}>Back</Button>
          ) : <View />}
          {step < steps.length - 1 ? (
            <Button disabled={!canNext()} onPress={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onPress={() => saveProfile(form)}>Finish setup</Button>
          )}
        </View>
      </Card>
    </View>
  );
}
