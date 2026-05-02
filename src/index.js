import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloakInstance from "./auth/keycloak";

keycloakInstance
  .init({ onLoad: "login-required", checkLoginIframe: false })
  .then((authenticated) => {
    console.log("✅ Keycloak prêt, lancement React...");
    ReactDOM.createRoot(document.getElementById("root")).render(
      <App keycloak={keycloakInstance} authenticated={authenticated} />
    );
  })
  .catch((err) => {
    console.error("❌ Keycloak init failed:", err);
    document.getElementById("root").innerHTML =
      "<p style='text-align:center;margin-top:20vh;color:#ef4444'>Erreur d'authentification.</p>";
  });