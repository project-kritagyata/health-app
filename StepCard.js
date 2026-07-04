import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import { Footprints } from "lucide-react-native";
import { useAppData } from "../context/AppDataContext";
import { Card, RingGauge, Button } from "./ui";
import { isPedometerAvailable, getStepPermissionStatus, requestStepPermission, getTodayStepCount, subscribeToStepUpdates } from "../lib/steps";

export default function StepCard() {
  const { theme, settings } = useAppData();
  const [status, setStatus] = useState("checking"); // checking | unavailable | needs-permission | denied | ready
  const [baseSteps, setBaseSteps] = useState(0);
  const [liveDelta, setLiveDelta] = useState(0);
  const subRef = useRef(null);

  const startWatching = async () => {
    const initial = await getTodayStepCount();
    setBaseSteps(initial);
    setLiveDelta(0);
    subRef.current = subscribeToStepUpdates((steps) => setLiveDelta(steps));
    setStatus("ready");
  };

  const init = async () => {
    setStatus("checking");
    const available = await isPedometerAvailable();
    if (!available) {
      setStatus("unavailable");
      return;
    }
    const perm = await getStepPermissionStatus();
    if (perm === "granted") {
      await startWatching();
    } else if (perm === "denied") {
      setStatus("denied");
    } else {
      setStatus("needs-permission");
    }
  };

  useEffect(() => {
    init();
    return () => subRef.current?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grant = async () => {
    const result = await requestStepPermission();
    if (result === "granted") await startWatching();
    else setStatus("denied");
  };

  const steps = baseSteps + liveDelta;
  const goal = settings.stepGoal || 10000;

  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Footprints size={14} color={theme.accent} />
        <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>Steps</Text>
      </View>

      {status === "checking" && <Text style={{ fontSize: 12, color: theme.muted }}>Checking step sensor…</Text>}

      {status === "unavailable" && (
        <Text style={{ fontSize: 12, color: theme.muted }}>
          Step counting isn't available on this device (common on simulators — try a real phone).
        </Text>
      )}

      {status === "needs-permission" && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, color: theme.muted }}>Allow motion access to show your daily step count.</Text>
          <Button onPress={grant} style={{ alignSelf: "flex-start" }}>Enable step tracking</Button>
        </View>
      )}

      {status === "denied" && (
        <Text style={{ fontSize: 12, color: theme.muted }}>
          Motion access is off. Enable it for NutriTrack in your device's system settings to see steps here.
        </Text>
      )}

      {status === "ready" && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <RingGauge value={Math.min(steps, goal)} max={goal} color={theme.accent} size={90} stroke={9} label={steps} sub={`of ${goal}`} />
          <Text style={{ fontSize: 12, color: theme.muted, flex: 1 }}>
            {steps >= goal ? "Goal reached — nice work." : `${goal - steps} steps to go today.`}
          </Text>
        </View>
      )}
    </Card>
  );
}
