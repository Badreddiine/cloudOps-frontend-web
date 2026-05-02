import React, { useEffect, useState, useMemo } from "react";
import { getIncidents } from "../services/incidentApi";
import { useApi } from "../../../api/useApi";
import { useAuth } from "../../../auth/KeycloakProvider";
import { useNavigate } from "react-router-dom";

export default function IncidentsPage() {
  const auth = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const authenticated = auth?.authenticated ?? false;
  const keycloak = auth?.keycloak ?? null;

  useEffect(() => {
    if (!authenticated) return;
    let isMounted = true;

    setLoading(true);
    getIncidents(api)
      .then((res) => {
        if (isMounted) {
          setIncidents(res.data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Impossible de charger les incidents.");
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [authenticated, api]);

  const filteredData = useMemo(() => {
    return incidents.filter((i) => {
      const matchText = (i.title || i.service || "")
        .toLowerCase()
        .includes(filter.toLowerCase());
      const state = i.state || (i.resolved ? "Resolved" : "Ongoing");
      const matchStatus =
        statusFilter === "ALL" ||
        state.toLowerCase() === statusFilter.toLowerCase();
      return matchText && matchStatus;
    });
  }, [incidents, filter, statusFilter]);

  const stats = useMemo(() => ({
    total: incidents.length,
    resolved: incidents.filter(
      (i) => (i.state || (i.resolved ? "Resolved" : "")).toLowerCase() === "resolved"
    ).length,
    ongoing: incidents.filter(
      (i) => (i.state || (!i.resolved ? "Ongoing" : "")).toLowerCase() === "ongoing"
    ).length,
  }), [incidents]);

  if (!auth) return <LoadingScreen message="Authentification..." />;
  if (loading) return <LoadingScreen message="Chargement des incidents..." />;

  return (
    <div style={S.page}>
      <aside style={S.sidebar}>
        <div style={S.logo}>
          <span style={S.logoIcon}>⬡</span>
          <span style={S.logoText}>CloudOps</span>
        </div>
        <nav style={S.nav}>
          {[
            { icon: "▦", label: "Dashboard",  active: false },
            { icon: "⚠", label: "Incidents",  active: true  },
            { icon: "◈", label: "Services",   active: false },
            { icon: "◉", label: "Alertes",    active: false },
            { icon: "◎", label: "Rapports",   active: false },
          ].map((item) => (
            <div key={item.label} style={item.active ? S.navItemActive : S.navItem}>
              <span style={S.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={S.sidebarFooter}>
          <div style={S.avatar}>
            {keycloak?.tokenParsed?.preferred_username?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={S.userInfo}>
            <div style={S.userName}>
              {keycloak?.tokenParsed?.preferred_username || "Utilisateur"}
            </div>
            <div style={S.userRole}>Opérateur</div>
          </div>
          <button onClick={() => keycloak?.logout()} style={S.logoutBtn} title="Déconnexion">
            ⏻
          </button>
        </div>
      </aside>

      <main style={S.main}>
        <header style={S.topbar}>
          <div>
            <h1 style={S.pageTitle}>Incidents</h1>
            <p style={S.pageSubtitle}>Dernières 24 heures · Temps réel</p>
          </div>
          <button
            style={S.createBtn}
            onClick={() => navigate("/create")}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1d4ed8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2563eb")}
          >
            + Nouvel incident
          </button>
        </header>

        <div style={S.statsRow}>
          {[
            { label: "Total",    value: stats.total,    color: "#2563eb", bg: "#eff6ff" },
            { label: "En cours", value: stats.ongoing,  color: "#dc2626", bg: "#fef2f2" },
            { label: "Résolus",  value: stats.resolved, color: "#16a34a", bg: "#f0fdf4" },
          ].map((s) => (
            <div key={s.label} style={S.statCard}>
              <div style={{ ...S.statValue, color: s.color }}>{s.value}</div>
              <div style={S.statLabel}>{s.label}</div>
              <div style={{ ...S.statBar, background: s.bg }}>
                <div style={{
                  height: "100%",
                  width: `${stats.total ? (s.value / stats.total) * 100 : 0}%`,
                  background: s.color, borderRadius: "4px",
                  transition: "width 0.6s ease", opacity: 0.7,
                }} />
              </div>
            </div>
          ))}
        </div>

        <div style={S.filters}>
          <div style={S.searchWrapper}>
            <span style={S.searchIcon}>⌕</span>
            <input
              style={S.searchInput}
              placeholder="Rechercher un service ou titre..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div style={S.statusTabs}>
            {["ALL", "Ongoing", "Resolved"].map((s) => (
              <button
                key={s}
                style={statusFilter === s ? S.tabActive : S.tab}
                onClick={() => setStatusFilter(s)}
              >
                {s === "ALL" ? "Tous" : s === "Ongoing" ? "En cours" : "Résolus"}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={S.errorBanner}>⚠ {error}</div>}

        <div style={S.tableCard}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Service / Titre", "Statut", "Priorité", "Lien", "ID"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={S.emptyCell}>
                    <div style={S.emptyState}>
                      <div style={S.emptyIcon}>◎</div>
                      <div style={S.emptyText}>Aucun incident trouvé</div>
                      <div style={S.emptyHint}>Modifiez vos filtres ou créez un nouvel incident</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((incident) => {
                  const state = incident.state || (incident.resolved ? "Resolved" : "Ongoing");
                  const isResolved = state.toLowerCase() === "resolved";
                  return (
                    <tr
                      key={incident.id}
                      style={S.tr}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ ...S.td, fontWeight: "600", color: "#0f172a" }}>
                        {incident.service || incident.title || "—"}
                      </td>
                      <td style={S.td}>
                        <span style={isResolved ? S.badgeResolved : S.badgeOngoing}>
                          <span style={{ marginRight: "5px" }}>{isResolved ? "●" : "◉"}</span>
                          {isResolved ? "Résolu" : "En cours"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={getPriorityStyle(incident.priority)}>
                          {incident.priority || "MEDIUM"}
                        </span>
                      </td>
                      <td style={S.td}>
                        {incident.url ? (
                          <a href={incident.url} target="_blank" rel="noreferrer" style={S.link}>
                            Voir →
                          </a>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                      </td>
                      <td style={{ ...S.td, color: "#94a3b8", fontSize: "12px", fontFamily: "monospace" }}>
                        #{String(incident.id).padStart(5, "0")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={S.pagination}>
          <span style={S.paginationInfo}>
            {filteredData.length} résultat{filteredData.length !== 1 ? "s" : ""}
          </span>
          <div style={S.paginationBtns}>
            <button style={S.pageBtn}>← Précédent</button>
            <button style={S.pageBtnActive}>1</button>
            <button style={S.pageBtn}>Suivant →</button>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingScreen({ message }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "16px" }}>⬡</div>
        <p style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>{message}</p>
      </div>
    </div>
  );
}

function getPriorityStyle(priority) {
  const map = {
    HIGH:   { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
    MEDIUM: { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
    LOW:    { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" },
  };
  const base = map[priority?.toUpperCase()] || map.MEDIUM;
  return { ...base, padding: "2px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em" };
}

const S = {
  page:         { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: '"DM Sans", "Inter", system-ui, sans-serif' },
  sidebar:      { width: "220px", minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" },
  logo:         { display: "flex", alignItems: "center", gap: "10px", padding: "24px 20px 20px", borderBottom: "1px solid #1e293b" },
  logoIcon:     { fontSize: "22px", color: "#3b82f6" },
  logoText:     { fontSize: "16px", fontWeight: "700", color: "#f8fafc", letterSpacing: "-0.02em" },
  nav:          { padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  navItem:      { display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", cursor: "pointer", color: "#64748b", fontSize: "13px", fontWeight: "500" },
  navItemActive:{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "8px", cursor: "pointer", color: "#f8fafc", fontSize: "13px", fontWeight: "600", background: "#1e293b" },
  navIcon:      { fontSize: "14px", width: "18px", textAlign: "center" },
  sidebarFooter:{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", borderTop: "1px solid #1e293b" },
  avatar:       { width: "32px", height: "32px", borderRadius: "50%", background: "#2563eb", color: "#fff", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  userInfo:     { flex: 1, overflow: "hidden" },
  userName:     { fontSize: "12px", fontWeight: "600", color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userRole:     { fontSize: "11px", color: "#475569" },
  logoutBtn:    { background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: "16px", padding: "4px" },
  main:         { flex: 1, padding: "32px 36px", overflowX: "hidden" },
  topbar:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  pageTitle:    { fontSize: "22px", fontWeight: "700", color: "#0f172a", margin: 0, letterSpacing: "-0.03em" },
  pageSubtitle: { fontSize: "13px", color: "#94a3b8", marginTop: "3px" },
  createBtn:    { padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "background 0.15s" },
  statsRow:     { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" },
  statCard:     { background: "#fff", borderRadius: "14px", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  statValue:    { fontSize: "28px", fontWeight: "800", letterSpacing: "-0.04em", lineHeight: 1 },
  statLabel:    { fontSize: "12px", color: "#94a3b8", marginTop: "4px", fontWeight: "500" },
  statBar:      { height: "4px", borderRadius: "4px", marginTop: "14px", overflow: "hidden" },
  filters:      { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  searchWrapper:{ position: "relative", flex: 1, minWidth: "200px" },
  searchIcon:   { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "18px", pointerEvents: "none" },
  searchInput:  { width: "100%", padding: "10px 12px 10px 36px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#1e293b", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  statusTabs:   { display: "flex", gap: "4px", background: "#fff", padding: "4px", borderRadius: "10px", border: "1px solid #e2e8f0" },
  tab:          { padding: "6px 14px", borderRadius: "7px", border: "none", background: "transparent", color: "#64748b", fontSize: "12px", fontWeight: "500", cursor: "pointer" },
  tabActive:    { padding: "6px 14px", borderRadius: "7px", border: "none", background: "#0f172a", color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  errorBanner:  { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px" },
  tableCard:    { background: "#fff", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9", overflow: "hidden" },
  table:        { width: "100%", borderCollapse: "collapse" },
  th:           { padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" },
  tr:           { transition: "background 0.1s", cursor: "default" },
  td:           { padding: "14px 20px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc" },
  badgeResolved:{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" },
  badgeOngoing: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
  link:         { color: "#2563eb", textDecoration: "none", fontWeight: "600", fontSize: "13px" },
  emptyCell:    { padding: "60px 20px", textAlign: "center" },
  emptyState:   { display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  emptyIcon:    { fontSize: "32px", color: "#e2e8f0" },
  emptyText:    { fontSize: "14px", fontWeight: "600", color: "#94a3b8" },
  emptyHint:    { fontSize: "12px", color: "#cbd5e1" },
  pagination:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" },
  paginationInfo:{ fontSize: "12px", color: "#94a3b8" },
  paginationBtns:{ display: "flex", gap: "6px" },
  pageBtn:      { padding: "7px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "12px", fontWeight: "500", cursor: "pointer" },
  pageBtnActive:{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "#0f172a", color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
};