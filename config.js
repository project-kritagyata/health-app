/**
 * ⚠️ FILL THESE IN — every value below is a placeholder.
 * See SETUP_GOOGLE_SUPABASE.md for exactly where each one comes from
 * and exactly where to click to generate it.
 */

// Supabase dashboard → Project Settings → API
export const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_PUBLIC_KEY";

// Google Cloud Console → APIs & Services → Credentials
// The "Web application" OAuth client (yes, even though this is a mobile app —
// this one gives Google Sign-In the audience Supabase needs to verify tokens).
export const GOOGLE_WEB_CLIENT_ID = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";

// Google Cloud Console → the "iOS" OAuth client
export const GOOGLE_IOS_CLIENT_ID = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com";

// Where your /api/analyze-meal and /api/meal-plan functions are deployed
// (the same backend from the nutritrack-app web project's /api folder —
// deploy that to Vercel and paste its URL here). The Anthropic key must
// stay server-side, so the phone app always calls through this backend,
// never api.anthropic.com directly.
export const API_BASE_URL = "https://YOUR-DEPLOYED-BACKEND.vercel.app";
