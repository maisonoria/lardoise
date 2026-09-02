import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, FileText, Bell, Settings, Plus, Trash2,
  ArrowLeft, CheckCircle2, X, Menu, ChevronRight, TrendingUp,
  Clock, AlertTriangle, Users
} from "lucide-react";

const SUPABASE_URL = "https://wbpfykonxqkpgkhlwkhy.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndicGZ5a29ueHFrcGdraGx3a2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNDI4MzUsImV4cCI6MjEwMzYxODgzNX0.rg29B9fuDBFThwKqrXXARAPEFKntdDKCR6-VbBaVPTM";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

const C = {
  ink: "#16263A", inkSoft: "#55677A", blue: "#2C5B76", blueDeep: "#1D4155",
  accent: "#E8720C", accentSoft: "#FCE4CC", green: "#2E8B57", greenSoft: "#DEF2E6",
  late: "#C13B2F", lateSoft: "#FBE1DC", panel: "#EEF1F3", panel2: "#F6F7F8",
  line: "#D7DCE1", vu: "#5B4EA6", vuSoft: "#E7E3F6", white: "#ffffff",
};

const STATUS_STYLE = {
  Brouillon: { bg: C.panel, fg: C.inkSoft },
  "Envoyé": { bg: C.accentSoft, fg: "#9A4B08" },
  Vu: { bg: C.vuSoft, fg: C.vu },
  Accepté: { bg: C.greenSoft, fg: C.green },
  Payé: { bg: C.greenSoft, fg: C.green },
  "En retard": { bg: C.lateSoft, fg: C.late },
};

const euro = (n) => Number(n || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—";
const totalTTC = (lignes) => (lignes || []).reduce((s, l) => s + Number(l.qte) * Number(l.pu) * (1 + Number(l.tva) / 100), 0);
const uid = () => Math.random().toString(36).slice(2, 9);

function Badge({ statut }) {
  const s = STATUS_STYLE[statut] || STATUS_STYLE.Brouillon;
  return <span style={{ background: s.bg, color: s.fg, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, whiteSpace: "nowrap" }}>{statut}</span>;
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: C.ink, color: "#fff", padding: "12px 20px", borderRadius: 14, fontSize: 14, fontWeight: 600, zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>
      {msg}
    </div>
  );
}

