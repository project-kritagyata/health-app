import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Camera as CameraIcon, ScanBarcode, Trash2, Pencil, ChevronLeft, ChevronRight, Plus, Info } from "lucide-react-native";
import { useAppData } from "../context/AppDataContext";
import { Card, Button, Segmented, TextField, AllergyBadge } from "../components/ui";
import { uid, matchesAllergy, todayKey, niceDate } from "../lib/domain";
import { uriToBase64 } from "../lib/imageRn";
import { AIService } from "../lib/aiService";
import { SAMPLE_BARCODES, lookupOpenFoodFacts } from "../lib/barcode";
import CameraScreen from "./CameraScreen";

function ManualEntry({ theme, profile, selectedDate, addEntry, updateEntry, editingEntry, clearEditing }) {
  const [form, setForm] = useState({ name: "", quantity: "", calories: "" });
  React.useEffect(() => {
    if (editingEntry) setForm({ name: editingEntry.name, quantity: editingEntry.quantity, calories: String(editingEntry.calories) });
  }, [editingEntry]);
  const hits = matchesAllergy(form.name, profile.allergies);

  const submit = () => {
    if (!form.name.trim() || !form.calories) return;
    if (editingEntry) {
      updateEntry(selectedDate, editingEntry.id, { ...form, calories: Number(form.calories) });
      clearEditing();
    } else {
      addEntry(selectedDate, {
        id: uid(), source: "manual", name: form.name.trim(), quantity: form.quantity.trim() || "1 serving",
        calories: Number(form.calories), protein_g: 0, carbs_g: 0, fat_g: 0,
        allergenMatches: matchesAllergy(form.name, profile.allergies),
      });
    }
    setForm({ name: "", quantity: "", calories: "" });
  };

  return (
    <Card>
      <Text style={{ fontSize: 11, fontWeight: "700", color: theme.muted, textTransform: "uppercase", marginBottom: 10 }}>
        {editingEntry ? "Edit entry" : "Add food manually"}
      </Text>
      <TextField placeholder="Food name" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} style={{ marginBottom: 8 }} />
      <TextField placeholder="Quantity (e.g. 1 bowl)" value={form.quantity} onChangeText={(v) => setForm((f) => ({ ...f, quantity: v }))} style={{ marginBottom: 8 }} />
      <TextField placeholder="Calories" value={form.calories} onChangeText={(v) => setForm((f) => ({ ...f, calories: v }))} keyboardType="number-pad" style={{ marginBottom: 8 }} />
      {hits.length > 0 && <View style={{ marginBottom: 8 }}><AllergyBadge allergens={hits} /></View>}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        {editingEntry && <Button variant="ghost" onPress={() => { clearEditing(); setForm({ name: "", quantity: "", calories: "" }); }}>Cancel</Button>}
        <Button onPress={submit}>{editingEntry ? "Save changes" : "Add entry"}</Button>
      </View>
    </Card>
  );
}

