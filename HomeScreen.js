import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Flame, Scale, Droplet, Minus, Plus, Footprints } from "lucide-react-native";
import { useAppData } from "../context/AppDataContext";
import { Card, RingGauge, BMIStrip, Button } from "../components/ui";
import { bmiOf, bmiCategory, idealWeightRange, todayKey } from "../lib/domain";
import { isPedometerAvailable, getStepPermissionStatus, requestStepPermission, getTodayStepCount, subscribeToStepUpdates } from "../lib/steps";

function StepCard({ theme, stepGoal }) {
  const [status, setStatus] = useState("loading"); // loading | ready | denied | unavailable
  const [baseSteps, setBaseSteps] = useState(0);
  const [liveDelta, setLiveDelta] = useState(0);
  const unsubscribeRef = useRef(null);

  const start = async () => {
    setStatus("loading");
    const available = await isPedometerAvailable();
    if (!available) {
      setStatus("unavailable"); // e.g. simulators, or devices with no step sensor
      return;
    }
    let permission = await getStepPermissionStatus();
    if (permission !== "granted") permission = await requestStepPermission();
    if (permission !== "granted") {
      setStatus("denied");
      return;
    }
    const initial = await getTodayStepCount();
    setBaseSteps(initial);
    setLiveDelta(0);
    unsubscribeRef.current = subscribeToStepUpdates((delta) => setLiveDelta(delta));
    setStatus("ready");
  };

  useEffect(() => {
    start();
    return () => unsubscribeRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = baseSteps + liveDelta;

  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Footprints size={14} color={theme.primary} />
        <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>Steps today</Text>
      </View>

      {status === "loading" && (
        <View style={{ paddingVertical: 14, alignItems: "center" }}>
          <ActivityIndicator color={theme.primary} />
        </View>
      )}

      {status === "ready" && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <RingGauge value={Math.min(steps, stepGoal)} max={stepGoal} color={theme.primary} size={90} stroke={9} label={steps} sub={`of ${stepGoal.toLocaleString()}`} />
          <Text style={{ flex: 1, fontSize: 12, color: theme.muted }}>
            {steps >= stepGoal ? "Goal reached — nice work!" : `${stepGoal - steps} steps to go`}
          </Text>
        </View>
      )}

      {status === "unavailable" && (
        <Text style={{ fontSize: 12, color: theme.muted }}>
          Step counting isn't available on this device (common on simulators — try a real phone).
        </Text>
      )}

      {status === "denied" && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: theme.muted }}>
            Motion & Fitness permission was denied, so steps can't be counted. Enable it in your device's system settings for this app, then retry.
          </Text>
          <Button variant="secondary" onPress={start} style={{ alignSelf: "flex-start" }}>Retry</Button>
        </View>
      )}
    </Card>
  );
}

export default function HomeScreen() {
  const { theme, profile, entriesByDate, calorieTarget, waterByDate, settings, addWater } = useAppData();
  const todayEntries = entriesByDate[todayKey()] || [];
  const consumed = todayEntries.reduce((s, e) => s + (Number(e.calories) || 0), 0);
  const remaining = Math.max(0, calorieTarget - consumed);
  const bmi = bmiOf(+profile.weightKg, +profile.heightCm);
  const cat = bmiCategory(bmi);
  const ideal = idealWeightRange(+profile.heightCm);
  const waterMl = waterByDate[todayKey()] || 0;
  const waterGoal = settings.waterGoalMl;
  const cups = Math.round(waterMl / 250);
  const goalCups = Math.round(waterGoal / 250);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View>
        <Text style={{ fontSize: 22, fontWeight: "700", color: theme.ink }}>Hi {profile.name}</Text>
      </View>

      <Card style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <RingGauge value={Math.min(consumed, calorieTarget)} max={calorieTarget} color={theme.primary} size={110} stroke={11} label={consumed} sub={`of ${calorieTarget} kcal`} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Flame size={14} color={theme.accent} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>Today's calories</Text>
          </View>
          <Text style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>{remaining} kcal remaining</Text>
          <Text style={{ fontSize: 11, color: theme.muted, marginTop: 6 }}>{todayEntries.length} item{todayEntries.length !== 1 ? "s" : ""} logged today</Text>
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Droplet size={14} color="#3B82C4" />
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>Water intake</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <RingGauge value={Math.min(waterMl, waterGoal)} max={waterGoal} color="#3B82C4" size={90} stroke={9} label={cups} sub={`of ${goalCups} cups`} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 8 }}>{waterMl} / {waterGoal} ml today</Text>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <TouchableOpacity onPress={() => addWater(todayKey(), -250)} style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: theme.border, alignItems: "center", justifyContent: "center" }}>
                <Minus size={14} color={theme.ink} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => addWater(todayKey(), 250)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#3B82C4", alignItems: "center", justifyContent: "center" }}>
                <Plus size={14} color="#fff" />
              </TouchableOpacity>
              <Text style={{ fontSize: 11, color: theme.muted }}>+1 cup (250 ml)</Text>
            </View>
          </View>
        </View>
      </Card>

      <StepCard theme={theme} stepGoal={settings.stepGoal} />

      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Scale size={14} color={theme.primary} />
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>BMI — {cat.label}</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: "700", color: cat.color, marginBottom: 10 }}>{bmi.toFixed(1)}</Text>
        <BMIStrip bmi={bmi} />
        {ideal && (
          <Text style={{ fontSize: 11, color: theme.muted, marginTop: 10 }}>
            Healthy weight range for your height: {ideal.min.toFixed(1)}–{ideal.max.toFixed(1)} kg
          </Text>
        )}
      </Card>

      <Card>
        <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink, marginBottom: 10 }}>Recent entries</Text>
        {todayEntries.length === 0 ? (
          <Text style={{ fontSize: 12, color: theme.muted }}>Nothing logged yet today — scan a meal or add one manually.</Text>
        ) : (
          todayEntries.slice(-4).reverse().map((e) => (
            <View key={e.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
              <Text style={{ fontSize: 12, color: theme.ink }}>{e.name} <Text style={{ color: theme.muted }}>· {e.quantity}</Text></Text>
              <Text style={{ fontSize: 12, color: theme.muted }}>{e.calories} kcal</Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}
