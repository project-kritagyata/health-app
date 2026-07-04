import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { AlertTriangle } from "lucide-react-native";
import { useAppData } from "../context/AppDataContext";

export function Button({ children, onPress, variant = "primary", disabled, style }) {
  const { theme } = useAppData();
  const bg = variant === "primary" ? theme.primary : variant === "danger" ? theme.danger : variant === "secondary" ? theme.card : "transparent";
  const border = variant === "secondary" ? theme.border : "transparent";
  const color = variant === "ghost" ? theme.primary : variant === "secondary" ? theme.ink : "#fff";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[{ backgroundColor: bg, borderColor: border, borderWidth: variant === "secondary" ? 1 : 0, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 16, opacity: disabled ? 0.4 : 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }, style]}
    >
      {typeof children === "string" ? <Text style={{ color, fontWeight: "600", fontSize: 13 }}>{children}</Text> : children}
    </TouchableOpacity>
  );
}

export function Card({ children, style }) {
  const { theme } = useAppData();
  return (
    <View style={[{ backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16 }, style]}>
      {children}
    </View>
  );
}

export function Field({ label, hint, children }) {
  const { theme } = useAppData();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: theme.muted, marginBottom: 6, textTransform: "uppercase" }}>{label}</Text>
      {children}
      {hint && <Text style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>{hint}</Text>}
    </View>
  );
}

export function TextField(props) {
  const { theme } = useAppData();
  return (
    <TextInput
      placeholderTextColor={theme.muted}
      style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: theme.ink, backgroundColor: theme.bgSoft }}
      {...props}
    />
  );
}

export function Segmented({ options, value, onChange }) {
  const { theme } = useAppData();
  return (
    <View style={{ flexDirection: "row", backgroundColor: theme.bgSoft, borderRadius: 10, padding: 3, gap: 3 }}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          onPress={() => onChange(o.value)}
          style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: value === o.value ? theme.card : "transparent" }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: value === o.value ? theme.primary : theme.muted }}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function RingGauge({ value, max, color, size = 120, stroke = 12, label, sub }) {
  const { theme } = useAppData();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const offset = c * (1 - pct);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.bgSoft} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color || theme.primary} strokeWidth={stroke} fill="none" strokeDasharray={`${c}`} strokeDashoffset={offset} strokeLinecap="round" />
      </Svg>
      <Text style={{ fontSize: 20, fontWeight: "700", color: theme.ink }}>{label}</Text>
      {sub && <Text style={{ fontSize: 11, color: theme.muted }}>{sub}</Text>}
    </View>
  );
}

export function BMIStrip({ bmi }) {
  const zones = [
    { to: 18.5, color: "#3B82C4" },
    { to: 25, color: "#1F6F5C" },
    { to: 30, color: "#E8A33D" },
    { to: 40, color: "#C1443C" },
  ];
  const min = 14, max = 40;
  const pct = Math.max(0, Math.min(1, (bmi - min) / (max - min)));
  return (
    <View>
      <View style={{ height: 10, borderRadius: 5, overflow: "hidden", flexDirection: "row" }}>
        {zones.map((z, i) => {
          const prevTo = i === 0 ? min : zones[i - 1].to;
          const width = ((Math.min(z.to, max) - Math.max(prevTo, min)) / (max - min)) * 100;
          return <View key={i} style={{ width: `${width}%`, backgroundColor: z.color }} />;
        })}
      </View>
      <View style={{ height: 10, marginTop: 2 }}>
        <View style={{ position: "absolute", left: `${pct * 100}%`, width: 2, height: 10, backgroundColor: "#182C28" }} />
      </View>
    </View>
  );
}

export function AllergyBadge({ allergens }) {
  if (!allergens?.length) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FBEAE8", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, alignSelf: "flex-start" }}>
      <AlertTriangle size={12} color="#C1443C" />
      <Text style={{ fontSize: 11, fontWeight: "600", color: "#C1443C" }}>Contains {allergens.join(", ")}</Text>
    </View>
  );
}