function BarcodeEntry({ theme, profile, selectedDate, addEntry }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [product, setProduct] = useState(null);
  const [reason, setReason] = useState("");
  const [manual, setManual] = useState({ name: "", calories: "" });

  const lookup = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setStatus("searching");
    const local = SAMPLE_BARCODES[trimmed];
    if (local) { setProduct({ ...local, source: "sample" }); setStatus("found"); return; }
    try {
      const result = await lookupOpenFoodFacts(trimmed);
      if (result) { setProduct({ ...result, source: "openfoodfacts" }); setStatus("found"); }
      else { setReason("No product found for that barcode."); setStatus("notfound"); }
    } catch {
      setReason("Couldn't reach the nutrition database."); setStatus("notfound");
    }
  };

  const saveFound = () => {
    addEntry(selectedDate, {
      id: uid(), source: product.source === "openfoodfacts" ? "barcode" : "barcode-sample",
      name: product.name, quantity: product.quantity || "1 package",
      calories: product.calories, protein_g: product.protein_g, carbs_g: product.carbs_g, fat_g: product.fat_g,
      allergenMatches: matchesAllergy(`${product.name} ${product.allergensText || ""}`, profile.allergies),
    });
    setStatus("idle"); setCode(""); setProduct(null);
  };

  const saveManual = () => {
    if (!manual.name.trim() || !manual.calories) return;
    addEntry(selectedDate, { id: uid(), source: "barcode-manual", name: manual.name.trim(), quantity: "1 package", calories: Number(manual.calories), protein_g: 0, carbs_g: 0, fat_g: 0, allergenMatches: matchesAllergy(manual.name, profile.allergies) });
    setStatus("idle"); setCode(""); setManual({ name: "", calories: "" });
  };

  return (
    <Card>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextField style={{ flex: 1 }} placeholder="Type barcode number" value={code} onChangeText={setCode} keyboardType="number-pad" />
        <Button onPress={lookup}>Look up</Button>
      </View>
      <Text style={{ fontSize: 11, color: theme.muted, marginTop: 8 }}>Demo codes: 0000000000017, 0000000000024, 0000000000031, 0000000000048</Text>

      {status === "searching" && <ActivityIndicator color={theme.primary} style={{ marginTop: 12 }} />}

      {status === "found" && product && (
        <View style={{ backgroundColor: theme.bgSoft, borderRadius: 10, padding: 12, marginTop: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>{product.name}</Text>
          <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{product.quantity} · {product.calories} kcal · {product.protein_g}g P · {product.carbs_g}g C · {product.fat_g}g F</Text>
          <Button onPress={saveFound} style={{ marginTop: 10, alignSelf: "flex-start" }}>Add to log</Button>
        </View>
      )}

      {status === "notfound" && (
        <View style={{ backgroundColor: theme.bgSoft, borderRadius: 10, padding: 12, marginTop: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Info size={14} color={theme.ink} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: theme.ink }}>{reason} Add manually:</Text>
          </View>
          <TextField placeholder="Product name" value={manual.name} onChangeText={(v) => setManual((m) => ({ ...m, name: v }))} style={{ marginBottom: 8 }} />
          <TextField placeholder="Calories" value={manual.calories} onChangeText={(v) => setManual((m) => ({ ...m, calories: v }))} keyboardType="number-pad" style={{ marginBottom: 8 }} />
          <Button onPress={saveManual} style={{ alignSelf: "flex-start" }}>Add to log</Button>
        </View>
      )}
    </Card>
  );
}

function ScanEntry({ theme, profile, addEntries }) {
  const [showCamera, setShowCamera] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const analyze = async (uri) => {
    setStatus("loading");
    try {
      const { base64, mediaType } = await uriToBase64(uri);
      const result = await AIService.analyzeMealImage(base64, mediaType, profile.allergies);
      if (!result.items || result.items.length === 0) {
        setErrorMsg("Couldn't confidently detect any food in this photo.");
        setStatus("error");
        return;
      }
      setItems(result.items.map((it) => ({
        id: uid(), name: it.name, quantity: it.quantity || "",
        calories: Math.round(it.calories) || 0, protein_g: Math.round(it.protein_g) || 0,
        carbs_g: Math.round(it.carbs_g) || 0, fat_g: Math.round(it.fat_g) || 0,
        allergenMatches: it.allergenMatches?.length ? it.allergenMatches : matchesAllergy(it.name, profile.allergies),
      })));
      setStatus("done");
    } catch {
      setErrorMsg("The AI scanner couldn't process this photo. Make sure config.js API_BASE_URL points to your deployed backend.");
      setStatus("error");
    }
  };

  if (showCamera) {
    return <CameraScreen onCapture={(uri) => { setShowCamera(false); analyze(uri); }} onClose={() => setShowCamera(false)} />;
  }

  const total = items.reduce((s, i) => s + (Number(i.calories) || 0), 0);

  return (
    <View style={{ gap: 12 }}>
      {status === "idle" && (
        <Card style={{ alignItems: "center", paddingVertical: 28, gap: 10 }}>
          <CameraIcon size={26} color={theme.primary} />
          <Text style={{ fontSize: 12, color: theme.muted, textAlign: "center" }}>Take a clear photo of your plate.</Text>
          <Button onPress={() => setShowCamera(true)}>Use camera</Button>
        </Card>
      )}
      {status === "loading" && (
        <Card style={{ alignItems: "center", paddingVertical: 28, gap: 10 }}>
          <ActivityIndicator color={theme.primary} />
          <Text style={{ fontSize: 12, color: theme.muted }}>Analyzing your meal…</Text>
        </Card>
      )}
      {status === "error" && (
        <Card style={{ alignItems: "center", paddingVertical: 22, gap: 10 }}>
          <Text style={{ fontSize: 12, color: theme.danger, textAlign: "center" }}>{errorMsg}</Text>
          <Button onPress={() => setStatus("idle")}>Try again</Button>
        </Card>
      )}
      {status === "done" && (
        <>
          {items.map((it) => (
            <Card key={it.id}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink, marginBottom: 4 }}>{it.name}</Text>
              <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 6 }}>{it.quantity} · {it.calories} kcal · {it.protein_g}g P · {it.carbs_g}g C · {it.fat_g}g F</Text>
              {it.allergenMatches?.length > 0 && <AllergyBadge allergens={it.allergenMatches} />}
            </Card>
          ))}
          <Card style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>Total</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: theme.primary }}>{total} kcal</Text>
          </Card>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button variant="secondary" onPress={() => setStatus("idle")} style={{ flex: 1 }}>Rescan</Button>
            <Button style={{ flex: 1 }} onPress={() => { addEntries(todayKey(), items.map(({ id, ...r }) => ({ id: uid(), source: "ai-scan", ...r }))); setItems([]); setStatus("idle"); }}>
              Save to log
            </Button>
          </View>
        </>
      )}
    </View>
  );
}

