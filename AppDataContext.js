import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { storageGet, storageSet, storageDelete, storageListKeys } from "../lib/storage";
import { todayKey, calorieTargetOf, macrosOf } from "../lib/domain";
import { LIGHT_THEME, DARK_THEME } from "../theme";

const DEFAULT_SETTINGS = {
  theme: "dark",
  waterGoalMl: 2000,
  stepGoal: 10000,
  waterReminder: { enabled: false, intervalMinutes: 60 },
};

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [consented, setConsented] = useState(false);
  const [profile, setProfile] = useState(null);
  const [entriesByDate, setEntriesByDate] = useState({});
  const [waterByDate, setWaterByDate] = useState({});
  const [mealPlan, setMealPlan] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      const c = await storageGet("consent");
      const p = await storageGet("profile");
      const t = await storageGet(`foodlog:${todayKey()}`, []);
      const w = await storageGet(`water:${todayKey()}`, 0);
      const mp = await storageGet("mealplan:latest");
      const s = await storageGet("settings");
      if (c?.consented) setConsented(true);
      if (p) setProfile(p);
      setEntriesByDate((prev) => ({ ...prev, [todayKey()]: t }));
      setWaterByDate((prev) => ({ ...prev, [todayKey()]: w }));
      if (mp) setMealPlan(mp);
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...s, waterReminder: { ...DEFAULT_SETTINGS.waterReminder, ...(s.waterReminder || {}) } });
      setLoading(false);
    })();
  }, []);

  const ensureDateLoaded = async (date) => {
    if (entriesByDate[date]) return;
    const d = await storageGet(`foodlog:${date}`, []);
    setEntriesByDate((prev) => ({ ...prev, [date]: d }));
  };

  const acceptConsent = async () => {
    await storageSet("consent", { consented: true, date: new Date().toISOString() });
    setConsented(true);
  };

  const saveProfile = async (form) => {
    const clean = { ...form, age: Number(form.age), heightCm: Number(form.heightCm), weightKg: Number(form.weightKg) };
    delete clean.customAllergy;
    await storageSet("profile", clean);
    setProfile(clean);
  };

  const addEntries = async (date, newEntries) => {
    const current = entriesByDate[date] || [];
    const updated = [...current, ...newEntries];
    setEntriesByDate((prev) => ({ ...prev, [date]: updated }));
    await storageSet(`foodlog:${date}`, updated);
  };
  const addEntry = (date, entry) => addEntries(date, [entry]);

  const updateEntry = async (date, id, patch) => {
    const updated = (entriesByDate[date] || []).map((e) => (e.id === id ? { ...e, ...patch, calories: Number(patch.calories ?? e.calories) } : e));
    setEntriesByDate((prev) => ({ ...prev, [date]: updated }));
    await storageSet(`foodlog:${date}`, updated);
  };
  const deleteEntry = async (date, id) => {
    const updated = (entriesByDate[date] || []).filter((e) => e.id !== id);
    setEntriesByDate((prev) => ({ ...prev, [date]: updated }));
    await storageSet(`foodlog:${date}`, updated);
  };

  const addWater = async (date, deltaMl) => {
    const current = waterByDate[date] || 0;
    const updated = Math.max(0, current + deltaMl);
    setWaterByDate((prev) => ({ ...prev, [date]: updated }));
    await storageSet(`water:${date}`, updated);
  };

  const saveMealPlan = async (plan) => {
    setMealPlan(plan);
    await storageSet("mealplan:latest", plan);
  };

  const updateSettings = async (next) => {
    setSettings(next);
    await storageSet("settings", next);
  };

  const resetAllData = async () => {
    const foodKeys = await storageListKeys("foodlog:");
    for (const k of foodKeys) await storageDelete(k);
    const waterKeys = await storageListKeys("water:");
    for (const k of waterKeys) await storageDelete(k);
    await storageDelete("profile");
    await storageDelete("consent");
    await storageDelete("mealplan:latest");
    await storageDelete("settings");
    setProfile(null);
    setConsented(false);
    setEntriesByDate({});
    setWaterByDate({});
    setMealPlan(null);
    setSettings(DEFAULT_SETTINGS);
  };

  const calorieTarget = useMemo(() => (profile ? calorieTargetOf(profile) : 2000), [profile]);
  const macros = useMemo(() => macrosOf(calorieTarget), [calorieTarget]);
  const theme = settings.theme === "dark" ? DARK_THEME : LIGHT_THEME;

  return (
    <AppDataContext.Provider
      value={{
        loading, consented, profile, entriesByDate, waterByDate, mealPlan, settings, theme,
        calorieTarget, macros,
        ensureDateLoaded, acceptConsent, saveProfile,
        addEntries, addEntry, updateEntry, deleteEntry,
        addWater, saveMealPlan, updateSettings, resetAllData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);
