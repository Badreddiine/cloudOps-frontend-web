import React, { createContext, useContext, useEffect, useState } from "react";
import keycloakInstance from "./keycloak"; 

export const AuthContext = createContext();

// C'est ce nom que nous importons dans App.js
export const KeycloakProvider = ({ children }) => {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloakInstance
      .init({ onLoad: "login-required", checkLoginIframe: false })
      .then((auth) => {
        setKeycloak(keycloakInstance);
        setAuthenticated(auth);
      })
      .catch((err) => console.error("Erreur Keycloak:", err));
  }, []);

  if (!keycloak) return <div className="p-10 text-center">Initialisation...</div>;

  return (
    <AuthContext.Provider value={{ keycloak, authenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// C'est l'export "useAuth" que Webpack voyait bien
export const useAuth = () => useContext(AuthContext);