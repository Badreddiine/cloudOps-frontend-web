import React from "react";
import { BrowserRouter } from "react-router-dom";
import { KeycloakProvider } from "./auth/KeycloakProvider";
import Router from "./router";

function App({ keycloak, authenticated }) {  // ✅ reçoit les props
   console.log("🔑 App reçoit:", { keycloak: !!keycloak, authenticated });
  return (
    <KeycloakProvider keycloak={keycloak} authenticated={authenticated}> {/* ✅ les transmet */}
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <main><Router /></main>
        </div>
      </BrowserRouter>
    </KeycloakProvider>
  );
}

export default App;