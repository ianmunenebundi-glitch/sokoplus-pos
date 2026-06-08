import React, { useMemo, useState } from "react";
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Users,
  Sprout,
  Receipt,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Printer,
  X,
} from "lucide-react";

const money = (n) => `KSh ${Number(n || 0).toLocaleString()}`;

const seedProducts = [
  { id: 1, name: "Tomatoes Grade A", category: "Vegetables", price: 120, cost: 80, stock: 80, minStock: 30, sku: "TOM-A" },
  { id: 2, name: "Avocados Export", category: "Fruits", price: 45, cost: 25, stock: 300, minStock: 100, sku: "AVO-EXP" },
  { id: 3, name: "French Beans", category: "Vegetables", price: 180, cost: 120, stock: 60, minStock: 25, sku: "BEN-FR" },
  { id: 4, name: "Milk 1L", category: "Dairy", price: 90, cost: 65, stock: 40, minStock: 50, sku: "MILK-1L" },
];

const seedCustomers = [
  { id: 1, name: "Walk-in Customer", phone: "-", type: "Retail" },
  { id: 2, name: "Kamau Fresh Produce", phone: "0723000001", type: "Wholesale" },
  { id: 3, name: "Amina Groceries", phone: "0723000002", type: "Retail" },
];

const seedFarmers = [
  { id: 1, name: "John Mwangi", county: "Meru", village: "Nkubu", crop: "Avocados", phone: "0711000001" },
  { id: 2, name: "Grace Wanjiku", county: "Nakuru", village: "Bahati", crop: "Tomatoes", phone: "0711000002" },
];

