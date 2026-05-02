import { Routes, Route, Navigate } from "react-router-dom";
import IncidentsPage from "./features/incidents/pages/IncidentsPage";
import CreateIncidentPage from "./features/incidents/pages/CreateIncidentPage";
import ProtectedRoute from "./routes/ProtectedRoute";

const ForbiddenPage = () => (
  <div className="flex flex-col items-center justify-center mt-20">
    <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center">
      <p className="text-red-600 font-bold text-xl">Accès refusé</p>
      <p className="text-gray-500 text-sm mt-2">
        Vous n'avez pas les droits nécessaires (ADMIN/DEVOPS) pour cette action.
      </p>
      <button
        onClick={() => window.location.href = "/"}
        className="mt-6 text-sm text-blue-600 font-medium hover:underline"
      >
        Retour à l'accueil
      </button>
    </div>
  </div>
);

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><IncidentsPage /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute roles={["ADMIN", "DEVOPS"]}><CreateIncidentPage /></ProtectedRoute>} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}