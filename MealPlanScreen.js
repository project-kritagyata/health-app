import React, { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Sparkles, Salad, ShieldCheck } from "lucide-react-native";
import { useAppData } from "../context/AppDataContext";
import { Card, Button } from "../components/ui";
import { AIService } from "../lib/aiService";

export default function MealPlanScreen() {
  const { theme, profile, calorieTarget, macros, mealPlan, saveMealPlan } = useAppData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true); setError("");
    try {
      const result = await AIService.generateMealPlan(profile, calorieTarget, macros);
      await saveMealPlan({ ...result, generatedAt: Date.now() });
    } catch {
      setError("Couldn't generate a meal plan. Check that config.js API_BASE_URL points to your deployed backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: theme.ink }}>Meal plan</Text>
          <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>
            Target: {calorieTarget} kcal · {macros.protein}g P · {macros.carbs}g C · {macros.fat}g F
          </Text>
        </View>
        <Button onPress={generate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : (mealPlan ? "Regenerate" : "Generate")}
        </Button>
      </View>

      {profile.allergies?.length > 0 && (
        <Card style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
          <ShieldCheck size={16} color={theme.primary} />
          <Text style={{ fontSize: 12, color: theme.ink, flex: 1 }}>Avoiding: {profile.allergies.join(", ")}. Always double check ingredients yourself.</Text>
        </Card>
      )}

      {error !== "" && (
        <Card><Text style={{ fontSize: 12, color: theme.danger }}>{error}</Text></Card>
      )}

      {!mealPlan && !loading && !error && (
        <Card style={{ alignItems: "center", paddingVertical: 26, gap: 8 }}>
          <Salad size={26} color={theme.primary} />
          <Text style={{ fontSize: 12, color: theme.muted, textAlign: "center" }}>No meal plan yet — generate one based on your profile and goal.</Text>
        </Card>
      )}

      {mealPlan?.meals?.map((m, i) => (
        <Card key={i}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: theme.primary, textTransform: "uppercase" }}>{m.meal}</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>{m.calories} kcal</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: "600", color: theme.ink, marginBottom: 4 }}>{m.name}</Text>
          <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>{m.items?.join(", ")}</Text>
          <Text style={{ fontSize: 11, color: theme.muted }}>{m.protein_g}g P · {m.carbs_g}g C · {m.fat_g}g F</Text>
        </Card>
      ))}

      {mealPlan && (
        <Card style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>Total</Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.primary }}>{mealPlan.totalCalories} kcal</Text>
        </Card>
      )}
      {mealPlan?.notes && <Text style={{ fontSize: 11, color: theme.muted, fontStyle: "italic" }}>{mealPlan.notes}</Text>}
    </ScrollView>
  );
}
