import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Home, ListPlus, Salad, Dumbbell, User } from "lucide-react-native";
import { useAppData } from "../context/AppDataContext";

const TABS = [
  { key: "home", label: "Home", Icon: Home },
  { key: "addfood", label: "Add Food", Icon: ListPlus },
  { key: "mealplan", label: "Meals", Icon: Salad },
  { key: "exercise", label: "Exercise", Icon: Dumbbell },
  { key: "profile", label: "Profile", Icon: User },
];

export default function TabBar({ active, onChange }) {
  const { theme } = useAppData();
  return (
    <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: theme.border, backgroundColor: theme.card, paddingVertical: 8, paddingBottom: 18 }}>
      {TABS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <TouchableOpacity key={key} onPress={() => onChange(key)} style={{ flex: 1, alignItems: "center", gap: 2 }}>
            <Icon size={18} color={isActive ? theme.primary : theme.muted} />
            <Text style={{ fontSize: 10, fontWeight: "600", color: isActive ? theme.primary : theme.muted }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