// AUTH
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setLoading(true); setError("");
    try {
      const res = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (res.error) throw res.error;
      if (res.data?.user) onAuth(res.data.user);
      else setError("Vérifiez votre email pour confirmer votre inscription.");
    } catch (e) { setError(e.message || "Erreur"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.panel2, padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: C.ink, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 22, fontWeight: 800, color: C.accent, fontFamily: "monospace" }}>A</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.ink, margin: 0 }}>L'Ardoise</h1>
          <p style={{ fontSize: 14, color: C.inkSoft, margin: "4px 0 0" }}>Devis & factures en 2 minutes</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.ink, margin: "0 0 4px" }}>{mode === "login" ? "Connexion" : "Créer un compte"}</h2>
          <p style={{ fontSize: 13, color: C.inkSoft, margin: "0 0 20px" }}>{mode === "login" ? "Content de vous revoir !" : "Gratuit, sans carte bancaire."}</p>
          {error && <div style={{ background: C.lateSoft, color: C.late, padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <label style={{ display: "block", marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, display: "block", marginBottom: 6 }}>EMAIL</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@email.fr" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 16, outline: "none", boxSizing: "border-box", color: C.ink }} />
          </label>
          <label style={{ display: "block", marginBottom: 20 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, display: "block", marginBottom: 6 }}>MOT DE PASSE</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 16, outline: "none", boxSizing: "border-box", color: C.ink }} />
          </label>
          <button onClick={handle} disabled={loading} style={{ width: "100%", padding: "16px", background: C.ink, color: "#fff", borderRadius: 14, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer" }}>
            {loading ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
          <p style={{ textAlign: "center", fontSize: 13, color: C.inkSoft, marginTop: 16 }}>
            {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} style={{ color: C.blue, fontWeight: 600, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// BOTTOM NAV
function BottomNav({ view, setView }) {
  const items = [
    { id: "dashboard", icon: LayoutDashboard, label: "Accueil" },
    { id: "documents", icon: FileText, label: "Documents" },
    { id: "relances", icon: Bell, label: "Relances" },
    { id: "settings", icon: Settings, label: "Réglages" },
  ];
  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `1px solid ${C.line}`, display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)" }}>
      {items.map(n => (
        <button key={n.id} onClick={() => setView(n.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 0 8px", background: "none", border: "none", cursor: "pointer", color: view === n.id ? C.ink : C.inkSoft }}>
          <n.icon size={22} strokeWidth={view === n.id ? 2.5 : 1.8} />
          <span style={{ fontSize: 10, fontWeight: view === n.id ? 700 : 400, marginTop: 3 }}>{n.label}</span>
          {view === n.id && <div style={{ width: 4, height: 4, borderRadius: 2, background: C.accent, marginTop: 3 }} />}
        </button>
      ))}
    </nav>
  );
}

// FAB
function FAB({ onClick }) {
  return (
    <button onClick={onClick} style={{ position: "fixed", bottom: 80, right: 20, width: 56, height: 56, borderRadius: 28, background: C.accent, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(232,114,12,0.4)", zIndex: 40 }}>
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
}

// DASHBOARD
function Dashboard({ documents, clients, setView }) {
  const ca = documents.filter(d => d.type === "facture" && d.statut === "Payé").reduce((s, d) => s + totalTTC(d.lignes), 0);
  const attente = documents.filter(d => d.type === "facture" && !["Payé", "Brouillon"].includes(d.statut)).reduce((s, d) => s + totalTTC(d.lignes), 0);
  const retard = documents.filter(d => d.statut === "En retard").length;
  const recent = documents.slice(0, 3);

  return (
    <div style={{ padding: "0 16px 100px" }}>
      {/* Header */}
      <div style={{ padding: "20px 0 16px" }}>
        <p style={{ fontSize: 13, color: C.inkSoft, margin: 0 }}>Bonjour 👋</p>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: "2px 0 0", fontFamily: "system-ui" }}>Tableau de bord</h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "CA encaissé", val: euro(ca), color: C.green, icon: TrendingUp },
          { label: "En attente", val: euro(attente), color: C.accent, icon: Clock },
          { label: "Total clients", val: clients.length, color: C.blue, icon: Users },
          { label: "En retard", val: retard, color: C.late, icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 16, padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={16} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "monospace", lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Récents */}
      {recent.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: 0 }}>Récents</h2>
            <button onClick={() => setView("documents")} style={{ fontSize: 13, color: C.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {recent.map((d, i) => (
              <div key={d.id} style={{ padding: "14px 16px", borderBottom: i < recent.length - 1 ? `1px solid ${C.line}` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>N°{d.numero}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <Badge statut={d.statut} />
                    <span style={{ fontSize: 12, color: C.inkSoft }}>{fmtDate(d.date_creation)}</span>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.blueDeep, fontFamily: "monospace" }}>{euro(totalTTC(d.lignes))}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recent.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, margin: "0 0 6px" }}>Aucun document</p>
          <p style={{ fontSize: 13, color: C.inkSoft, margin: 0 }}>Créez votre premier devis avec le bouton +</p>
        </div>
      )}
    </div>
  );
}

// LISTE DOCUMENTS
function DocumentsList({ documents, clients, onOpen, showToast, loadAll }) {
  const [filter, setFilter] = useState("Tous");
  const statuts = ["Tous", "Brouillon", "Envoyé", "Accepté", "Payé", "En retard"];
  const filtered = filter === "Tous" ? documents : documents.filter(d => d.statut === filter);
  const getClient = id => clients.find(c => c.id === id);

  const deleteDoc = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Supprimer ?")) return;
    await supabase.from("documents").delete().eq("id", id);
    await loadAll(); showToast("Supprimé.");
  };

  return (
    <div style={{ padding: "0 0 100px" }}>
      <div style={{ padding: "20px 16px 12px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>Devis & Factures</h1>
      </div>

      {/* Filtres scrollables */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 16px", scrollbarWidth: "none" }}>
        {statuts.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: filter === s ? C.ink : "#fff", color: filter === s ? "#fff" : C.inkSoft, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", borderRadius: 20 }}>
            <p style={{ fontSize: 14, color: C.inkSoft }}>Aucun document dans cette catégorie.</p>
          </div>
        )}
        {filtered.map(d => (
          <div key={d.id} onClick={() => onOpen(d.id)} style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>N°{d.numero}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.panel, color: C.inkSoft, fontWeight: 500 }}>{d.type}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge statut={d.statut} />
                <span style={{ fontSize: 12, color: C.inkSoft }}>{getClient(d.client_id)?.nom || "—"}</span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.blueDeep, fontFamily: "monospace" }}>{euro(totalTTC(d.lignes))}</div>
              <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 2 }}>{fmtDate(d.date_creation)}</div>
            </div>
            <button onClick={e => deleteDoc(d.id, e)} style={{ padding: 8, background: C.lateSoft, border: "none", borderRadius: 10, cursor: "pointer", color: C.late, flexShrink: 0 }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// FORMULAIRE DOCUMENT
function DocumentForm({ doc, clients, prestations, user, onBack, onSave }) {
  const [type, setType] = useState(doc?.type || "devis");
  const [statut, setStatut] = useState(doc?.statut || "Brouillon");
  const [clientId, setClientId] = useState(doc?.client_id || "");
  const [dateCreation, setDateCreation] = useState(doc?.date_creation || todayISO());
  const [dateEcheance, setDateEcheance] = useState(doc?.date_echeance || "");
  const [lignes, setLignes] = useState(doc?.lignes?.length ? doc.lignes : [{ id: uid(), designation: "", qte: 1, pu: 0, tva: 20 }]);
  const [saving, setSaving] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ nom: "", email: "", tel: "" });
  const numero = doc?.numero || `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
  const total = totalTTC(lignes);

  const addLigne = () => setLignes(l => [...l, { id: uid(), designation: "", qte: 1, pu: 0, tva: 20 }]);
  const removeLigne = id => setLignes(l => l.filter(x => x.id !== id));
  const updateLigne = (id, key, val) => setLignes(l => l.map(x => x.id === id ? { ...x, [key]: val } : x));

  const addClient = async () => {
    if (!newClient.nom.trim()) return;
    const { data } = await supabase.from("clients").insert({ ...newClient, user_id: user.id }).select().single();
    if (data) { setClientId(data.id); setShowNewClient(false); }
  };

  const save = async () => {
    setSaving(true);
    await onSave({ numero, type, statut, client_id: clientId || null, date_creation: dateCreation, date_echeance: dateEcheance || null, lignes });
    setSaving(false);
  };

  const inputStyle = { width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 16, outline: "none", boxSizing: "border-box", color: C.ink, background: "#fff" };
  const labelStyle = { display: "block", marginBottom: 14 };
  const labelTextStyle = { fontSize: 12, fontWeight: 600, color: C.inkSoft, display: "block", marginBottom: 6 };

  return (
    <div style={{ padding: "0 0 120px" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${C.line}`, background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: C.panel, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft size={20} color={C.ink} />
        </button>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: C.ink, margin: 0 }}>{doc ? "Modifier" : "Nouveau"} — N°{numero}</h1>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Type + Statut */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
          <label style={labelStyle}>
            <span style={labelTextStyle}>TYPE</span>
            <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
              <option value="devis">Devis</option>
              <option value="facture">Facture</option>
            </select>
          </label>
          <label style={labelStyle}>
            <span style={labelTextStyle}>STATUT</span>
            <select value={statut} onChange={e => setStatut(e.target.value)} style={inputStyle}>
              {Object.keys(STATUS_STYLE).map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>

        {/* Dates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
          <label style={labelStyle}>
            <span style={labelTextStyle}>DATE</span>
            <input type="date" value={dateCreation} onChange={e => setDateCreation(e.target.value)} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            <span style={labelTextStyle}>ÉCHÉANCE</span>
            <input type="date" value={dateEcheance} onChange={e => setDateEcheance(e.target.value)} style={inputStyle} />
          </label>
        </div>

        {/* Client */}
        <label style={labelStyle}>
          <span style={labelTextStyle}>CLIENT</span>
          <select value={clientId} onChange={e => setClientId(e.target.value)} style={inputStyle}>
            <option value="">— Sélectionner —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </label>
        <button onClick={() => setShowNewClient(!showNewClient)} style={{ fontSize: 13, color: C.blue, background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 16, padding: 0 }}>
          + Nouveau client
        </button>

        {showNewClient && (
          <div style={{ background: C.panel2, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            {[["NOM", "nom", "text"], ["EMAIL", "email", "email"], ["TÉLÉPHONE", "tel", "tel"]].map(([lbl, key, type]) => (
              <label key={key} style={labelStyle}>
                <span style={labelTextStyle}>{lbl}</span>
                <input type={type} value={newClient[key]} onChange={e => setNewClient(n => ({ ...n, [key]: e.target.value }))} style={inputStyle} />
              </label>
            ))}
            <button onClick={addClient} style={{ width: "100%", padding: 14, background: C.ink, color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>Créer le client</button>
          </div>
        )}

        {/* Lignes */}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: "0 0 12px" }}>Prestations</h2>
        {lignes.map(l => (
          <div key={l.id} style={{ background: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
            <label style={labelStyle}>
              <span style={labelTextStyle}>DÉSIGNATION</span>
              <input value={l.designation} onChange={e => updateLigne(l.id, "designation", e.target.value)} placeholder="Ex: Installation électrique..." style={inputStyle} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <label style={labelStyle}>
                <span style={labelTextStyle}>QTÉ</span>
                <input type="number" value={l.qte} onChange={e => updateLigne(l.id, "qte", e.target.value)} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>PU HT</span>
                <input type="number" value={l.pu} onChange={e => updateLigne(l.id, "pu", e.target.value)} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                <span style={labelTextStyle}>TVA %</span>
                <input type="number" value={l.tva} onChange={e => updateLigne(l.id, "tva", e.target.value)} style={inputStyle} />
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.blueDeep, fontFamily: "monospace" }}>{euro(l.qte * l.pu * (1 + l.tva / 100))}</span>
              <button onClick={() => removeLigne(l.id)} style={{ padding: 8, background: C.lateSoft, border: "none", borderRadius: 10, cursor: "pointer", color: C.late }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        <button onClick={addLigne} style={{ width: "100%", padding: 14, background: C.panel2, color: C.ink, borderRadius: 14, fontSize: 15, fontWeight: 600, border: `1.5px dashed ${C.line}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <Plus size={18} /> Ajouter une prestation
        </button>

        {/* Total */}
        <div style={{ background: C.ink, borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Total TTC</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{euro(total)}</span>
        </div>

        {/* Bouton save */}
        <button onClick={save} disabled={saving} style={{ width: "100%", padding: 18, background: C.accent, color: "#fff", borderRadius: 16, fontSize: 17, fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(232,114,12,0.35)" }}>
          {saving ? "Enregistrement..." : "✓ Enregistrer"}
        </button>
      </div>
    </div>
  );
}

// RELANCES
function RelancesView({ documents, clients, settings, setSettings }) {
  const factures = documents.filter(d => d.type === "facture" && d.statut !== "Payé");
  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>Relances</h1>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>Relances automatiques</div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>Email envoyé aux clients en retard</div>
          </div>
          <button onClick={() => setSettings(s => ({ ...s, actif: !s.actif }))} style={{ width: 50, height: 28, borderRadius: 14, background: settings.actif ? C.green : C.line, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <span style={{ position: "absolute", top: 3, width: 22, height: 22, borderRadius: 11, background: "#fff", transition: "left 0.2s", left: settings.actif ? 25 : 3 }} />
          </button>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Délais de relance</div>
        {[{ key: "j1", label: "1er rappel" }, { key: "j2", label: "2e rappel" }, { key: "j3", label: "Mise en demeure" }].map(r => (
          <div key={r.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${C.line}` }}>
            <span style={{ fontSize: 14, color: C.ink }}>{r.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: C.inkSoft }}>J+</span>
              <input type="number" value={settings[r.key]} onChange={e => setSettings(s => ({ ...s, [r.key]: parseInt(e.target.value) || 0 }))} style={{ width: 60, padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 15, textAlign: "center", outline: "none" }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 12 }}>Factures suivies ({factures.length})</div>
        {factures.length === 0 && <p style={{ fontSize: 13, color: C.inkSoft, margin: 0 }}>Aucune facture en attente. 🎉</p>}
        {factures.map(f => (
          <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${C.line}` }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>N°{f.numero}</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>{clients.find(c => c.id === f.client_id)?.nom || "—"}</div>
            </div>
            <Badge statut={f.statut} />
          </div>
        ))}
      </div>
    </div>
  );
}

// SETTINGS
function SettingsView({ entreprise, setEntreprise, showToast, onLogout }) {
  const set = (k, v) => setEntreprise(e => ({ ...e, [k]: v }));
  const inputStyle = { width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 16, outline: "none", boxSizing: "border-box", color: C.ink };

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.ink, margin: 0 }}>Réglages</h1>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Mon entreprise</div>
        {[["Nom de l'entreprise", "nom"], ["SIRET", "siret"], ["Assurance décennale", "assurance"], ["N° RGE", "rge"], ["IBAN", "iban"]].map(([label, key]) => (
          <label key={key} style={{ display: "block", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, display: "block", marginBottom: 6 }}>{label.toUpperCase()}</span>
            <input value={entreprise[key] || ""} onChange={e => set(key, e.target.value)} style={inputStyle} />
          </label>
        ))}
        <button onClick={() => showToast("Enregistré !")} style={{ width: "100%", padding: 16, background: C.ink, color: "#fff", borderRadius: 14, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", marginTop: 4 }}>
          Enregistrer
        </button>
      </div>
      <button onClick={onLogout} style={{ width: "100%", padding: 16, background: C.lateSoft, color: C.late, borderRadius: 14, fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer" }}>
        Se déconnecter
      </button>
    </div>
  );
}

// APP PRINCIPALE
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [clients, setClients] = useState([]);
  const [prestations, setPrestations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [reminderSettings, setReminderSettings] = useState({ actif: true, j1: 7, j2: 15, j3: 30 });
  const [entreprise, setEntreprise] = useState({ nom: "", siret: "", assurance: "", rge: "", iban: "" });

  const showToast = msg => setToast(msg);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user || null); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (user) loadAll(); }, [user]);

  const loadAll = async () => {
    const [{ data: cls }, { data: prs }, { data: docs }] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase.from("prestations").select("*").order("created_at", { ascending: false }),
      supabase.from("documents").select("*, lignes(*)").order("created_at", { ascending: false }),
    ]);
    setClients(cls || []);
    setPrestations(prs || []);
    setDocuments((docs || []).map(d => ({ ...d, lignes: d.lignes || [] })));
  };

  const logout = async () => { await supabase.auth.signOut(); setUser(null); };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.inkSoft, fontSize: 16 }}>Chargement…</div>;
  if (!user) return <AuthScreen onAuth={setUser} />;

  const currentDoc = documents.find(d => d.id === currentDocId);
  const isForm = view === "newdoc" || view === "editdoc";

  return (
    <div style={{ minHeight: "100vh", background: C.panel2, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 480, margin: "0 auto" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {view === "dashboard" && <Dashboard documents={documents} clients={clients} setView={setView} />}
      {view === "documents" && <DocumentsList documents={documents} clients={clients} onOpen={id => { setCurrentDocId(id); setView("editdoc"); }} showToast={showToast} loadAll={loadAll} />}
      {view === "newdoc" && (
        <DocumentForm doc={null} clients={clients} prestations={prestations} user={user}
          onBack={() => setView("documents")}
          onSave={async data => {
            const { lignes: lignesData, ...docData } = data;
            const { data: doc, error } = await supabase.from("documents").insert({ ...docData, user_id: user.id }).select().single();
            if (error) { showToast("Erreur: " + error.message); return; }
            if (lignesData?.length) await supabase.from("lignes").insert(lignesData.map(({ id, ...l }) => ({ ...l, document_id: doc.id })));
            await loadAll(); showToast("Devis créé ! ✓"); setView("documents");
          }}
        />
      )}
      {view === "editdoc" && currentDoc && (
        <DocumentForm doc={currentDoc} clients={clients} prestations={prestations} user={user}
          onBack={() => { setCurrentDocId(null); setView("documents"); }}
          onSave={async data => {
            const { lignes: lignesData, ...docData } = data;
            await supabase.from("documents").update(docData).eq("id", currentDoc.id);
            await supabase.from("lignes").delete().eq("document_id", currentDoc.id);
            if (lignesData?.length) await supabase.from("lignes").insert(lignesData.map(({ id, ...l }) => ({ ...l, document_id: currentDoc.id })));
            await loadAll(); showToast("Enregistré ! ✓"); setCurrentDocId(null); setView("documents");
          }}
        />
      )}
      {view === "relances" && <RelancesView documents={documents} clients={clients} settings={reminderSettings} setSettings={setReminderSettings} />}
      {view === "settings" && <SettingsView entreprise={entreprise} setEntreprise={setEntreprise} showToast={showToast} onLogout={logout} />}

      {!isForm && <BottomNav view={view} setView={setView} />}
      {(view === "dashboard" || view === "documents") && (
        <FAB onClick={() => setView("newdoc")} />
      )}
    </div>
  );
}
