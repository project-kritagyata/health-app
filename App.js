import React, { useState } from "react";
import { SafeAreaView, View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import AuthScreen from "./screens/AuthScreen";
import ConsentScreen from "./screens/ConsentScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import HomeScreen from "./screens/HomeScreen";
import AddFoodScreen from "./screens/AddFoodScreen";
import MealPlanScreen from "./screens/MealPlanScreen";
import ExerciseScreen from "./screens/ExerciseScreen";
import ProfileScreen from "./screens/ProfileScreen";
import TabBar from "./components/TabBar";

function MainApp() {
  const { session, loading: authLoading } = useAuth();
  const { loading: dataLoading, consented, profile, theme } = useAppData();
  const [tab, setTab] = useState("home");

  if (authLoading || dataLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#131A18", alignItems: "center", justifyContent: "center" }}>
        <StatusBar style="light" />
        <ActivityIndicator color="#1F6F5C" />
      </SafeAreaView>
    );
  }

  if (!session) return <AuthScreen />;
  if (!consented) return <ConsentScreen />;
  if (!profile) return <OnboardingScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.bg === "#131A18" ? "light" : "dark"} />
      <SafeAreaView style={{ flex: 1 }}>
        {tab === "home" && <HomeScreen />}
        {tab === "addfood" && <AddFoodScreen />}
        {tab === "mealplan" && <MealPlanScreen />}
        {tab === "exercise" && <ExerciseScreen />}
        {tab === "profile" && <ProfileScreen />}
      </SafeAreaView>
      <TabBar active={tab} onChange={setTab} />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <MainApp />
      </AppDataProvider>
    </AuthProvider>
  );
}