const emptyProduct = {
  name: "",
  category: "Vegetables",
  sku: "",
  price: "",
  cost: "",
  stock: "",
  minStock: "",
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("sokoplus_products");
    return saved ? JSON.parse(saved) : seedProducts;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem("sokoplus_customers");
    return saved ? JSON.parse(saved) : seedCustomers;
  });

  const [farmers] = useState(seedFarmers);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem("sokoplus_sales");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [invoice, setInvoice] = useState(null);

  React.useEffect(() => {
    localStorage.setItem("sokoplus_products", JSON.stringify(products));
  }, [products]);

  React.useEffect(() => {
    localStorage.setItem("sokoplus_sales", JSON.stringify(sales));
  }, [sales]);

  React.useEffect(() => {
    localStorage.setItem("sokoplus_customers", JSON.stringify(customers));
  }, [customers]);

  const cartSubtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const vat = Math.round(cartSubtotal * 0.16);
  const cartTotal = cartSubtotal + vat;

  const todayRevenue = sales.reduce((s, x) => s + x.total, 0);
  const lowStock = products.filter((p) => Number(p.stock) <= Number(p.minStock));

  const addToCart = (product) => {
    if (Number(product.stock) <= 0) return alert("This product is out of stock.");

    setCart((current) => {
      const found = current.find((x) => x.id === product.id);
      if (found) {
        if (found.qty + 1 > product.stock) return current;
        return current.map((x) => x.id === product.id ? { ...x, qty: x.qty + 1 } : x);
      }
      return [...current, { ...product, qty: 1 }];
    });
  };

  const changeCartQty = (id, qty) => {
    const product = products.find((p) => p.id === id);
    const cleanQty = Math.max(1, Number(qty || 1));

    if (cleanQty > product.stock) return alert("Quantity cannot exceed available stock.");

    setCart((current) => current.map((item) => item.id === id ? { ...item, qty: cleanQty } : item));
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const completeSale = () => {
    if (!cart.length) return alert("Cart is empty.");

    const customer = customers.find((c) => c.id === Number(selectedCustomerId));
    const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;

    const sale = {
      invoiceNo,
      customer,
      items: cart,
      subtotal: cartSubtotal,
      vat,
      total: cartTotal,
      method: paymentMethod,
      date: new Date().toLocaleString(),
      status: paymentMethod === "M-Pesa STK Demo" ? "M-Pesa Demo Confirmed" : "Paid",
    };

    setProducts((items) =>
      items.map((p) => {
        const sold = cart.find((i) => i.id === p.id);
        return sold ? { ...p, stock: Number(p.stock) - Number(sold.qty) } : p;
      })
    );

    setSales((current) => [sale, ...current]);
    setInvoice(sale);
    setCart([]);
  };

  const saveProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.stock) {
      return alert("Product name, price, and stock are required.");
    }

    const cleanProduct = {
      ...productForm,
      price: Number(productForm.price),
      cost: Number(productForm.cost || 0),
      stock: Number(productForm.stock),
      minStock: Number(productForm.minStock || 0),
      sku: productForm.sku || `SKU-${Date.now().toString().slice(-5)}`,
    };

    if (editingProductId) {
      setProducts((items) => items.map((p) => p.id === editingProductId ? { ...cleanProduct, id: editingProductId } : p));
    } else {
      setProducts((items) => [{ ...cleanProduct, id: Date.now() }, ...items]);
    }

    setProductForm(emptyProduct);
    setEditingProductId(null);
  };

  const editProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm(product);
    setPage("inventory");
  };

  const deleteProduct = (id) => {
    if (!confirm("Delete this product?")) return;
    setProducts((items) => items.filter((p) => p.id !== id));
  };

  const updateStock = (id, value) => {
    setProducts((items) => items.map((p) => p.id === id ? { ...p, stock: Number(value || 0) } : p));
  };

  const printInvoice = () => {
    window.print();
  };

  if (!loggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginBox}>
          <h1 style={{ marginBottom: 6 }}>🌱 SokoPlus POS</h1>
          <p style={{ color: "#166534", fontWeight: 700 }}>Connecting Farms to Markets</p>
          <input style={styles.input} placeholder="Username" defaultValue="admin" />
          <input style={styles.input} placeholder="Password" type="password" defaultValue="admin123" />
          <button style={styles.primaryBtnFull} onClick={() => setLoggedIn(true)}>Login</button>
          <small style={{ color: "#6b7280" }}>Demo login only. Backend authentication comes next.</small>
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
      <aside style={styles.sidebar} className="no-print">
        <h2 style={{ marginBottom: 0 }}>🌱 SokoPlus</h2>
        <p style={{ opacity: 0.7, marginTop: 6 }}>Farm POS System</p>

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
            <Header title="Dashboard" subtitle="Today’s business overview" />
            <div style={styles.cards}>
              <Card title="Revenue" value={money(todayRevenue)} />
              <Card title="Sales Made" value={sales.length} />
              <Card title="Products" value={products.length} />
              <Card title="Low Stock Alerts" value={lowStock.length} danger={lowStock.length > 0} />
            </div>

            <div style={styles.panel}>
              <h2>Low Stock Alerts</h2>
              {lowStock.length === 0 ? <p>No low stock products.</p> : lowStock.map((p) => (
                <div key={p.id} style={styles.alertRow}>
                  <b>{p.name}</b>
                  <span>Stock: {p.stock} / Min: {p.minStock}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {page === "pos" && (
          <>
            <Header title="POS Terminal" subtitle="Sell products, collect payment, and generate invoices" />
            <div style={styles.grid2}>
              <section>
                <h2>Products</h2>
                <div style={styles.productGrid}>
                  {products.map((p) => (
                    <div key={p.id} style={styles.productCard}>
                      <small>{p.sku} · {p.category}</small>
                      <h3>{p.name}</h3>
                      <b style={{ color: "#15803d" }}>{money(p.price)}</b>
                      <p>Stock: {p.stock}</p>
                      <button style={styles.primaryBtnFull} onClick={() => addToCart(p)}>Add to Cart</button>
                    </div>
                  ))}
                </div>
              </section>

              <section style={styles.cartBox}>
                <h2>Cart</h2>

                <label style={styles.label}>Customer</label>
                <select style={styles.input} value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <label style={styles.label}>Payment Method</label>
                <select style={styles.input} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option>Cash</option>
                  <option>M-Pesa STK Demo</option>
                  <option>Bank Transfer</option>
                </select>

                {cart.length === 0 ? <p>No items yet.</p> : cart.map((i) => (
                  <div key={i.id} style={styles.cartItem}>
                    <div>
                      <b>{i.name}</b>
                      <div>
                        <input
                          type="number"
                          min="1"
                          value={i.qty}
                          onChange={(e) => changeCartQty(i.id, e.target.value)}
                          style={{ width: 60, padding: 6, marginTop: 6 }}
                        />
                        <button onClick={() => removeFromCart(i.id)} style={styles.smallDanger}><X size={14} /></button>
                      </div>
                    </div>
                    <b>{money(i.price * i.qty)}</b>
                  </div>
                ))}

                <div style={styles.totals}>
                  <p><span>Subtotal</span><b>{money(cartSubtotal)}</b></p>
                  <p><span>VAT 16%</span><b>{money(vat)}</b></p>
                  <h2><span>Total</span><b>{money(cartTotal)}</b></h2>
                </div>

                <button style={styles.primaryBtnFull} onClick={completeSale}>Complete Sale</button>
              </section>
            </div>
          </>
        )}

        {page === "inventory" && (
          <>
            <Header title="Inventory Management" subtitle="Add products, edit prices, and update stock levels" />

            <div style={styles.panel}>
              <h2>{editingProductId ? "Edit Product" : "Add New Product"}</h2>
              <div style={styles.formGrid}>
                <input style={styles.input} placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                <input style={styles.input} placeholder="SKU Code" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
                <select style={styles.input} value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                  <option>Vegetables</option>
                  <option>Fruits</option>
                  <option>Dairy</option>
                  <option>Livestock</option>
                  <option>Grains</option>
                  <option>Other</option>
                </select>
                <input style={styles.input} type="number" placeholder="Selling Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                <input style={styles.input} type="number" placeholder="Cost Price" value={productForm.cost} onChange={(e) => setProductForm({ ...productForm, cost: e.target.value })} />
                <input style={styles.input} type="number" placeholder="Stock Quantity" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                <input style={styles.input} type="number" placeholder="Minimum Stock Alert" value={productForm.minStock} onChange={(e) => setProductForm({ ...productForm, minStock: e.target.value })} />
              </div>
              <button style={styles.primaryBtn} onClick={saveProduct}><Plus size={16} /> {editingProductId ? "Save Changes" : "Add Product"}</button>
              {editingProductId && <button style={styles.secondaryBtn} onClick={() => { setEditingProductId(null); setProductForm(emptyProduct); }}>Cancel Edit</button>}
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Stock</th>
                  <th>Alert</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.sku}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{money(p.price)}</td>
                    <td>{money(p.cost)}</td>
                    <td>
                      <input
                        type="number"
                        value={p.stock}
                        onChange={(e) => updateStock(p.id, e.target.value)}
                        style={{ width: 80, padding: 6 }}
                      />
                    </td>
                    <td>{p.stock <= p.minStock ? "⚠️ Low" : "✅ OK"}</td>
                    <td>
                      <button style={styles.iconBtn} onClick={() => editProduct(p)}><Pencil size={15} /></button>
                      <button style={styles.iconDanger} onClick={() => deleteProduct(p.id)}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {page === "customers" && (
          <>
            <Header title="Customers" subtitle="Buyer and customer records" />
            {customers.map((c) => (
              <div key={c.id} style={styles.listCard}>
                <b>{c.name}</b>
                <p>{c.phone} · {c.type}</p>
              </div>
            ))}
          </>
        )}

        {page === "farmers" && (
          <>
            <Header title="Farmers Directory" subtitle="Supplier farmers and cooperatives" />
            {farmers.map((f) => (
              <div key={f.id} style={styles.listCard}>
                <b>{f.name}</b>
                <p>{f.county}, {f.village} · {f.crop} · {f.phone}</p>
              </div>
            ))}
          </>
        )}

        {page === "sales" && (
          <>
            <Header title="Sales History" subtitle="Invoices, payment methods, and completed sales" />
            {sales.length === 0 ? <p>No sales yet.</p> : sales.map((s) => (
              <div key={s.invoiceNo} style={styles.listCard}>
                <b>{s.invoiceNo}</b>
                <p>{s.date} · {s.customer?.name} · {s.method} · {s.status}</p>
                <h3>{money(s.total)}</h3>
                <button style={styles.secondaryBtn} onClick={() => setInvoice(s)}><Receipt size={16} /> View Invoice</button>
              </div>
            ))}
          </>
        )}
      </main>

      {invoice && (
        <div style={styles.modalOverlay}>
          <div style={styles.invoiceModal}>
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Invoice Preview</h2>
              <button style={styles.iconDanger} onClick={() => setInvoice(null)}><X size={18} /></button>
            </div>

            <div id="invoice-print-area">
              <h1 style={{ marginBottom: 4 }}>🌱 SokoPlus</h1>
              <p style={{ marginTop: 0, color: "#166534", fontWeight: 700 }}>Connecting Farms to Markets</p>
              <hr />
              <p><b>Invoice:</b> {invoice.invoiceNo}</p>
              <p><b>Date:</b> {invoice.date}</p>
              <p><b>Customer:</b> {invoice.customer?.name}</p>
              <p><b>Payment:</b> {invoice.method}</p>

              <table style={styles.invoiceTable}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((i) => (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td>{i.qty}</td>
                      <td>{money(i.price)}</td>
                      <td>{money(i.price * i.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ textAlign: "right", marginTop: 20 }}>
                <p>Subtotal: <b>{money(invoice.subtotal)}</b></p>
                <p>VAT 16%: <b>{money(invoice.vat)}</b></p>
                <h2>Total: {money(invoice.total)}</h2>
              </div>

              <p style={{ marginTop: 30, fontSize: 13, color: "#666" }}>
                Thank you for using SokoPlus POS.
              </p>
            </div>

            <button className="no-print" style={styles.primaryBtnFull} onClick={printInvoice}>
              <Printer size={16} /> Print Invoice
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 30px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function Header({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <p style={{ color: "#6b7280", marginTop: 6 }}>{subtitle}</p>
    </div>
  );
}

function Card({ title, value, danger }) {
  return (
    <div style={{ ...styles.card, border: danger ? "2px solid #ef4444" : "1px solid #e5e7eb" }}>
      <p>{title}</p>
      <h2 style={{ color: danger ? "#dc2626" : "#15803d" }}>{value}</h2>
    </div>
  );
}

const styles = {
  app: { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", background: "#f7faf7" },
  sidebar: { width: 250, background: "#052e16", color: "#fff", padding: 24, position: "sticky", top: 0, height: "100vh" },
  main: { flex: 1, padding: 32, overflowX: "auto" },
  nav: { width: "100%", display: "flex", gap: 10, alignItems: "center", background: "transparent", color: "#d1fae5", border: 0, padding: 12, borderRadius: 10, cursor: "pointer", marginTop: 8 },
  activeNav: { width: "100%", display: "flex", gap: 10, alignItems: "center", background: "#22c55e", color: "#fff", border: 0, padding: 12, borderRadius: 10, cursor: "pointer", marginTop: 8 },
  logout: { width: "100%", display: "flex", gap: 10, alignItems: "center", background: "#991b1b", color: "#fff", border: 0, padding: 12, borderRadius: 10, cursor: "pointer", marginTop: 30 },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, marginBottom: 24 },
  card: { background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.06)" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 },
  productCard: { background: "#fff", padding: 18, borderRadius: 14, border: "1px solid #e5e7eb" },
  cartBox: { background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #e5e7eb", height: "fit-content", position: "sticky", top: 20 },
  cartItem: { display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid #eee" },
  totals: { borderTop: "2px solid #e5e7eb", marginTop: 16, paddingTop: 12 },
  primaryBtn: { display: "inline-flex", alignItems: "center", gap: 8, background: "#16a34a", color: "#fff", border: 0, padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700, marginTop: 8, marginRight: 8 },
  primaryBtnFull: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: "#16a34a", color: "#fff", border: 0, padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700, marginTop: 8 },
  secondaryBtn: { display: "inline-flex", alignItems: "center", gap: 8, background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700, marginTop: 8, marginRight: 8 },
  table: { width: "100%", background: "#fff", borderCollapse: "collapse", borderRadius: 12, overflow: "hidden" },
  listCard: { background: "#fff", padding: 18, borderRadius: 14, marginBottom: 12, border: "1px solid #e5e7eb" },
  loginPage: { minHeight: "100vh", background: "linear-gradient(135deg,#052e16,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial" },
  loginBox: { width: 360, background: "#fff", padding: 32, borderRadius: 20, textAlign: "center" },
  input: { width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: "1px solid #ddd", boxSizing: "border-box" },
  label: { display: "block", fontWeight: 700, marginBottom: 6 },
  panel: { background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #e5e7eb", marginBottom: 24 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 },
  alertRow: { display: "flex", justifyContent: "space-between", background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 10, marginBottom: 8 },
  iconBtn: { background: "#dcfce7", color: "#166534", border: 0, padding: 8, borderRadius: 8, cursor: "pointer", marginRight: 6 },
  iconDanger: { background: "#fee2e2", color: "#991b1b", border: 0, padding: 8, borderRadius: 8, cursor: "pointer" },
  smallDanger: { marginLeft: 8, background: "#fee2e2", color: "#991b1b", border: 0, padding: 6, borderRadius: 8, cursor: "pointer" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 },
  invoiceModal: { width: "min(760px, 96vw)", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 18, padding: 28 },
  invoiceTable: { width: "100%", borderCollapse: "collapse", marginTop: 20 },
};
