import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../api/useApi";
import { useAuth } from "../../../auth/KeycloakProvider";
import { createIncident } from "../services/incidentApi";

export default function CreateIncidentPage() {
  const api = useApi();
  const navigate = useNavigate();
  const auth = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "APPLICATION",
    assignedTo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!auth) {
    return (
      <div style={S.loadingWrap}>
        <p style={{ color: "#64748b" }}>Authentification...</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        assignedTo: formData.assignedTo || null,
      };
      await createIncident(api, payload);
      navigate("/");
    } catch (err) {
      console.log("❌ Data:", JSON.stringify(err.response?.data));
      setError("Erreur lors de la création. Vérifiez vos permissions.");
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { value: "LOW",    label: "Faible",   color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", desc: "Impact limité" },
    { value: "MEDIUM", label: "Moyen",    color: "#d97706", bg: "#fffbeb", border: "#fde68a", desc: "Service dégradé" },
    { value: "HIGH",   label: "Critique", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", desc: "Service indisponible" },
  ];

  const categories = [
    { value: "NETWORK",     label: "Réseau",      icon: "🌐" },
    { value: "SERVER",      label: "Serveur",     icon: "🖥️" },
    { value: "DATABASE",    label: "Base de données", icon: "🗄️" },
    { value: "APPLICATION", label: "Application", icon: "⚙️" },
    { value: "SECURITY",    label: "Sécurité",    icon: "🔒" },
    { value: "OTHER",       label: "Autre",       icon: "📋" },
  ];

  return (
    <div style={S.page}>
      <div style={S.leftPanel}>
        <div style={S.backWrap}>
          <button onClick={() => navigate("/")} style={S.backBtn}>
            ← Retour aux incidents
          </button>
        </div>
        <div style={S.leftContent}>
          <div style={S.leftIcon}>⚠</div>
          <h2 style={S.leftTitle}>Déclarer un incident</h2>
          <p style={S.leftDesc}>
            Documentez précisément l'incident pour permettre une résolution rapide par l'équipe technique.
          </p>
          <div style={S.tipBox}>
            <div style={S.tipTitle}>💡 Conseils</div>
            <ul style={S.tipList}>
              <li>Soyez précis dans le titre</li>
              <li>Incluez les étapes de reproduction</li>
              <li>Mentionnez l'impact utilisateur</li>
              <li>Ajoutez les logs si disponibles</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={S.rightPanel}>
        <div style={S.formCard}>
          <div style={S.formHeader}>
            <h1 style={S.formTitle}>Nouvel incident</h1>
            <p style={S.formSubtitle}>Tous les champs marqués * sont requis</p>
          </div>

          <form onSubmit={handleSubmit} style={S.form}>
            {error && (
              <div style={S.errorBanner}>
                <span>⚠</span> {error}
              </div>
            )}

            {/* Titre */}
            <div style={S.field}>
              <label style={S.label}>Titre de l'incident *</label>
              <input
                required
                type="text"
                style={S.input}
                placeholder="Ex: Latence élevée sur l'API Gateway"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* Catégorie */}
            <div style={S.field}>
              <label style={S.label}>Catégorie *</label>
              <div style={S.categoryGrid}>
                {categories.map((c) => {
                  const isSelected = formData.category === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: c.value })}
                      style={{
                        ...S.categoryCard,
                        border: isSelected ? "2px solid #2563eb" : "2px solid #e2e8f0",
                        background: isSelected ? "#eff6ff" : "#fff",
                        color: isSelected ? "#2563eb" : "#64748b",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{c.icon}</span>
                      <span style={{ fontSize: "11px", fontWeight: "600" }}>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priorité */}
            <div style={S.field}>
              <label style={S.label}>Niveau de priorité *</label>
              <div style={S.priorityGrid}>
                {priorities.map((p) => {
                  const isSelected = formData.priority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p.value })}
                      style={{
                        ...S.priorityCard,
                        border: isSelected ? `2px solid ${p.color}` : "2px solid #e2e8f0",
                        background: isSelected ? p.bg : "#fff",
                      }}
                    >
                      <div style={{ ...S.priorityLabel, color: isSelected ? p.color : "#64748b" }}>
                        {p.label}
                      </div>
                      <div style={{ ...S.priorityDesc, color: isSelected ? p.color : "#94a3b8" }}>
                        {p.desc}
                      </div>
                      {isSelected && (
                        <div style={{ ...S.priorityCheck, background: p.color }}>✓</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div style={S.field}>
              <label style={S.label}>Description détaillée *</label>
              <textarea
                required
                rows="6"
                style={S.textarea}
                placeholder="Décrivez le problème, les étapes pour le reproduire, l'impact sur les utilisateurs..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
              <div style={S.charCount}>{formData.description.length} caractères</div>
            </div>

            {/* Assigné à */}
            <div style={S.field}>
              <label style={S.label}>Assigné à</label>
              <input
                type="text"
                style={S.input}
                placeholder="Ex: john.doe@company.com"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* Actions */}
            <div style={S.actions}>
              <button
                type="button"
                onClick={() => navigate("/")}
                style={S.cancelBtn}
                onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                style={loading ? S.submitBtnDisabled : S.submitBtn}
                onMouseEnter={e => !loading && (e.currentTarget.style.background = "#1d4ed8")}
                onMouseLeave={e => !loading && (e.currentTarget.style.background = "#2563eb")}
              >
                {loading ? <span>⟳ Création...</span> : <span>Publier l'incident →</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: "flex", minHeight: "100vh", fontFamily: '"DM Sans", "Inter", system-ui, sans-serif', background: "#f1f5f9" },
  loadingWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" },
  leftPanel: { width: "340px", background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" },
  backWrap: { padding: "24px 24px 0" },
  backBtn: { background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: "13px", fontWeight: "500", padding: 0, letterSpacing: "-0.01em" },
  leftContent: { padding: "40px 28px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" },
  leftIcon: { fontSize: "36px", marginBottom: "20px", filter: "drop-shadow(0 0 20px rgba(239,68,68,0.4))" },
  leftTitle: { fontSize: "22px", fontWeight: "700", color: "#f8fafc", margin: "0 0 12px", letterSpacing: "-0.03em" },
  leftDesc: { fontSize: "13px", color: "#64748b", lineHeight: "1.7", margin: "0 0 32px" },
  tipBox: { background: "#1e293b", borderRadius: "12px", padding: "18px 20px", border: "1px solid #334155" },
  tipTitle: { fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" },
  tipList: { margin: 0, paddingLeft: "16px", color: "#64748b", fontSize: "13px", lineHeight: "2" },
  rightPanel: { flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 32px", overflowY: "auto" },
  formCard: { width: "100%", maxWidth: "580px", background: "#fff", borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" },
  formHeader: { padding: "28px 32px 24px", borderBottom: "1px solid #f1f5f9" },
  formTitle: { fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.03em" },
  formSubtitle: { fontSize: "12px", color: "#94a3b8", margin: 0 },
  form: { padding: "28px 32px", display: "flex", flexDirection: "column", gap: "22px" },
  errorBanner: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { padding: "11px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#0f172a", outline: "none", transition: "border-color 0.15s", fontFamily: "inherit", background: "#fafafa" },
  textarea: { padding: "11px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#0f172a", outline: "none", transition: "border-color 0.15s", fontFamily: "inherit", resize: "vertical", background: "#fafafa", lineHeight: "1.6" },
  charCount: { fontSize: "11px", color: "#cbd5e1", textAlign: "right" },
  categoryGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" },
  categoryCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 8px", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" },
  priorityGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" },
  priorityCard: { position: "relative", padding: "14px 12px", borderRadius: "10px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" },
  priorityLabel: { fontSize: "13px", fontWeight: "700", marginBottom: "2px" },
  priorityDesc: { fontSize: "11px" },
  priorityCheck: { position: "absolute", top: "8px", right: "8px", width: "16px", height: "16px", borderRadius: "50%", color: "#fff", fontSize: "9px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" },
  actions: { display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" },
  cancelBtn: { padding: "11px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "background 0.15s" },
  submitBtn: { padding: "11px 24px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "background 0.15s", letterSpacing: "-0.01em" },
  submitBtnDisabled: { padding: "11px 24px", borderRadius: "10px", border: "none", background: "#e2e8f0", color: "#94a3b8", fontSize: "13px", fontWeight: "600", cursor: "not-allowed" },
};