import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, FileText, Bell, Settings, Plus, Trash2, Send,
  ArrowLeft, CheckCircle2, Clock, AlertTriangle, Download, Eye,
  Menu, X, ChevronRight, Building2, Mail, Lock, Sparkles, Info
} from "lucide-react";

// ---------- Supabase ----------
const SUPABASE_URL = "https://wbpfykonxqkpgkhlwkhy.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndicGZ5a29ueHFrcGdraGx3a2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNDI4MzUsImV4cCI6MjEwMzYxODgzNX0.rg29B9fuDBFThwKqrXXARAPEFKntdDKCR6-VbBaVPTM";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ---------- Palette ----------
const C = {
  ink: "#16263A", inkSoft: "#55677A", blue: "#2C5B76", blueDeep: "#1D4155",
  accent: "#E8720C", accentSoft: "#FCE4CC", green: "#2E8B57", greenSoft: "#DEF2E6",
  late: "#C13B2F", lateSoft: "#FBE1DC", panel: "#EEF1F3", panel2: "#F6F7F8",
  line: "#D7DCE1", vu: "#5B4EA6", vuSoft: "#E7E3F6",
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
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const totalTTC = (lignes) => (lignes || []).reduce((s, l) => s + Number(l.qte) * Number(l.pu) * (1 + Number(l.tva) / 100), 0);

// ---------- UI Composants ----------
function Badge({ statut }) {
  const s = STATUS_STYLE[statut] || STATUS_STYLE.Brouillon;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: s.bg, color: s.fg }}>{statut}</span>;
}

function Btn({ children, variant = "primary", className = "", style = {}, loading = false, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-2.5 text-sm transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: { background: C.accent, color: "#fff" },
    dark: { background: C.ink, color: "#fff" },
    ghost: { background: "#fff", color: C.ink, border: `1px solid ${C.line}` },
    subtle: { background: C.panel2, color: C.ink },
  };
  return <button className={base + " " + className} style={{ ...styles[variant], ...style }} disabled={loading} {...props}>{loading ? "..." : children}</button>;
}

function Card({ children, className = "", style = {} }) {
  return <div className={"bg-white rounded-2xl border " + className} style={{ borderColor: C.line, ...style }}>{children}</div>;
}

function Field({ label, children }) {
  return <label className="block mb-4"><span className="block text-xs font-semibold mb-1.5" style={{ color: C.inkSoft }}>{label}</span>{children}</label>;
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg text-sm outline-none border bg-white focus:border-blue-400";
const inputStyle = { borderColor: C.line, color: C.ink };

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white" style={{ background: C.ink }}>{msg}</div>;
}

// ---------- AUTH ----------
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setLoading(true); setError("");
    try {
      let res;
      if (mode === "login") {
        res = await supabase.auth.signInWithPassword({ email, password });
      } else {
        res = await supabase.auth.signUp({ email, password });
      }
      if (res.error) throw res.error;
      if (res.data?.user) onAuth(res.data.user);
      else setError("Vérifiez votre email pour confirmer votre inscription.");
    } catch (e) {
      setError(e.message || "Erreur de connexion");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: C.panel2 }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: C.ink, color: C.accent, fontFamily: "IBM Plex Mono, monospace" }}>A</div>
          <span className="text-xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}>L'Ardoise</span>
        </div>
        <Card className="p-6">
          <h1 className="text-lg font-bold mb-1" style={{ color: C.ink }}>{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
          <p className="text-sm mb-5" style={{ color: C.inkSoft }}>{mode === "login" ? "Content de vous revoir !" : "Gratuit, sans carte bancaire."}</p>
          {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: C.lateSoft, color: C.late }}>{error}</div>}
          <Field label="Email"><input className={inputCls} style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@email.fr" /></Field>
          <Field label="Mot de passe"><input className={inputCls} style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} /></Field>
          <Btn variant="dark" className="w-full mt-2" onClick={handle} loading={loading}>{mode === "login" ? "Se connecter" : "Créer mon compte"}</Btn>
          <p className="text-center text-xs mt-4" style={{ color: C.inkSoft }}>
            {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
            <button className="font-semibold underline" style={{ color: C.blue }} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}

