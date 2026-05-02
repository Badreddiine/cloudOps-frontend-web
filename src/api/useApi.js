import axios from "axios";
import { useMemo } from "react";
import { useAuth } from "../auth/KeycloakProvider"; // ✅ corrigé

export const useApi = () => {
  const auth = useAuth();

  const keycloak = auth?.keycloak ?? null;
  const authenticated = auth?.authenticated ?? false;

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
    });

    instance.interceptors.request.use(async (config) => {
      if (keycloak && authenticated) {
        try {
          await keycloak.updateToken(30);
          console.log("🔐 Token OK:", !!keycloak.token); // ← temporaire pour vérifier
          config.headers.Authorization = `Bearer ${keycloak.token}`;
        } catch (error) {
          console.error("Session expirée, redirection login...");
          keycloak.login();
        }
      } else {
        console.warn("⚠️ keycloak:", !!keycloak, "authenticated:", authenticated);
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && keycloak) {
          keycloak.login();
        }
        if (error.response?.status === 403) {
          window.location.href = "/forbidden";
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [keycloak, authenticated]);

  return api;
};