import * as FileSystem from "expo-file-system";

export async function uriToBase64(uri) {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return { base64, mediaType: "image/jpeg" };
}