// ---------- APP PRINCIPALE ----------
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [clients, setClients] = useState([]);
  const [prestations, setPrestations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [reminderSettings, setReminderSettings] = useState({ actif: true, j1: 7, j2: 15, j3: 30 });
  const [entreprise, setEntreprise] = useState({ nom: "", siret: "", assurance: "", rge: "", iban: "" });

  const showToast = (msg) => setToast(msg);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load data
  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

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

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ color: C.inkSoft }}>Chargement…</div>;
  if (!user) return <AuthScreen onAuth={setUser} />;

  const currentDoc = documents.find(d => d.id === currentDocId);
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { id: "documents", icon: FileText, label: "Devis & Factures" },
    { id: "relances", icon: Bell, label: "Relances" },
    { id: "settings", icon: Settings, label: "Réglages" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: C.panel2, fontFamily: "Inter, sans-serif" }}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r py-6 px-4" style={{ background: "#fff", borderColor: C.line }}>
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: C.ink, color: C.accent, fontFamily: "IBM Plex Mono, monospace" }}>A</div>
          <span className="font-bold text-base" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}>L'Ardoise</span>
        </div>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition" style={{ background: view === n.id ? C.panel : "transparent", color: view === n.id ? C.ink : C.inkSoft }}>
            <n.icon size={17} />{n.label}
          </button>
        ))}
        <div className="mt-auto">
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs w-full" style={{ color: C.inkSoft }}>
            <X size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white" style={{ borderColor: C.line }}>
          <span className="font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>L'Ardoise</span>
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)}>{mobileNavOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </header>
        {mobileNavOpen && (
          <div className="md:hidden bg-white border-b px-4 pb-4" style={{ borderColor: C.line }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => { setView(n.id); setMobileNavOpen(false); }} className="flex items-center gap-3 py-3 text-sm font-medium w-full border-b last:border-0" style={{ borderColor: C.line, color: view === n.id ? C.ink : C.inkSoft }}>
                <n.icon size={17} />{n.label}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 md:p-8">
          {view === "dashboard" && <Dashboard documents={documents} clients={clients} setView={setView} />}
          {view === "documents" && !currentDocId && (
            <DocumentsList
              documents={documents} clients={clients} filterStatut={filterStatut}
              setFilterStatut={setFilterStatut}
              onNew={() => { setCurrentDocId(null); setView("newdoc"); }}
              onOpen={(id) => { setCurrentDocId(id); setView("editdoc"); }}
              showToast={showToast} loadAll={loadAll} user={user}
            />
          )}
          {view === "newdoc" && (
            <DocumentForm
              doc={null} clients={clients} prestations={prestations} user={user}
              onBack={() => setView("documents")}
              onSave={async (data) => {
                const { data: doc, error } = await supabase.from("documents").insert({ ...data, user_id: user.id }).select().single();
                if (error) { showToast("Erreur : " + error.message); return; }
                if (data.lignes?.length) {
                  await supabase.from("lignes").insert(data.lignes.map(l => ({ ...l, document_id: doc.id })));
                }
                await loadAll(); showToast("Document créé !"); setView("documents");
              }}
            />
          )}
          {view === "editdoc" && currentDoc && (
            <DocumentForm
              doc={currentDoc} clients={clients} prestations={prestations} user={user}
              onBack={() => { setCurrentDocId(null); setView("documents"); }}
              onSave={async (data) => {
                await supabase.from("documents").update({ ...data, lignes: undefined }).eq("id", currentDoc.id);
                await supabase.from("lignes").delete().eq("document_id", currentDoc.id);
                if (data.lignes?.length) {
                  await supabase.from("lignes").insert(data.lignes.map(l => ({ ...l, document_id: currentDoc.id })));
                }
                await loadAll(); showToast("Enregistré !"); setCurrentDocId(null); setView("documents");
              }}
            />
          )}
          {view === "relances" && <RelancesView documents={documents} clients={clients} settings={reminderSettings} setSettings={setReminderSettings} />}
          {view === "settings" && <SettingsView entreprise={entreprise} setEntreprise={setEntreprise} showToast={showToast} onLogout={logout} />}
        </div>
      </main>
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard({ documents, clients, setView }) {
  const ca = documents.filter(d => d.type === "facture" && d.statut === "Payé").reduce((s, d) => s + totalTTC(d.lignes), 0);
  const attente = documents.filter(d => d.type === "facture" && d.statut !== "Payé" && d.statut !== "Brouillon").reduce((s, d) => s + totalTTC(d.lignes), 0);
  const retard = documents.filter(d => d.statut === "En retard").length;
  const devisEnCours = documents.filter(d => d.type === "devis" && d.statut === "Envoyé").length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}>Tableau de bord</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "CA encaissé", val: euro(ca), color: C.green },
          { label: "En attente", val: euro(attente), color: C.accent },
          { label: "Devis en cours", val: devisEnCours, color: C.blue },
          { label: "Retards", val: retard, color: C.late },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-xs mb-1 font-medium" style={{ color: C.inkSoft }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color, fontFamily: "IBM Plex Mono, monospace" }}>{s.val}</div>
          </Card>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        <Btn variant="primary" onClick={() => setView("newdoc")}><Plus size={16} /> Nouveau devis</Btn>
        <Btn variant="ghost" onClick={() => setView("documents")}><FileText size={16} /> Voir tout</Btn>
      </div>
    </div>
  );
}