export default function AddFoodScreen() {
  const { theme, profile, entriesByDate, addEntry, addEntries, updateEntry, deleteEntry } = useAppData();
  const [mode, setMode] = useState("scan");
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [editingEntry, setEditingEntry] = useState(null);

  const entries = entriesByDate[selectedDate] || [];
  const total = entries.reduce((s, e) => s + (Number(e.calories) || 0), 0);
  const shiftDate = (delta) => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + delta);
    setSelectedDate(todayKey(d));
  };

  const confirmDelete = (id) => {
    Alert.alert("Delete entry", "Remove this food from your log?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteEntry(selectedDate, id) },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color: theme.ink }}>Add food</Text>
      <Segmented
        value={mode}
        onChange={(v) => { setMode(v); if (v !== "manual") setEditingEntry(null); }}
        options={[{ value: "scan", label: "Scan" }, { value: "barcode", label: "Barcode" }, { value: "manual", label: "Manual" }]}
      />

      {mode === "scan" && <ScanEntry theme={theme} profile={profile} addEntries={addEntries} />}
      {mode === "barcode" && <BarcodeEntry theme={theme} profile={profile} selectedDate={selectedDate} addEntry={addEntry} />}
      {mode === "manual" && (
        <ManualEntry theme={theme} profile={profile} selectedDate={selectedDate} addEntry={addEntry} updateEntry={updateEntry} editingEntry={editingEntry} clearEditing={() => setEditingEntry(null)} />
      )}

      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.ink }}>{entries.length} entries</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity onPress={() => shiftDate(-1)}><ChevronLeft size={16} color={theme.muted} /></TouchableOpacity>
            <Text style={{ fontSize: 11, color: theme.muted }}>{niceDate(selectedDate)}</Text>
            <TouchableOpacity onPress={() => shiftDate(1)} disabled={selectedDate >= todayKey()}><ChevronRight size={16} color={theme.muted} /></TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 8, marginBottom: 8, borderBottomWidth: 1, borderColor: theme.border }}>
          <Text style={{ fontSize: 11, color: theme.muted }}>Day total</Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.primary }}>{total} kcal</Text>
        </View>
        {entries.length === 0 ? (
          <Text style={{ fontSize: 12, color: theme.muted, textAlign: "center", paddingVertical: 8 }}>No foods logged for this day yet.</Text>
        ) : (
          entries.map((e) => (
            <View key={e.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.border }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, color: theme.ink }}>{e.name}</Text>
                <Text style={{ fontSize: 11, color: theme.muted }}>{e.quantity}</Text>
                {e.allergenMatches?.length > 0 && <AllergyBadge allergens={e.allergenMatches} />}
              </View>
              <Text style={{ fontSize: 12, fontWeight: "700", color: theme.ink, marginRight: 10 }}>{e.calories} kcal</Text>
              <TouchableOpacity onPress={() => { setEditingEntry(e); setMode("manual"); }} style={{ marginRight: 10 }}>
                <Pencil size={15} color={theme.muted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(e.id)}>
                <Trash2 size={15} color={theme.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}
