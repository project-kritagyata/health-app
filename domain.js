export const COMMON_ALLERGENS = [
  "Peanuts", "Tree nuts", "Milk / Dairy", "Eggs", "Wheat / Gluten",
  "Soy", "Fish", "Shellfish", "Sesame",
];

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
export function niceDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function bmiOf(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return weightKg / (h * h);
}
export function bmiCategory(bmi) {
  if (bmi == null || isNaN(bmi)) return null;
  if (bmi < 18.5) return { label: "Underweight", color: "#3B82C4" };
  if (bmi < 25) return { label: "Healthy weight", color: "#1F6F5C" };
  if (bmi < 30) return { label: "Overweight", color: "#E8A33D" };
  return { label: "Obese", color: "#C1443C" };
}
export function idealWeightRange(heightCm) {
  if (!heightCm) return null;
  const h = heightCm / 100;
  return { min: 18.5 * h * h, max: 24.9 * h * h };
}

function bmr({ gender, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "female" ? base - 161 : base + 5;
}
export const ACTIVITY_MULT = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};
export const ACTIVITY_LABEL = {
  sedentary: "Sedentary (little/no exercise)",
  light: "Light (1–3 days/week)",
  moderate: "Moderate (3–5 days/week)",
  active: "Active (6–7 days/week)",
  very_active: "Very active (physical job / 2x day)",
};
export function calorieTargetOf(profile) {
  const tdee = bmr(profile) * ACTIVITY_MULT[profile.activityLevel];
  let target = tdee;
  if (profile.goal === "lose") target = tdee - 500;
  if (profile.goal === "gain") target = tdee + 400;
  const floor = profile.gender === "female" ? 1200 : 1500;
  return Math.round(Math.max(target, floor));
}
export function macrosOf(calorieTarget) {
  return {
    protein: Math.round((calorieTarget * 0.3) / 4),
    carbs: Math.round((calorieTarget * 0.4) / 4),
    fat: Math.round((calorieTarget * 0.3) / 9),
  };
}

export function matchesAllergy(foodName, allergies) {
  if (!allergies?.length) return [];
  const n = (foodName || "").toLowerCase();
  const map = {
    "Peanuts": ["peanut"],
    "Tree nuts": ["almond", "cashew", "walnut", "pecan", "pistachio", "hazelnut", "nut"],
    "Milk / Dairy": ["milk", "cheese", "cream", "butter", "yogurt", "dairy"],
    "Eggs": ["egg"],
    "Wheat / Gluten": ["wheat", "bread", "pasta", "flour", "gluten", "noodle"],
    "Soy": ["soy", "tofu", "edamame"],
    "Fish": ["fish", "salmon", "tuna", "cod", "anchovy"],
    "Shellfish": ["shrimp", "crab", "lobster", "prawn", "shellfish"],
    "Sesame": ["sesame", "tahini"],
  };
  return allergies.filter((a) => (map[a] || [a.toLowerCase()]).some((kw) => n.includes(kw)));
}

export function buildExercisePlan(bmi, goal) {
  const cat = bmiCategory(bmi)?.label || "Healthy weight";
  const lowImpactFocus = cat === "Overweight" || cat === "Obese";
  const cardio = lowImpactFocus
    ? [
        { name: "Brisk walking", duration: 30, kcal: 150 },
        { name: "Stationary cycling (easy pace)", duration: 20, kcal: 140 },
        { name: "Swimming (leisure)", duration: 25, kcal: 180 },
      ]
    : goal === "lose"
    ? [
        { name: "Jogging", duration: 25, kcal: 250 },
        { name: "Cycling", duration: 30, kcal: 260 },
        { name: "Jump rope intervals", duration: 15, kcal: 180 },
      ]
    : [
        { name: "Brisk walking", duration: 25, kcal: 140 },
        { name: "Light jogging", duration: 20, kcal: 180 },
        { name: "Cycling", duration: 20, kcal: 160 },
      ];

  const strength = goal === "gain"
    ? [
        { name: "Bodyweight squats", sets: "3x12", kcal: 60 },
        { name: "Push-ups (knee variation OK)", sets: "3x10", kcal: 50 },
        { name: "Resistance band rows", sets: "3x12", kcal: 55 },
        { name: "Dumbbell shoulder press", sets: "3x10", kcal: 55 },
      ]
    : [
        { name: "Bodyweight squats", sets: "2x12", kcal: 50 },
        { name: "Wall or knee push-ups", sets: "2x10", kcal: 40 },
        { name: "Glute bridges", sets: "2x15", kcal: 40 },
        { name: "Standing resistance band rows", sets: "2x12", kcal: 45 },
      ];

  const flexibility = [
    { name: "Full-body stretch routine", duration: 10, kcal: 25 },
    { name: "Cat-cow + child's pose flow", duration: 8, kcal: 20 },
  ];
  const balance = [
    { name: "Single-leg stands (each side)", duration: 5, kcal: 15 },
    { name: "Gentle beginner yoga flow", duration: 15, kcal: 45 },
  ];

  const weekTemplate = lowImpactFocus
    ? ["Cardio", "Strength", "Rest / Flex", "Cardio", "Strength", "Balance", "Rest"]
    : goal === "gain"
    ? ["Strength", "Cardio", "Strength", "Rest", "Strength", "Cardio", "Flex"]
    : ["Cardio", "Strength", "Flex", "Cardio", "Strength", "Balance", "Rest"];

  return { cardio, strength, flexibility, balance, weekTemplate, category: cat };
}
