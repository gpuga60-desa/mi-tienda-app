import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJ5n8lVEMD6LQNZVsHbY_d8HhP96OlKWY",
  authDomain: "tiny-shop-a5895.firebaseapp.com",
  projectId: "tiny-shop-a5895",
  storageBucket: "tiny-shop-a5895.firebasestorage.app",
  messagingSenderId: "465448854657",
  appId: "1:465448854657:web:e4f6b9369c02b94d3a9980"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const KEYS = { products: "inv_products", sales: "inv_sales" };
const store = {
  async get(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch(e) { console.error(e); } }
};
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 }).format(Number(n) || 0);
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => { try { return new Date(d + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "2-digit" }); } catch { return d; } };
const daysSince = (d) => Math.floor((Date.now() - new Date(d + "T12:00:00").getTime()) / 86400000);

const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#F2EFE9;color:#1A1916;-webkit-font-smoothing:antialiased}
#root{min-height:100dvh;display:flex;flex-direction:column}
:root{
  --bg:#F2EFE9;--surface:#FFFFFF;--surface2:#F7F5F1;
  --primary:#1A6B5A;--primary-bg:#E3F2EE;--primary-hover:#145448;
  --amber:#A0600A;--amber-bg:#FEF3E2;
  --red:#B03A2E;--red-bg:#FDECEA;
  --green:#1A6B3A;--green-bg:#E3F2EA;
  --border:#E4E0D6;--border2:#D6D1C8;
  --muted:#7A776E;--radius:12px;--radius-sm:8px
}

/* HEADER */
.hdr{background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50;padding:0 16px}
.hdr-in{max-width:960px;margin:0 auto;height:54px;display:flex;align-items:center;gap:8px}
.logo{font-size:17px;font-weight:700;color:var(--primary);letter-spacing:-0.3px;white-space:nowrap}
.logo em{color:var(--amber);font-style:normal}
.nav{display:flex;gap:2px;margin-left:auto;flex-wrap:nowrap}
.nb{background:none;border:none;cursor:pointer;padding:7px 13px;border-radius:var(--radius-sm);font-family:inherit;font-size:13px;font-weight:500;color:var(--muted);transition:all .15s;display:flex;align-items:center;gap:5px;white-space:nowrap}
.nb:hover{background:var(--surface2);color:var(--primary)}
.nb.on{background:var(--primary-bg);color:var(--primary);font-weight:600}
.badge{background:var(--amber);color:#fff;border-radius:20px;padding:1px 7px;font-size:11px;font-weight:700}

/* MOBILE NAV */
.mnav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--surface);border-top:1px solid var(--border);z-index:50;padding:6px 0 max(env(safe-area-inset-bottom),6px)}
.mnav-in{display:flex;justify-content:space-around}
.mnb{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 12px;font-family:inherit;font-size:10px;font-weight:500;color:var(--muted);transition:color .15s;position:relative}
.mnb.on{color:var(--primary);font-weight:600}
.mnb-icon{font-size:19px;line-height:1}
.mnb-dot{position:absolute;top:2px;right:6px;width:8px;height:8px;border-radius:50%;background:var(--amber);border:2px solid var(--surface)}

/* MAIN */
.main{flex:1;max-width:960px;width:100%;margin:0 auto;padding:22px 16px 88px}

/* SECTION HEADER */
.sh{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;gap:12px}
.sh-title{font-size:22px;font-weight:700;letter-spacing:-0.3px}
.sh-sub{font-size:13px;color:var(--muted);margin-top:2px}

/* CARDS */
.card{background:var(--surface);border-radius:var(--radius);border:1px solid var(--border);padding:18px}
.card+.card{margin-top:12px}

