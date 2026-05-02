import { useAuth } from "../auth/KeycloakProvider"; // ✅ bon fichier
import { hasRole } from "../auth/authUtils";

const ProtectedRoute = ({ children, roles }) => {
  const auth = useAuth(); // ✅ on récupère d'abord l'objet entier
console.log("🛡️ ProtectedRoute auth:", auth);
  // ✅ garde-fou si le contexte n'est pas encore prêt
  if (!auth) {
    return (
      <p className="text-center text-gray-400 text-sm mt-20">
        Chargement...
      </p>
    );
  }

  const { keycloak, authenticated } = auth;

  if (!keycloak) {
    return (
      <p className="text-center text-gray-400 text-sm mt-20">
        Chargement...
      </p>
    );
  }

  if (!authenticated) {
    keycloak.login();
    return null;
  }

  if (roles && !roles.some((r) => hasRole(keycloak, r))) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500 font-medium text-lg">Accès refusé</p>
        <p className="text-gray-400 text-sm mt-1">
          Vous n'avez pas les droits pour accéder à cette page.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;