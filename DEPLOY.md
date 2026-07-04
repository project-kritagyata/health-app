# Deploying NutriTrack — from zero

There are two separate things to deploy:
1. **The backend** (`backend/` folder) — a couple of serverless functions that hold your Anthropic API key.
2. **The mobile app** (everything else) — built with Expo and installed on phones via EAS.

Do them in this order — the app needs the backend's URL before it's useful.

---

## Part 1 — Deploy the backend (5 minutes)

This is two files (`backend/api/analyze-meal.js`, `backend/api/meal-plan.js`) that call Anthropic's API using a key that stays on the server. **Vercel** is the easiest host for this — free tier is enough.

1. Create a free account at https://vercel.com (sign in with GitHub is easiest)
2. Install the CLI: `npm install -g vercel`
3. From the `backend/` folder:
   ```bash
   cd backend
   vercel
   ```
   Answer the prompts (link to a new project, defaults are fine).
4. Add your Anthropic key as an environment variable — either:
   - **Dashboard:** vercel.com → your project → Settings → Environment Variables → add `ANTHROPIC_API_KEY`, or
   - **CLI:** `vercel env add ANTHROPIC_API_KEY`
5. Deploy for real: `vercel --prod`
6. Copy the URL it gives you (something like `https://nutritrack-backend.vercel.app`) — you'll paste this into the app next.

No Anthropic key yet? Get one at https://console.anthropic.com → Settings → API Keys.

---

## Part 2 — Configure the app

Open `config.js` in the project root and fill in **all four** placeholders:

```js
export const SUPABASE_URL = "...";           // from Supabase dashboard
export const SUPABASE_ANON_KEY = "...";      // from Supabase dashboard
export const GOOGLE_WEB_CLIENT_ID = "...";   // from Google Cloud Console
export const GOOGLE_IOS_CLIENT_ID = "...";   // from Google Cloud Console
export const API_BASE_URL = "https://nutritrack-backend.vercel.app"; // from Part 1
```

For the Supabase and Google values, follow `SETUP_GOOGLE_SUPABASE.md` in this same folder — it walks through exactly what to create and where each value comes from.

Also update `app.json` → the `@react-native-google-signin/google-signin` plugin's `iosUrlScheme` with your reversed iOS client ID (also covered in that doc).

---

## Part 3 — Run it locally first

Since Google Sign-In is a native module, plain Expo Go won't run it — you need a **development build** once, then you can iterate quickly after that.

```bash
npm install
npx expo install expo-dev-client   # already in package.json, this just confirms native config

# Cloud build (no Mac or Android Studio needed) — install EAS CLI once:
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android
eas build --profile development --platform ios
```

Each command gives you a link to download an installable build (an `.apk`/`.ipa` or a simulator build). Install it on your device or simulator, then for every day after that:

```bash
npx expo start --dev-client
```
— scan the QR code with the dev build you installed (not regular Expo Go).

If you already have Xcode / Android Studio installed, `npx expo run:ios` / `npx expo run:android` build and launch locally without EAS.

---

## Part 4 — Ship it to real devices / app stores

### Internal testing (fastest — no app store review)
```bash
eas build --profile preview --platform android
```
This gives you a shareable `.apk` link — send it to testers directly, no Play Store needed. (iOS requires at least TestFlight, see below — Apple doesn't allow direct installs the way Android does.)

### TestFlight (iOS beta testing)
```bash
eas build --profile production --platform ios
eas submit --platform ios
```
You'll need an Apple Developer account ($99/year) — https://developer.apple.com. `eas submit` walks you through connecting it.

### Google Play (production or internal track)
```bash
eas build --profile production --platform android
eas submit --platform android
```
You'll need a Google Play Developer account (one-time $25 fee) — https://play.google.com/console.

### App Store (production)
Same `eas build --profile production --platform ios` + `eas submit --platform ios`, then finish the listing (screenshots, description, privacy policy URL) in App Store Connect before submitting for review.

---

## Part 5 — Before you actually launch

A few things worth doing that aren't strictly "deployment" but matter once real users touch it:

- **Move the OAuth consent screen out of "Testing" mode** in Google Cloud Console (Part of `SETUP_GOOGLE_SUPABASE.md`) — otherwise only accounts you explicitly added as test users can sign in.
- **Add a production build's SHA-1** to the Android OAuth client in Google Cloud Console (`eas credentials` shows you this) — the debug SHA-1 only works for development builds.
- **Privacy policy** — both app stores require a URL to one, and you're collecting name/email/photo via Google, plus optional food/health data.
- **Rate-limit or monitor `/api/analyze-meal` and `/api/meal-plan`** — right now anyone with your app installed can call them as often as they want, which runs up your Anthropic bill. Supabase's session can be used to check `req.headers.authorization` server-side if you want to restrict this to signed-in users only.

---

## File map (what's short-and-separate, as requested)

```
nutritrack-mobile/
├── config.js                 ← every credential placeholder, one file
├── app.json                  ← Expo config, camera + Google plugins
├── App.js                    ← top-level flow: auth → consent → onboarding → tabs
├── context/
│   ├── AuthContext.js        ← Google + Supabase session
│   └── AppDataContext.js     ← profile, food log, water, settings, meal plan
├── lib/
│   ├── supabase.js           ← Supabase client + session persistence
│   ├── googleAuth.js         ← native Google Sign-In wrapper
│   ├── storage.js            ← AsyncStorage read/write helpers
│   ├── domain.js             ← BMI/calorie/macro/exercise-plan math
│   ├── aiService.js          ← calls your deployed backend
│   ├── barcode.js            ← Open Food Facts lookup
│   └── imageRn.js            ← photo file → base64 for the AI call
├── components/
│   ├── ui.js                 ← Button, Card, Field, Segmented, RingGauge, etc.
│   └── TabBar.js             ← bottom navigation
├── screens/
│   ├── AuthScreen.js, ConsentScreen.js, OnboardingScreen.js
│   ├── HomeScreen.js, AddFoodScreen.js, MealPlanScreen.js
│   ├── ExerciseScreen.js, ProfileScreen.js
│   └── CameraScreen.js       ← live camera, permission prompt, capture
└── backend/                  ← deploy this folder to Vercel (Part 1)
    └── api/analyze-meal.js, api/meal-plan.js
```
