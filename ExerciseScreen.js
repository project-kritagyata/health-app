import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { Activity, Dumbbell, Wind, Footprints } from "lucide-react-native";
import { useAppData } from "../context/AppDataContext";
import { Card } from "../components/ui";
import { bmiOf, buildExercisePlan } from "../lib/domain";

function Section({ theme, title, Icon, items, showDuration }) {
  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Icon size={14} color={theme.primary} />
        <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>{title}</Text>
      </View>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
          <Text style={{ fontSize: 12, color: theme.ink }}>{it.name}</Text>
          <Text style={{ fontSize: 12, color: theme.muted }}>{showDuration ? `${it.duration} min` : it.sets} · ~{it.kcal} kcal</Text>
        </View>
      ))}
    </Card>
  );
}

export default function ExerciseScreen() {
  const { theme, profile } = useAppData();
  const bmi = bmiOf(+profile.weightKg, +profile.heightCm);
  const plan = useMemo(() => buildExercisePlan(bmi, profile.goal), [bmi, profile.goal]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View>
        <Text style={{ fontSize: 20, fontWeight: "700", color: theme.ink }}>Exercise recommendations</Text>
        <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
          Based on your BMI category ({plan.category}) and goal ({profile.goal}).
        </Text>
      </View>

      <Section theme={theme} title="Cardio" Icon={Activity} items={plan.cardio} showDuration />
      <Section theme={theme} title="Strength" Icon={Dumbbell} items={plan.strength} />
      <Section theme={theme} title="Flexibility" Icon={Wind} items={plan.flexibility} showDuration />
      <Section theme={theme} title="Balance" Icon={Footprints} items={plan.balance} showDuration />

      <Card>
        <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink, marginBottom: 10 }}>Weekly schedule</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {plan.weekTemplate.map((t, i) => (
            <View key={i} style={{ paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8, backgroundColor: t.includes("Rest") ? theme.bgSoft : "#EAF3F0", width: "13%", alignItems: "center" }}>
              <Text style={{ fontSize: 9, fontWeight: "600", color: t.includes("Rest") ? theme.muted : theme.primary, textAlign: "center" }}>{t}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Text style={{ fontSize: 11, color: theme.muted }}>
        General guidance only — check with a doctor before starting a new routine.
      </Text>
    </ScrollView>
  );
}
