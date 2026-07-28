import AsyncStorage from "@react-native-async-storage/async-storage";

// Chaves usadas no AsyncStorage
const ACCESS_TOKEN_KEY = "@JanuPrime:accessToken";
const REFRESH_TOKEN_KEY = "@JanuPrime:refreshToken";

/**
 * Salva o par de tokens JWT no armazenamento local.
 */
export async function saveTokens(access: string, refresh: string): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, access],
    [REFRESH_TOKEN_KEY, refresh],
  ]);
}

/**
 * Recupera o access token salvo.
 * Retorna null se não houver token.
 */
export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Recupera o refresh token salvo.
 * Retorna null se não houver token.
 */
export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Remove ambos os tokens do armazenamento (logout).
 */
export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}
