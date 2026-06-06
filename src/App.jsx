import React, { useMemo, useState } from "react";
import { ShoppingCart, LayoutDashboard, Package, Users, Sprout, Receipt, LogOut } from "lucide-react";

const money = (n) => `KSh ${Number(n).toLocaleString()}`;

const seedProducts = [
  { id: 1, name: "Tomatoes Grade A", category: "Vegetables", price: 120, stock: 80 },
  { id: 2, name: "Avocados Export", category: "Fruits", price: 45, stock: 300 },
  { id: 3, name: "French Beans", category: "Vegetables", price: 180, stock: 60 },
  { id: 4, name: "Milk 1L", category: "Dairy", price: 90, stock: 40 },
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [products, setProducts] = useState(seedProducts);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers] = useState([
    { name: "Kamau Fresh Produce", phone: "0723000001", type: "Wholesale" },
    { name: "Amina Groceries", phone: "0723000002", type: "Retail" },
  ]);
  const [farmers] = useState([
    { name: "John Mwangi", county: "Meru", crop: "Avocados" },
    { name: "Grace Wanjiku", county: "Nakuru", crop: "Tomatoes" },
  ]);

  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const addToCart = (product) => {
    if (product.stock <= 0) return alert("Out of stock");
    setCart((c) => {
      const found = c.find((x) => x.id === product.id);
      if (found) return c.map((x) => x.id === product.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { ...product, qty: 1 }];
    });
  };

  const completeSale = (method) => {
    if (!cart.length) return alert("Cart is empty");

    const invoice = `INV-${Date.now()}`;
    const sale = {
      invoice,
      items: cart,
      total,
      method,
      date: new Date().toLocaleString(),
    };

    setProducts((ps) =>
      ps.map((p) => {
        const sold = cart.find((i) => i.id === p.id);
        return sold ? { ...p, stock: p.stock - sold.qty } : p;
      })
    );

    setSales((s) => [sale, ...s]);
    setCart([]);
    alert(`Sale complete!\nInvoice: ${invoice}\nTotal: ${money(total)}`);
  };

  if (!loggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginBox}>
          <h1>🌱 SokoPlus POS</h1>
          <p>Connecting Farms to Markets</p>
          <input style={styles.input} placeholder="Username" defaultValue="admin" />
          <input style={styles.input} placeholder="Password" type="password" defaultValue="admin123" />
          <button style={styles.primaryBtn} onClick={() => setLoggedIn(true)}>Login</button>
          <small>Demo login only. Real authentication comes in Phase 2.</small>
        </div>
      </div>
    );
  }

  const menu = [
    ["dashboard", LayoutDashboard, "Dashboard"],
    ["pos", ShoppingCart, "POS Terminal"],
    ["inventory", Package, "Inventory"],
    ["customers", Users, "Customers"],
    ["farmers", Sprout, "Farmers"],
    ["sales", Receipt, "Sales"],
  ];

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <h2>🌱 SokoPlus</h2>
        <p style={{ opacity: 0.7 }}>Farm POS System</p>

        {menu.map(([id, Icon, label]) => (
          <button key={id} onClick={() => setPage(id)} style={page === id ? styles.activeNav : styles.nav}>
            <Icon size={18} /> {label}
          </button>
        ))}

        <button style={styles.logout} onClick={() => setLoggedIn(false)}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main style={styles.main}>
        {page === "dashboard" && (
          <>
            <h1>Dashboard</h1>
            <div style={styles.cards}>
              <Card title="Today Revenue" value={money(sales.reduce((s, x) => s + x.total, 0))} />
              <Card title="Sales Made" value={sales.length} />
              <Card title="Products" value={products.length} />
              <Card title="Low Stock Alerts" value={products.filter((p) => p.stock < 50).length} />
            </div>
          </>
        )}

        {page === "pos" && (
          <>
            <h1>POS Terminal</h1>
            <div style={styles.grid2}>
              <section>
                <h2>Products</h2>
                <div style={styles.productGrid}>
                  {products.map((p) => (
                    <div key={p.id} style={styles.productCard}>
                      <h3>{p.name}</h3>
                      <p>{p.category}</p>
                      <b>{money(p.price)}</b>
                      <p>Stock: {p.stock}</p>
                      <button style={styles.primaryBtn} onClick={() => addToCart(p)}>Add to Cart</button>
                    </div>
                  ))}
                </div>
              </section>

              <section style={styles.cartBox}>
                <h2>Cart</h2>
                {cart.length === 0 ? <p>No items yet.</p> : cart.map((i) => (
                  <div key={i.id} style={styles.cartItem}>
                    <span>{i.name} × {i.qty}</span>
                    <b>{money(i.price * i.qty)}</b>
                  </div>
                ))}
                <h2>Total: {money(total)}</h2>
                <button style={styles.primaryBtn} onClick={() => completeSale("Cash")}>Pay Cash</button>
                <button style={styles.secondaryBtn} onClick={() => completeSale("M-Pesa Demo")}>M-Pesa STK Demo</button>
                <button style={styles.secondaryBtn} onClick={() => completeSale("Bank Transfer")}>Bank Transfer</button>
              </section>
            </div>
          </>
        )}

        {page === "inventory" && (
          <>
            <h1>Inventory</h1>
            <table style={styles.table}>
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}><td>{p.name}</td><td>{p.category}</td><td>{money(p.price)}</td><td>{p.stock}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {page === "customers" && (
          <>
            <h1>Customers</h1>
            {customers.map((c) => (
              <div key={c.phone} style={styles.listCard}>
                <b>{c.name}</b><p>{c.phone} · {c.type}</p>
              </div>
            ))}
          </>
        )}

        {page === "farmers" && (
          <>
            <h1>Farmers Directory</h1>
            {farmers.map((f) => (
              <div key={f.name} style={styles.listCard}>
                <b>{f.name}</b><p>{f.county} · {f.crop}</p>
              </div>
            ))}
          </>
        )}

        {page === "sales" && (
          <>
            <h1>Sales History</h1>
            {sales.length === 0 ? <p>No sales yet.</p> : sales.map((s) => (
              <div key={s.invoice} style={styles.listCard}>
                <b>{s.invoice}</b>
                <p>{s.date} · {s.method}</p>
                <h3>{money(s.total)}</h3>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

const styles = {
  app: { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", background: "#f7faf7" },
  sidebar: { width: 250, background: "#052e16", color: "#fff", padding: 24 },
  main: { flex: 1, padding: 32 },
  nav: { width: "100%", display: "flex", gap: 10, alignItems: "center", background: "transparent", color: "#d1fae5", border: 0, padding: 12, borderRadius: 10, cursor: "pointer", marginTop: 8 },
  activeNav: { width: "100%", display: "flex", gap: 10, alignItems: "center", background: "#22c55e", color: "#fff", border: 0, padding: 12, borderRadius: 10, cursor: "pointer", marginTop: 8 },
  logout: { width: "100%", display: "flex", gap: 10, alignItems: "center", background: "#991b1b", color: "#fff", border: 0, padding: 12, borderRadius: 10, cursor: "pointer", marginTop: 30 },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 },
  card: { background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 },
  productCard: { background: "#fff", padding: 18, borderRadius: 14, border: "1px solid #e5e7eb" },
  cartBox: { background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #e5e7eb", height: "fit-content" },
  cartItem: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" },
  primaryBtn: { background: "#16a34a", color: "#fff", border: 0, padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700, marginTop: 8 },
  secondaryBtn: { background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700, marginTop: 8, width: "100%" },
  table: { width: "100%", background: "#fff", borderCollapse: "collapse", borderRadius: 12, overflow: "hidden" },
  listCard: { background: "#fff", padding: 18, borderRadius: 14, marginBottom: 12, border: "1px solid #e5e7eb" },
  loginPage: { minHeight: "100vh", background: "linear-gradient(135deg,#052e16,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial" },
  loginBox: { width: 360, background: "#fff", padding: 32, borderRadius: 20, textAlign: "center" },
  input: { width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: "1px solid #ddd" },
};