/* STAT GRID */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.stat{background:var(--surface);border-radius:var(--radius);border:1px solid var(--border);padding:14px 16px}
.stat-l{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px}
.stat-v{font-size:22px;font-weight:700;letter-spacing:-0.5px;color:var(--primary)}
.stat-s{font-size:12px;color:var(--muted);margin-top:3px}
.stat.hi{background:var(--primary);border-color:var(--primary)}
.stat.hi .stat-l,.stat.hi .stat-v,.stat.hi .stat-s{color:rgba(255,255,255,.85)}
.stat.hi .stat-v{color:#fff}
.stat.warn{background:var(--amber-bg);border-color:#F0C882}
.stat.warn .stat-v{color:var(--amber)}

/* ALERTS */
.alert{padding:11px 14px;border-radius:var(--radius-sm);font-size:13px;display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:10px;font-weight:500}
.alert-w{background:var(--amber-bg);color:var(--amber);border:1px solid #F0C882}
.alert-r{background:var(--red-bg);color:var(--red);border:1px solid #F0BFBB}
.alert-g{background:var(--green-bg);color:var(--green);border:1px solid #B5DFC5}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:5px;padding:9px 16px;border-radius:var(--radius-sm);border:1px solid transparent;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;transition:all .15s;white-space:nowrap}
.btn-p{background:var(--primary);color:#fff;border-color:var(--primary)}
.btn-p:hover{background:var(--primary-hover)}
.btn-o{background:transparent;color:var(--muted);border-color:var(--border2)}
.btn-o:hover{background:var(--surface2);color:var(--primary)}
.btn-g{background:var(--green-bg);color:var(--green);border-color:#B5DFC5}
.btn-g:hover{background:var(--green);color:#fff}
.btn-r{background:var(--red-bg);color:var(--red);border-color:#F0BFBB}
.btn-r:hover{background:var(--red);color:#fff}
.btn-a{background:var(--amber);color:#fff;border-color:var(--amber)}
.btn-a:hover{opacity:.9}
.btn-sm{padding:6px 11px;font-size:12px;border-radius:6px}

/* TABLE */
.tw{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:13.5px}
th{text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);padding:8px 12px;border-bottom:1.5px solid var(--border)}
td{padding:11px 12px;border-bottom:1px solid var(--border);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--surface2)}

/* BADGES */
.bge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600}
.bg-g{background:var(--green-bg);color:var(--green)}
.bg-r{background:var(--red-bg);color:var(--red)}
.bg-y{background:var(--amber-bg);color:var(--amber)}
.bg-b{background:var(--primary-bg);color:var(--primary)}
.bg-m{background:var(--surface2);color:var(--muted)}

/* STOCK COLORS */
.s-ok{color:var(--green);font-weight:600}
.s-lo{color:var(--amber);font-weight:600}
.s-out{color:var(--red);font-weight:600}

/* MODAL */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:200;display:flex;align-items:flex-end;justify-content:center;animation:fi .15s}
@media(min-width:560px){.ov{align-items:center}}
@keyframes fi{from{opacity:0}to{opacity:1}}
.mdl{background:var(--surface);border-radius:20px 20px 0 0;padding:24px 20px 28px;width:100%;max-height:90dvh;overflow-y:auto;animation:su .2s}
@media(min-width:560px){.mdl{border-radius:16px;max-width:460px;padding:24px}}
@keyframes su{from{transform:translateY(32px);opacity:0}to{transform:translateY(0);opacity:1}}
.mdl-title{font-size:18px;font-weight:700;margin-bottom:18px;letter-spacing:-.2px}
.mdl-info{background:var(--surface2);border-radius:var(--radius-sm);padding:12px 14px;font-size:13px;margin-bottom:16px;color:var(--muted)}
.mdl-info strong{color:var(--primary)}

/* FORM */
.fg{margin-bottom:14px}
.fl{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin-bottom:5px;display:block}
.fi{width:100%;padding:10px 13px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--bg);font-family:inherit;font-size:14px;color:var(--primary);outline:none;transition:border .15s;-webkit-appearance:none}
.fi:focus{border-color:var(--primary);background:#fff}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fa{display:flex;gap:8px;justify-content:flex-end;margin-top:18px;padding-top:16px;border-top:1px solid var(--border)}

/* CART */
.ci{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--border)}
.ci:last-child{border-bottom:none}
.cqb{width:28px;height:28px;border-radius:6px;border:1.5px solid var(--border2);background:var(--bg);cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .1s;flex-shrink:0}
.cqb:hover{border-color:var(--primary);color:var(--primary)}
.dd{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-sm);margin-top:3px;max-height:150px;overflow-y:auto;box-shadow:0 4px 16px rgba(0,0,0,.1)}
.ddi{padding:9px 13px;cursor:pointer;font-size:13px;display:flex;justify-content:space-between;border-bottom:1px solid var(--border)}
.ddi:last-child{border-bottom:none}
.ddi:hover{background:var(--surface2)}

/* EMPTY */
.empty{text-align:center;padding:44px 20px;color:var(--muted)}
.empty-icon{font-size:40px;margin-bottom:10px}
.empty-t{font-size:15px;font-weight:600;color:#555}
.empty-s{font-size:13px;margin-top:4px}

/* TYPE TOGGLE */
.ttog{display:flex;gap:6px}
.ttog .btn{flex:1;justify-content:center}

/* FILTER ROW */
.filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center}

/* SEARCH INPUT */
.sinput{width:100%;padding:10px 13px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--surface);font-family:inherit;font-size:13.5px;outline:none;transition:border .15s;margin-bottom:14px;color:var(--primary)}
.sinput:focus{border-color:var(--primary)}
.sinput::placeholder{color:var(--muted)}

/* TOTAL ROW */
.total-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0 0;margin-top:4px;border-top:2px solid var(--border);font-size:19px;font-weight:700}
.total-row span:last-child{color:var(--primary)}

/* SCROLL */
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
::-webkit-scrollbar-track{background:transparent}

/* RESPONSIVE */
@media(max-width:680px){
  .nav{display:none}
  .mnav{display:block}
  .stats{grid-template-columns:1fr 1fr}
  .sh-title{font-size:19px}
  .main{padding:16px 12px 88px}
}
`;

export default function App() {
  const [tab, setTab] = useState("inicio");
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = S;
    document.head.appendChild(el);
    async function load() {
      const [p, s] = await Promise.all([store.get(KEYS.products), store.get(KEYS.sales)]);
      setProducts(p || []);
      setSales(s || []);
      setLoading(false);
    }
    load();
    return () => document.head.removeChild(el);
  }, []);

  const saveP = async (d) => { setProducts(d); await store.set(KEYS.products, d); };
  const saveS = async (d) => { setSales(d); await store.set(KEYS.sales, d); };

  const pending = sales.filter(s => s.type === "credito" && !s.paid);
  const pendingTotal = pending.reduce((a, s) => a + s.total, 0);
  const todaySales = sales.filter(s => s.date === today());
  const todayTotal = todaySales.reduce((a, s) => a + s.total, 0);
  const lowStock = products.filter(p => p.stock <= p.minStock);

  const openModal = (m, t = null) => { setModal(m); setTarget(t); };
  const closeModal = () => { setModal(null); setTarget(null); };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", fontSize: 14, color: "var(--muted)" }}>
      Cargando...
    </div>
  );

  const TABS = [
    { id: "inicio", label: "Inicio", icon: "⊞" },
    { id: "inventario", label: "Inventario", icon: "📦" },
    { id: "ventas", label: "Ventas", icon: "🛒" },
    { id: "cobrar", label: "Por Cobrar", icon: "💳" },
  ];

  return (
    <>
      <header className="hdr">
        <div className="hdr-in">
          <div className="logo">Stock<em>Go</em></div>
          <nav className="nav">
            {TABS.map(t => (
              <button key={t.id} className={`nb ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
                <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
                {t.id === "cobrar" && pending.length > 0 && <span className="badge">{pending.length}</span>}
              </button>
            ))}
          </nav>
          <button className="btn btn-a" style={{ marginLeft: 8, padding: "7px 14px" }} onClick={() => openModal("venta")}>
            + Venta
          </button>
        </div>
      </header>

      <main className="main">
        {tab === "inicio" && <Inicio products={products} todayTotal={todayTotal} todaySales={todaySales} pendingTotal={pendingTotal} pendingCount={pending.length} lowStock={lowStock} sales={sales} onNewSale={() => openModal("venta")} onTab={setTab} />}
        {tab === "inventario" && <Inventario products={products} onAdd={() => openModal("producto")} onEdit={p => openModal("producto", p)} onStock={p => openModal("stock", p)} onDelete={id => { if (confirm("¿Eliminar este producto?")) saveP(products.filter(p => p.id !== id)); }} />}
        {tab === "ventas" && <Ventas sales={sales} onNew={() => openModal("venta")} onView={s => openModal("detalle", s)} />}
        {tab === "cobrar" && <Cobrar sales={sales} onPaid={s => openModal("cobrar", s)} />}
      </main>

      <nav className="mnav">
        <div className="mnav-in">
          {TABS.map(t => (
            <button key={t.id} className={`mnb ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              {t.id === "cobrar" && pending.length > 0 && <span className="mnb-dot" />}
              <span className="mnb-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {modal === "producto" && (
        <ProductoModal product={target} onClose={closeModal} onSave={data => {
          if (target) saveP(products.map(p => p.id === target.id ? { ...p, ...data } : p));
          else saveP([...products, { id: uid(), stock: 0, ...data }]);
          closeModal();
        }} />
      )}

      {modal === "stock" && target && (
        <StockModal product={target} onClose={closeModal} onSave={(qty, type) => {
          const delta = type === "entrada" ? qty : -qty;
          saveP(products.map(p => p.id === target.id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
          closeModal();
        }} />
      )}

      {modal === "venta" && (
        <VentaModal products={products} onClose={closeModal} onSave={sale => {
          saveS([{ id: uid(), date: today(), ...sale }, ...sales]);
          saveP(products.map(p => {
            const item = sale.items.find(i => i.pid === p.id);
            return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
          }));
          closeModal();
        }} />
      )}

      {modal === "detalle" && target && <DetalleModal sale={target} onClose={closeModal} />}

      {modal === "cobrar" && target && (
        <CobrarModal sale={target} onClose={closeModal} onConfirm={() => {
          saveS(sales.map(s => s.id === target.id ? { ...s, paid: true, paidDate: today() } : s));
          closeModal();
        }} />
      )}
    </>
  );
}

function Inicio({ products, todayTotal, todaySales, pendingTotal, pendingCount, lowStock, sales, onNewSale, onTab }) {
  return (
    <div>
      <div className="sh">
        <div>
          <div className="sh-title">¡Bienvenido! 👋</div>
          <div className="sh-sub">Resumen de tu tienda</div>
        </div>
        <button className="btn btn-p" onClick={onNewSale}>+ Nueva venta</button>
      </div>

      <div className="stats">
        <div className="stat hi">
          <div className="stat-l">Ventas hoy</div>
          <div className="stat-v" style={{ fontSize: 18 }}>{fmt(todayTotal)}</div>
          <div className="stat-s">{todaySales.length} transacción(es)</div>
        </div>
        <div className={`stat ${pendingCount > 0 ? "warn" : ""}`}>
          <div className="stat-l">Por cobrar</div>
          <div className="stat-v" style={{ fontSize: 18 }}>{fmt(pendingTotal)}</div>
          <div className="stat-s">{pendingCount} pendiente(s)</div>
        </div>
        <div className="stat">
          <div className="stat-l">Productos</div>
          <div className="stat-v">{products.length}</div>
          <div className="stat-s">en inventario</div>
        </div>
        <div className="stat">
          <div className="stat-l">Stock bajo</div>
          <div className="stat-v" style={{ color: lowStock.length > 0 ? "var(--red)" : "var(--green)" }}>{lowStock.length}</div>
          <div className="stat-s">alerta(s)</div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-w" onClick={() => onTab("inventario")}>
          ⚠️ <strong>{lowStock.length} producto(s) con stock bajo:</strong> {lowStock.slice(0, 3).map(p => p.name).join(", ")}{lowStock.length > 3 ? "..." : ""} →
        </div>
      )}
      {pendingCount > 0 && (
        <div className="alert alert-r" onClick={() => onTab("cobrar")}>
          💳 <strong>{pendingCount} cuenta(s)</strong> por cobrar — Total: <strong>{fmt(pendingTotal)}</strong> →
        </div>
      )}

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Ventas recientes</div>
          <button className="btn btn-o btn-sm" onClick={() => onTab("ventas")}>Ver todas →</button>
        </div>
        {sales.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)", fontSize: 13 }}>Aún no hay ventas registradas</div>
        ) : (
          <div className="tw">
            <table>
              <thead><tr><th>Fecha</th><th>Cliente</th><th>Total</th><th>Pago</th></tr></thead>
              <tbody>
                {sales.slice(0, 6).map(s => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDate(s.date)}</td>
                    <td style={{ fontWeight: 500 }}>{s.client || "—"}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(s.total)}</td>
                    <td>
                      {s.type === "credito"
                        ? <span className={`bge ${s.paid ? "bg-g" : "bg-y"}`}>{s.paid ? "Cobrado" : "Crédito"}</span>
                        : <span className="bge bg-b">{s.type === "transferencia" ? "Transf." : "Efectivo"}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Inventario({ products, onAdd, onEdit, onStock, onDelete }) {
  const [q, setQ] = useState("");
  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || (p.cat || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="sh">
        <div>
          <div className="sh-title">Inventario</div>
          <div className="sh-sub">{products.length} producto(s)</div>
        </div>
        <button className="btn btn-p" onClick={onAdd}>+ Producto</button>
      </div>
      <input className="sinput" placeholder="🔍 Buscar producto o categoría..." value={q} onChange={e => setQ(e.target.value)} />
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty"><div className="empty-icon">📦</div><div className="empty-t">{q ? "Sin resultados" : "Sin productos aún"}</div><div className="empty-s">{!q && "Agrega tu primer producto para comenzar"}</div></div>
        </div>
      ) : (
        <div className="card">
          <div className="tw">
            <table>
              <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {filtered.map(p => {
                  const isOut = p.stock <= 0;
                  const isLow = !isOut && p.stock <= p.minStock;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                        {p.cat && <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.cat}</div>}
                      </td>
                      <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{fmt(p.price)}</td>
                      <td>
                        <span className={isOut ? "s-out" : isLow ? "s-lo" : "s-ok"}>{p.stock} {p.unit || "un."}</span>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>mín: {p.minStock}</div>
                      </td>
                      <td>
                        {isOut ? <span className="bge bg-r">Agotado</span>
                          : isLow ? <span className="bge bg-y">Stock bajo</span>
                          : <span className="bge bg-g">OK</span>}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="btn btn-o btn-sm" onClick={() => onStock(p)} title="Ajustar stock">+/− Stock</button>
                          <button className="btn btn-o btn-sm" onClick={() => onEdit(p)}>✏️</button>
                          <button className="btn btn-r btn-sm" onClick={() => onDelete(p.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Ventas({ sales, onNew, onView }) {
  const [filter, setFilter] = useState("todas");
  const filtered = sales.filter(s => filter === "todas" || s.type === filter || (filter === "pendientes" && s.type === "credito" && !s.paid));
  const total = filtered.reduce((a, s) => a + s.total, 0);

  return (
    <div>
      <div className="sh">
        <div>
          <div className="sh-title">Ventas</div>
          <div className="sh-sub">{sales.length} venta(s) registrada(s)</div>
        </div>
        <button className="btn btn-p" onClick={onNew}>+ Nueva venta</button>
      </div>
      <div className="filters">
        {[["todas","Todas"],["efectivo","Efectivo"],["transferencia","Transf."],["credito","Crédito"],["pendientes","Pendientes"]].map(([v,l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? "btn-p" : "btn-o"}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
        <span style={{ marginLeft: "auto", fontWeight: 700, color: "var(--primary)", fontSize: 14 }}>{fmt(total)}</span>
      </div>
      {filtered.length === 0 ? (
        <div className="card"><div className="empty"><div className="empty-icon">🛒</div><div className="empty-t">Sin ventas aquí</div></div></div>
      ) : (
        <div className="card">
          <div className="tw">
            <table>
              <thead><tr><th>Fecha</th><th>Cliente</th><th>Items</th><th>Total</th><th>Pago</th><th></th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{fmtDate(s.date)}</td>
                    <td style={{ fontWeight: 500 }}>{s.client || "—"}</td>
                    <td style={{ color: "var(--muted)" }}>{s.items.length}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(s.total)}</td>
                    <td>
                      {s.type === "credito"
                        ? <span className={`bge ${s.paid ? "bg-g" : "bg-y"}`}>{s.paid ? "Cobrado" : "Crédito"}</span>
                        : <span className="bge bg-b">{s.type === "transferencia" ? "Transf." : "Efectivo"}</span>}
                    </td>
                    <td><button className="btn btn-o btn-sm" onClick={() => onView(s)}>Ver</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Cobrar({ sales, onPaid }) {
  const pending = sales.filter(s => s.type === "credito" && !s.paid).sort((a, b) => a.date > b.date ? 1 : -1);
  const cobradas = sales.filter(s => s.type === "credito" && s.paid);
  const total = pending.reduce((a, s) => a + s.total, 0);

  return (
    <div>
      <div className="sh">
        <div>
          <div className="sh-title">Cuentas por Cobrar</div>
          <div className="sh-sub">{fmt(total)} pendiente(s)</div>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="alert alert-g" style={{ cursor: "default" }}>✅ ¡Todo al día! No hay cuentas pendientes por cobrar.</div>
      ) : (
        <>
          <div className="alert alert-w" style={{ cursor: "default", marginBottom: 12 }}>
            💰 Total pendiente: <strong>{fmt(total)}</strong> en {pending.length} cuenta(s)
          </div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--red)", marginBottom: 12 }}>Pendientes ({pending.length})</div>
            <div className="tw">
              <table>
                <thead><tr><th>Fecha</th><th>Cliente</th><th>Total</th><th>Días</th><th></th></tr></thead>
                <tbody>
                  {pending.map(s => {
                    const d = daysSince(s.date);
                    return (
                      <tr key={s.id}>
                        <td style={{ whiteSpace: "nowrap", color: "var(--muted)" }}>{fmtDate(s.date)}</td>
                        <td style={{ fontWeight: 600 }}>{s.client || "Cliente"}</td>
                        <td style={{ fontWeight: 700, color: "var(--primary)" }}>{fmt(s.total)}</td>
                        <td><span className={`bge ${d > 7 ? "bg-r" : d > 3 ? "bg-y" : "bg-m"}`}>{d}d</span></td>
                        <td><button className="btn btn-g btn-sm" onClick={() => onPaid(s)}>✓ Cobrado</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {cobradas.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--green)", marginBottom: 12 }}>Cobradas ({cobradas.length})</div>
          <div className="tw">
            <table>
              <thead><tr><th>Fecha venta</th><th>Cliente</th><th>Total</th><th>Fecha cobro</th></tr></thead>
              <tbody>
                {cobradas.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: "var(--muted)" }}>{fmtDate(s.date)}</td>
                    <td>{s.client || "—"}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(s.total)}</td>
                    <td style={{ color: "var(--muted)" }}>{s.paidDate ? fmtDate(s.paidDate) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductoModal({ product, onSave, onClose }) {
  const [f, setF] = useState({ name: product?.name || "", cat: product?.cat || "", price: product?.price || "", cost: product?.cost || "", unit: product?.unit || "un.", minStock: product?.minStock ?? 5 });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mdl">
        <div className="mdl-title">{product ? "Editar producto" : "Nuevo producto"}</div>
        <div className="fg"><label className="fl">Nombre del producto *</label><input className="fi" value={f.name} onChange={e => set("name", e.target.value)} placeholder="Ej: Coca-Cola 500ml" /></div>
        <div className="fr">
          <div className="fg"><label className="fl">Categoría</label><input className="fi" value={f.cat} onChange={e => set("cat", e.target.value)} placeholder="Ej: Bebidas" /></div>
          <div className="fg"><label className="fl">Unidad</label>
            <select className="fi" value={f.unit} onChange={e => set("unit", e.target.value)}>
              {["un.", "kg", "lt", "caja", "paq", "doc.", "m"].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="fr">
          <div className="fg"><label className="fl">Precio de venta *</label><input className="fi" type="number" value={f.price} onChange={e => set("price", e.target.value)} placeholder="0" min="0" /></div>
          <div className="fg"><label className="fl">Costo</label><input className="fi" type="number" value={f.cost} onChange={e => set("cost", e.target.value)} placeholder="0" min="0" /></div>
        </div>
        <div className="fg"><label className="fl">Alerta stock mínimo</label><input className="fi" type="number" value={f.minStock} onChange={e => set("minStock", e.target.value)} min="0" /></div>
        <div className="fa">
          <button className="btn btn-o" onClick={onClose}>Cancelar</button>
          <button className="btn btn-p" onClick={() => {
            if (!f.name.trim()) return alert("El nombre es obligatorio");
            if (!f.price || Number(f.price) <= 0) return alert("Ingresa un precio válido");
            onSave({ ...f, price: Number(f.price), cost: Number(f.cost), minStock: Number(f.minStock) });
          }}>Guardar producto</button>
        </div>
      </div>
    </div>
  );
}

function StockModal({ product, onSave, onClose }) {
  const [type, setType] = useState("entrada");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mdl">
        <div className="mdl-title">Ajustar stock</div>
        <div className="mdl-info">Producto: <strong>{product.name}</strong> — Stock actual: <strong>{product.stock} {product.unit || "un."}</strong></div>
        <div className="fg">
          <label className="fl">Tipo de movimiento</label>
          <div className="ttog">
            <button className={`btn ${type === "entrada" ? "btn-g" : "btn-o"}`} onClick={() => setType("entrada")}>↑ Entrada / Compra</button>
            <button className={`btn ${type === "salida" ? "btn-r" : "btn-o"}`} onClick={() => setType("salida")}>↓ Salida / Ajuste</button>
          </div>
        </div>
        <div className="fg"><label className="fl">Cantidad</label><input className="fi" type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" min="1" /></div>
        <div className="fg"><label className="fl">Nota (opcional)</label><input className="fi" value={note} onChange={e => setNote(e.target.value)} placeholder="Ej: Compra proveedor, ajuste inventario..." /></div>
        <div className="fa">
          <button className="btn btn-o" onClick={onClose}>Cancelar</button>
          <button className="btn btn-p" onClick={() => {
            if (!qty || Number(qty) <= 0) return alert("Ingresa una cantidad válida");
            onSave(Number(qty), type);
          }}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function VentaModal({ products, onSave, onClose }) {
  const [cart, setCart] = useState([]);
  const [client, setClient] = useState("");
  const [type, setType] = useState("efectivo");
  const [search, setSearch] = useState("");

  const avail = products.filter(p => p.stock > 0 && (p.name.toLowerCase().includes(search.toLowerCase()) || (p.cat || "").toLowerCase().includes(search.toLowerCase())));
  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);

  const addItem = (p) => {
    setCart(c => {
      const ex = c.find(i => i.pid === p.id);
      if (ex) {
        if (ex.qty >= p.stock) return c;
        return c.map(i => i.pid === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...c, { pid: p.id, name: p.name, price: p.price, qty: 1, max: p.stock }];
    });
    setSearch("");
  };

  const setQty = (pid, q) => {
    if (q <= 0) setCart(c => c.filter(i => i.pid !== pid));
    else setCart(c => c.map(i => i.pid === pid ? { ...i, qty: Math.min(q, i.max) } : i));
  };

  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mdl">
        <div className="mdl-title">Nueva Venta</div>

        <div className="fg">
          <label className="fl">Buscar y agregar productos</label>
          <input className="fi" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Escribe el nombre del producto..." autoFocus />
          {search.trim() && avail.length > 0 && (
            <div className="dd">
              {avail.slice(0, 7).map(p => (
                <div key={p.id} className="ddi" onClick={() => addItem(p)}>
                  <span>{p.name} <span style={{ fontSize: 11, color: "var(--muted)" }}>({p.stock} disp.)</span></span>
                  <strong style={{ color: "var(--primary)" }}>{fmt(p.price)}</strong>
                </div>
              ))}
            </div>
          )}
          {search.trim() && avail.length === 0 && (
            <div style={{ padding: "8px 13px", fontSize: 13, color: "var(--muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", marginTop: 3 }}>Sin resultados con stock disponible</div>
          )}
        </div>

        {cart.length === 0 ? (
          <div style={{ background: "var(--surface2)", borderRadius: "var(--radius-sm)", padding: "20px", textAlign: "center", fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
            Busca y selecciona productos para agregar al carrito
          </div>
        ) : (
          <div style={{ marginBottom: 14, background: "var(--surface2)", borderRadius: "var(--radius-sm)", padding: "4px 12px 8px" }}>
            {cart.map(item => (
              <div key={item.pid} className="ci">
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <button className="cqb" onClick={() => setQty(item.pid, item.qty - 1)}>−</button>
                  <span style={{ minWidth: 22, textAlign: "center", fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                  <button className="cqb" onClick={() => setQty(item.pid, item.qty + 1)}>+</button>
                </div>
                <div style={{ minWidth: 72, textAlign: "right", fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>{fmt(item.price * item.qty)}</div>
              </div>
            ))}
            <div className="total-row"><span>Total</span><span>{fmt(total)}</span></div>
          </div>
        )}

        <div className="fr">
          <div className="fg"><label className="fl">Cliente</label><input className="fi" value={client} onChange={e => setClient(e.target.value)} placeholder="Nombre (opcional)" /></div>
          <div className="fg"><label className="fl">Forma de pago</label>
            <select className="fi" value={type} onChange={e => setType(e.target.value)}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="credito">Crédito (por cobrar)</option>
            </select>
          </div>
        </div>

        {type === "credito" && (
          <div className="alert alert-w" style={{ cursor: "default", fontSize: 12 }}>
            ⚠️ Esta venta quedará pendiente en "Cuentas por cobrar" hasta que la marques como cobrada.
          </div>
        )}

        <div className="fa">
          <button className="btn btn-o" onClick={onClose}>Cancelar</button>
          <button className="btn btn-p" onClick={() => {
            if (cart.length === 0) return alert("Agrega al menos un producto");
            onSave({ items: cart, total, client, type, paid: type !== "credito" });
          }}>
            Registrar venta{cart.length > 0 ? ` · ${fmt(total)}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetalleModal({ sale, onClose }) {
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mdl">
        <div className="mdl-title">Detalle de venta</div>
        <div className="mdl-info">
          📅 {fmtDate(sale.date)} &nbsp;·&nbsp; 👤 {sale.client || "Sin nombre"} &nbsp;·&nbsp;{" "}
          {sale.type === "credito" ? (sale.paid ? "✅ Cobrado" : "⏳ Crédito pendiente") : sale.type === "transferencia" ? "💳 Transferencia" : "💵 Efectivo"}
        </div>
        <div style={{ background: "var(--surface2)", borderRadius: "var(--radius-sm)", padding: "6px 0", marginBottom: 14 }}>
          {sale.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", fontSize: 13, borderBottom: i < sale.items.length - 1 ? "1px solid var(--border)" : "none" }}>
              <span>{item.name} <span style={{ color: "var(--muted)" }}>× {item.qty}</span></span>
              <strong style={{ color: "var(--primary)" }}>{fmt(item.price * item.qty)}</strong>
            </div>
          ))}
        </div>
        <div className="total-row" style={{ paddingTop: 0 }}><span>Total</span><span>{fmt(sale.total)}</span></div>
        <div className="fa"><button className="btn btn-p" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}

function CobrarModal({ sale, onClose, onConfirm }) {
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mdl">
        <div className="mdl-title">Confirmar cobro</div>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
          ¿Confirmas que recibiste el pago de <strong style={{ color: "var(--primary)" }}>{sale.client || "este cliente"}</strong> por{" "}
          <strong style={{ color: "var(--primary)", fontSize: 16 }}>{fmt(sale.total)}</strong>?
        </p>
        <div style={{ background: "var(--surface2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
          Venta del {fmtDate(sale.date)} · {sale.items.length} producto(s) · {daysSince(sale.date)} día(s) pendiente
        </div>
        <div className="fa">
          <button className="btn btn-o" onClick={onClose}>Cancelar</button>
          <button className="btn btn-g" onClick={onConfirm}>✓ Confirmar cobro</button>
        </div>
      </div>
    </div>
  );
}
