import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from "../config";

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    // "webClientId" is required on BOTH platforms — it's what makes the
    // returned ID token verifiable by Supabase.
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    offlineAccess: false,
    scopes: ["openid", "profile", "email"],
  });
}

export async function signInWithGoogleNative() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();

  // Library shape has changed across versions — handle both.
  const idToken = result?.data?.idToken ?? result?.idToken;
  if (!idToken) throw new Error("Google did not return an ID token.");
  return idToken;
}

export async function signOutGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
    /* not signed in with Google, or already signed out — ignore */
  }
}

export function isUserCancelledError(err) {
  return err?.code === statusCodes.SIGN_IN_CANCELLED;
}