// ---------- Liste documents ----------
function DocumentsList({ documents, clients, filterStatut, setFilterStatut, onNew, onOpen, showToast, loadAll, user }) {
  const statuts = ["Tous", "Brouillon", "Envoyé", "Accepté", "Payé", "En retard"];
  const filtered = filterStatut === "Tous" ? documents : documents.filter(d => d.statut === filterStatut);
  const getClient = (id) => clients.find(c => c.id === id);

  const deleteDoc = async (id) => {
    if (!confirm("Supprimer ce document ?")) return;
    await supabase.from("documents").delete().eq("id", id);
    await loadAll(); showToast("Supprimé.");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}>Devis & Factures</h1>
        <Btn variant="primary" onClick={onNew}><Plus size={16} /> Nouveau</Btn>
      </div>
      <div className="flex gap-2 flex-wrap mb-5">
        {statuts.map(s => (
          <button key={s} onClick={() => setFilterStatut(s)} className="px-3 py-1.5 rounded-full text-xs font-semibold border transition" style={{ background: filterStatut === s ? C.ink : "#fff", color: filterStatut === s ? "#fff" : C.inkSoft, borderColor: filterStatut === s ? C.ink : C.line }}>{s}</button>
        ))}
      </div>
      <Card>
        {filtered.length === 0 && <div className="p-8 text-center text-sm" style={{ color: C.inkSoft }}>Aucun document. Créez votre premier devis !</div>}
        {filtered.map((d, i) => (
          <div key={d.id} className="flex items-center gap-3 px-5 py-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition" style={{ borderColor: C.line }} onClick={() => onOpen(d.id)}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-sm" style={{ color: C.ink }}>N°{d.numero}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.panel, color: C.inkSoft }}>{d.type}</span>
                <Badge statut={d.statut} />
              </div>
              <div className="text-xs" style={{ color: C.inkSoft }}>{getClient(d.client_id)?.nom || "—"} · {fmtDate(d.date_creation)}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-sm" style={{ fontFamily: "IBM Plex Mono, monospace", color: C.blueDeep }}>{euro(totalTTC(d.lignes))}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); deleteDoc(d.id); }} className="p-1.5 rounded-lg hover:bg-red-50 transition" style={{ color: C.late }}><Trash2 size={15} /></button>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ---------- Formulaire document ----------
function DocumentForm({ doc, clients, prestations, user, onBack, onSave }) {
  const uid = () => Math.random().toString(36).slice(2, 9);
  const [type, setType] = useState(doc?.type || "devis");
  const [statut, setStatut] = useState(doc?.statut || "Brouillon");
  const [clientId, setClientId] = useState(doc?.client_id || "");
  const [dateCreation, setDateCreation] = useState(doc?.date_creation || todayISO());
  const [dateEcheance, setDateEcheance] = useState(doc?.date_echeance || "");
  const [lignes, setLignes] = useState(doc?.lignes?.length ? doc.lignes : [{ id: uid(), designation: "", qte: 1, pu: 0, tva: 20 }]);
  const [saving, setSaving] = useState(false);
  const [newClient, setNewClient] = useState({ nom: "", email: "", tel: "", adresse: "" });
  const [showNewClient, setShowNewClient] = useState(false);

  const numero = doc?.numero || `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
  const total = totalTTC(lignes);

  const addLigne = () => setLignes(l => [...l, { id: uid(), designation: "", qte: 1, pu: 0, tva: 20 }]);
  const removeLigne = (id) => setLignes(l => l.filter(x => x.id !== id));
  const updateLigne = (id, key, val) => setLignes(l => l.map(x => x.id === id ? { ...x, [key]: val } : x));

  const addClient = async () => {
    if (!newClient.nom.trim()) return;
    const { data } = await supabase.from("clients").insert({ ...newClient, user_id: user.id }).select().single();
    if (data) { setClientId(data.id); setShowNewClient(false); setNewClient({ nom: "", email: "", tel: "", adresse: "" }); }
  };

  const save = async () => {
    setSaving(true);
    await onSave({ numero, type, statut, client_id: clientId || null, date_creation: dateCreation, date_echeance: dateEcheance || null, lignes });
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6 font-medium" style={{ color: C.inkSoft }}><ArrowLeft size={16} /> Retour</button>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}>{doc ? "Modifier" : "Nouveau document"} — N°{numero}</h1>

      <Card className="p-5 mb-4">
        <h2 className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Informations</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <select className={inputCls} style={inputStyle} value={type} onChange={e => setType(e.target.value)}>
              <option value="devis">Devis</option>
              <option value="facture">Facture</option>
            </select>
          </Field>
          <Field label="Statut">
            <select className={inputCls} style={inputStyle} value={statut} onChange={e => setStatut(e.target.value)}>
              {Object.keys(STATUS_STYLE).map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Date de création">
            <input type="date" className={inputCls} style={inputStyle} value={dateCreation} onChange={e => setDateCreation(e.target.value)} />
          </Field>
          <Field label="Date d'échéance">
            <input type="date" className={inputCls} style={inputStyle} value={dateEcheance} onChange={e => setDateEcheance(e.target.value)} />
          </Field>
        </div>
        <Field label="Client">
          <select className={inputCls} style={inputStyle} value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">— Sélectionner un client —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </Field>
        <button className="text-xs font-semibold mt-1" style={{ color: C.blue }} onClick={() => setShowNewClient(!showNewClient)}>+ Nouveau client</button>
        {showNewClient && (
          <div className="mt-3 p-4 rounded-xl border" style={{ borderColor: C.line }}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom"><input className={inputCls} style={inputStyle} value={newClient.nom} onChange={e => setNewClient(n => ({ ...n, nom: e.target.value }))} /></Field>
              <Field label="Email"><input className={inputCls} style={inputStyle} value={newClient.email} onChange={e => setNewClient(n => ({ ...n, email: e.target.value }))} /></Field>
              <Field label="Téléphone"><input className={inputCls} style={inputStyle} value={newClient.tel} onChange={e => setNewClient(n => ({ ...n, tel: e.target.value }))} /></Field>
              <Field label="Adresse"><input className={inputCls} style={inputStyle} value={newClient.adresse} onChange={e => setNewClient(n => ({ ...n, adresse: e.target.value }))} /></Field>
            </div>
            <Btn variant="dark" className="mt-2" onClick={addClient}>Créer le client</Btn>
          </div>
        )}
      </Card>

      <Card className="p-5 mb-4">
        <h2 className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Prestations</h2>
        {lignes.map(l => (
          <div key={l.id} className="grid grid-cols-12 gap-2 mb-3 items-end">
            <div className="col-span-5"><Field label="Désignation"><input className={inputCls} style={inputStyle} value={l.designation} onChange={e => updateLigne(l.id, "designation", e.target.value)} placeholder="Prestation…" /></Field></div>
            <div className="col-span-2"><Field label="Qté"><input type="number" className={inputCls} style={inputStyle} value={l.qte} onChange={e => updateLigne(l.id, "qte", e.target.value)} /></Field></div>
            <div className="col-span-2"><Field label="PU HT"><input type="number" className={inputCls} style={inputStyle} value={l.pu} onChange={e => updateLigne(l.id, "pu", e.target.value)} /></Field></div>
            <div className="col-span-2"><Field label="TVA %"><input type="number" className={inputCls} style={inputStyle} value={l.tva} onChange={e => updateLigne(l.id, "tva", e.target.value)} /></Field></div>
            <div className="col-span-1 pb-4"><button onClick={() => removeLigne(l.id)} style={{ color: C.late }}><Trash2 size={16} /></button></div>
          </div>
        ))}
        <Btn variant="ghost" onClick={addLigne}><Plus size={15} /> Ligne</Btn>
        <div className="flex justify-between items-center mt-4 p-4 rounded-xl" style={{ background: C.panel2 }}>
          <span className="font-semibold text-sm">Total TTC</span>
          <span className="font-bold text-xl" style={{ fontFamily: "IBM Plex Mono, monospace", color: C.blueDeep }}>{euro(total)}</span>
        </div>
      </Card>

      <div className="flex gap-3">
        <Btn variant="dark" onClick={save} loading={saving}><CheckCircle2 size={16} /> Enregistrer</Btn>
        <Btn variant="ghost" onClick={onBack}>Annuler</Btn>
      </div>
    </div>
  );
}

// ---------- Relances ----------
function RelancesView({ documents, clients, settings, setSettings }) {
  const factures = documents.filter(d => d.type === "facture" && d.statut !== "Payé");
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}>Relances automatiques</h1>
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-sm" style={{ color: C.ink }}>Activer les relances</h2>
          <button onClick={() => setSettings(s => ({ ...s, actif: !s.actif }))} className="w-11 h-6 rounded-full relative transition" style={{ background: settings.actif ? C.green : C.line }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition" style={{ left: settings.actif ? 22 : 2 }} />
          </button>
        </div>
        <p className="text-xs" style={{ color: C.inkSoft }}>L'Ardoise envoie un email automatique quand une facture dépasse son échéance.</p>
      </Card>
      <Card className="p-5 mb-4">
        <h2 className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Délais des relances</h2>
        {[{ key: "j1", label: "1er rappel — ton courtois" }, { key: "j2", label: "2e rappel — ton ferme" }, { key: "j3", label: "Dernier rappel avant recouvrement" }].map(r => (
          <div key={r.key} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: C.line }}>
            <span className="text-sm" style={{ color: C.ink }}>{r.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: C.inkSoft }}>J+</span>
              <input type="number" className="w-16 px-2 py-1.5 rounded-lg text-sm text-center border" style={{ borderColor: C.line }} value={settings[r.key]} onChange={e => setSettings(s => ({ ...s, [r.key]: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
        ))}
      </Card>
      <Card className="p-5">
        <h2 className="font-semibold text-sm mb-3" style={{ color: C.ink }}>Factures suivies ({factures.length})</h2>
        {factures.length === 0 && <p className="text-xs" style={{ color: C.inkSoft }}>Aucune facture en attente.</p>}
        {factures.map(f => (
          <div key={f.id} className="flex items-center justify-between py-2.5 border-b last:border-0 text-sm" style={{ borderColor: C.line }}>
            <span>N°{f.numero} — {clients.find(c => c.id === f.client_id)?.nom || "—"}</span>
            <Badge statut={f.statut} />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ---------- Réglages ----------
function SettingsView({ entreprise, setEntreprise, showToast, onLogout }) {
  const set = (k, v) => setEntreprise(e => ({ ...e, [k]: v }));
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}>Réglages</h1>
      <Card className="p-5 mb-4">
        <h2 className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Mon entreprise</h2>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Field label="Nom de l'entreprise"><input className={inputCls} style={inputStyle} value={entreprise.nom} onChange={e => set("nom", e.target.value)} /></Field>
          <Field label="SIRET"><input className={inputCls} style={inputStyle} value={entreprise.siret} onChange={e => set("siret", e.target.value)} /></Field>
          <Field label="Assurance décennale"><input className={inputCls} style={inputStyle} value={entreprise.assurance} onChange={e => set("assurance", e.target.value)} /></Field>
          <Field label="N° RGE"><input className={inputCls} style={inputStyle} value={entreprise.rge} onChange={e => set("rge", e.target.value)} /></Field>
        </div>
        <Field label="IBAN"><input className={inputCls} style={inputStyle} value={entreprise.iban} onChange={e => set("iban", e.target.value)} /></Field>
        <Btn variant="dark" onClick={() => showToast("Informations enregistrées !")}>Enregistrer</Btn>
      </Card>
      <Card className="p-5">
        <h2 className="font-semibold text-sm mb-2" style={{ color: C.ink }}>Compte</h2>
        <Btn variant="ghost" onClick={onLogout}><X size={15} /> Se déconnecter</Btn>
      </Card>
    </div>
  );
}
