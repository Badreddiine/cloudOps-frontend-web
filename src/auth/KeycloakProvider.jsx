import React, { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export const KeycloakProvider = ({ keycloak, authenticated, children }) => {
  return (
    <AuthContext.Provider value={{ keycloak, authenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);