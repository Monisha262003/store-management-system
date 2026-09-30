import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://localhost:7172/api";

function App() {
  const [activeTab, setActiveTab] = useState("products");
  const [darkMode, setDarkMode] = useState(false);

  // Data states
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Filter, Search & Sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  // Edit states
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  // Forms
  const [productForm, setProductForm] = useState({
    productName: "",
    price: "",
    quantity: "",
    category: "",
  });

  const [customerForm, setCustomerForm] = useState({
    customerName: "",
    email: "",
    phone: "",
  });

  const [orderForm, setOrderForm] = useState({
    customerId: "",
    productId: "",
    quantity: 1,
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetchProducts();
    fetchCustomers();
    fetchOrders();
    fetchOrderDetails();
  };

  const handleRefreshClick = () => {
    fetchAllData();
    notify("Data refreshed from SQL Server!");
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Product`);
      setProducts(res.data);
      setError("");
    } catch (err) {
      setError("Could not connect to .NET API. Make sure Visual Studio is running!");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Customer`);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Order`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/OrderDetail`);
      setOrderDetails(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- PRODUCT CRUD ----------------
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        await axios.put(`${API_BASE}/Product/${editingProductId}`, {
          productId: editingProductId,
          productName: productForm.productName,
          price: parseFloat(productForm.price),
          quantity: parseInt(productForm.quantity),
          category: productForm.category,
        });
        setEditingProductId(null);
        notify(`Updated "${productForm.productName}" successfully!`);
      } else {
        await axios.post(`${API_BASE}/Product`, {
          productName: productForm.productName,
          price: parseFloat(productForm.price),
          quantity: parseInt(productForm.quantity),
          category: productForm.category,
        });
        notify(`Added "${productForm.productName}" to inventory!`);
      }
      setProductForm({ productName: "", price: "", quantity: "", category: "" });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data || "Error saving product.");
    }
  };

  // 1-Click Quick Restock (+5 units) for Low Stock items
  const handleQuickRestock = async (product, addQty = 5) => {
    try {
      await axios.put(`${API_BASE}/Product/${product.productId}`, {
        productId: product.productId,
        productName: product.productName,
        price: product.price,
        quantity: product.quantity + addQty,
        category: product.category || "",
      });
      notify(`⚡ Restocked +${addQty} units of ${product.productName}!`);
      fetchProducts();
    } catch (err) {
      alert("Could not restock product.");
    }
  };

  const handleEditProductClick = (product) => {
    setEditingProductId(product.productId);
    setProductForm({
      productName: product.productName,
      price: product.price,
      quantity: product.quantity,
      category: product.category || "",
    });
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const handleDeleteProduct = async (id) => {
    await axios.delete(`${API_BASE}/Product/${id}`);
    notify("Product deleted from inventory.");
    fetchProducts();
  };

  // ---------------- CUSTOMER CRUD ----------------
  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomerId) {
        await axios.put(`${API_BASE}/Customer/${editingCustomerId}`, {
          customerId: editingCustomerId,
          customerName: customerForm.customerName,
          email: customerForm.email,
          phone: customerForm.phone,
        });
        setEditingCustomerId(null);
        notify("Customer profile updated!");
      } else {
        await axios.post(`${API_BASE}/Customer`, customerForm);
        notify("New customer added!");
      }
      setCustomerForm({ customerName: "", email: "", phone: "" });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data || "Error saving customer.");
    }
  };

  const handleEditCustomerClick = (customer) => {
    setEditingCustomerId(customer.customerId);
    setCustomerForm({
      customerName: customer.customerName,
      email: customer.email || "",
      phone: customer.phone || "",
    });
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const handleDeleteCustomer = async (id) => {
    await axios.delete(`${API_BASE}/Customer/${id}`);
    notify("Customer removed.");
    fetchCustomers();
  };

  // ---------------- PLACE ORDER ----------------
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      const orderRes = await axios.post(`${API_BASE}/Order`, {
        customerId: parseInt(orderForm.customerId),
        orderDate: new Date().toISOString(),
      });

      const newOrderId = orderRes.data.orderId;

      await axios.post(`${API_BASE}/OrderDetail`, {
        orderId: newOrderId,
        productId: parseInt(orderForm.productId),
        quantity: parseInt(orderForm.quantity),
        price: 0,
      });

      setOrderForm({ customerId: "", productId: "", quantity: 1 });
      notify(`🧾 Order #${newOrderId} placed & stock deducted!`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data || "Error placing order.");
    }
  };

  const handleCancelOrderItem = async (orderDetailId) => {
    await axios.delete(`${API_BASE}/OrderDetail/${orderDetailId}`);
    notify("Order cancelled & stock restored to inventory!");
    fetchAllData();
  };

  // ---------------- ANALYTICS & METRICS ----------------
  const totalRevenue = orderDetails.reduce((sum, item) => sum + (item.price || 0), 0);
  const lowStockItems = products.filter((p) => p.quantity < 5);
  const lowStockCount = lowStockItems.length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
    0
  );
  const avgOrderValue =
    orderDetails.length > 0 ? totalRevenue / orderDetails.length : 0;

  // Dynamic Max Stock for relative progress bar scaling (handles any N stock quantity)
  const maxStock = Math.max(...products.map((prod) => Number(prod.quantity) || 0), 10);

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat =
        selectedCategory === "All" || p.category === selectedCategory;
      const matchesLow = !onlyLowStock || p.quantity < 5;
      return matchesSearch && matchesCat && matchesLow;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "stock-asc") return a.quantity - b.quantity;
      if (sortBy === "name-asc") return a.productName.localeCompare(b.productName);
      return 0;
    });

  const filteredCustomers = customers.filter(
    (c) =>
      c.customerName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone?.includes(customerSearch)
  );

  // Selected product for live checkout preview
  const selectedProductObj = products.find(
    (p) => p.productId === parseInt(orderForm.productId)
  );
  const selectedCustomerObj = customers.find(
    (c) => c.customerId === parseInt(orderForm.customerId)
  );
  const previewTotal = selectedProductObj
    ? (selectedProductObj.price * (parseInt(orderForm.quantity) || 0)).toFixed(2)
    : null;

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CU";

  return (
    <div className="app-shell">
      {/* TOP ENTERPRISE NAVBAR */}
      <header className="top-navbar">
        <div className="brand-group">
          <div className="brand-icon">🛒</div>
          <div>
            <h1 className="brand-title">Store Management System</h1>
            <p className="brand-subtitle">
              3-Tier .NET Core 8 Web API • Entity Framework Core • SQL Server • React
            </p>
          </div>
        </div>

        <div className="nav-actions">
          <div className={`status-pill ${error ? "offline" : ""}`}>
            <span className="pulse-dot" />
            {error ? "API Offline" : ".NET 8 API Connected"}
          </div>
          <button
            className="icon-btn"
            onClick={handleRefreshClick}
            title="Refresh Data from Database"
          >
            🔄 Refresh
          </button>
          <button
            className="icon-btn"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Theme"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* ALERTS & TOASTS */}
      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            color: "#ef4444",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            marginBottom: "20px",
            fontWeight: 700,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {toast && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.14)",
            color: "#10b981",
            padding: "13px 18px",
            borderRadius: "12px",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            marginBottom: "20px",
            fontWeight: 700,
          }}
        >
          ✅ {toast}
        </div>
      )}

      {/* REACTIVE BENTO KPI CARDS */}
      <section className="kpi-bento">
        <div
          className={`kpi-card blue ${
            activeTab === "products" && !onlyLowStock ? "active-card" : ""
          }`}
          onClick={() => {
            setActiveTab("products");
            setOnlyLowStock(false);
          }}
        >
          <div className="kpi-top">
            <span className="kpi-title">Total Products</span>
            <span
              className="kpi-icon-badge"
              style={{ background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" }}
            >
              📦
            </span>
          </div>
          <div className="kpi-number">{products.length}</div>
          <div className="kpi-footer">
            <span>Stock Value: ₹{inventoryValue.toLocaleString("en-IN")}</span>
            <span style={{ color: "#3b82f6" }}>View All →</span>
          </div>
        </div>

        <div
          className={`kpi-card red ${onlyLowStock ? "active-card" : ""}`}
          onClick={() => {
            setActiveTab("products");
            setOnlyLowStock(!onlyLowStock);
          }}
        >
          <div className="kpi-top">
            <span className="kpi-title" style={{ color: "#ef4444" }}>
              Low Stock (&lt; 5)
            </span>
            <span
              className="kpi-icon-badge"
              style={{ background: "rgba(239, 68, 68, 0.14)", color: "#ef4444" }}
            >
              ⚠️
            </span>
          </div>
          <div className="kpi-number" style={{ color: "#ef4444" }}>
            {lowStockCount}
          </div>
          <div className="kpi-footer">
            <span>
              {onlyLowStock ? "Filter Active (Click to clear)" : "Needs immediate restock"}
            </span>
            <span style={{ color: "#ef4444" }}>
              {onlyLowStock ? "Reset ✕" : "Filter →"}
            </span>
          </div>
        </div>

        <div
          className={`kpi-card green ${
            activeTab === "customers" ? "active-card" : ""
          }`}
          onClick={() => setActiveTab("customers")}
        >
          <div className="kpi-top">
            <span className="kpi-title">Total Customers</span>
            <span
              className="kpi-icon-badge"
              style={{ background: "rgba(16, 185, 129, 0.14)", color: "#10b981" }}
            >
              👥
            </span>
          </div>
          <div className="kpi-number">{customers.length}</div>
          <div className="kpi-footer">
            <span>Active directory accounts</span>
            <span style={{ color: "#10b981" }}>Directory →</span>
          </div>
        </div>

        <div
          className={`kpi-card purple ${
            activeTab === "orders" ? "active-card" : ""
          }`}
          onClick={() => setActiveTab("orders")}
        >
          <div className="kpi-top">
            <span className="kpi-title">Total Revenue</span>
            <span
              className="kpi-icon-badge"
              style={{ background: "rgba(139, 92, 246, 0.14)", color: "#8b5cf6" }}
            >
              💰
            </span>
          </div>
          <div className="kpi-number">
            ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="kpi-footer">
            <span>Avg Order: ₹{avgOrderValue.toFixed(0)}</span>
            <span style={{ color: "#8b5cf6" }}>Checkout →</span>
          </div>
        </div>
      </section>

      {/* SEGMENTED NAVIGATION TABS */}
      <div className="toolbar-row">
        <div className="segmented-tabs">
          <button
            className={`seg-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            📦 Products <span className="count-pill">{products.length}</span>
          </button>
          <button
            className={`seg-btn ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            👥 Customers <span className="count-pill">{customers.length}</span>
          </button>
          <button
            className={`seg-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            🧾 Orders & Checkout{" "}
            <span className="count-pill">{orderDetails.length}</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT SURFACE */}
      <main className="surface-card">
        {/* ==================== 1. PRODUCTS TAB ==================== */}
        {activeTab === "products" && (
          <div>
            <form
              onSubmit={handleSaveProduct}
              className={`form-card ${editingProductId ? "editing-mode" : ""}`}
            >
              <div className="form-header">
                <span>
                  {editingProductId
                    ? `✏️ Editing Product #${editingProductId}`
                    : "➕ Add New Product to Inventory"}
                </span>
                {editingProductId && (
                  <span style={{ fontSize: "12px", color: "#f59e0b" }}>
                    Update fields below and click Save Changes
                  </span>
                )}
              </div>

              <div className="form-grid">
                <div className="field-group" style={{ gridColumn: "span 2" }}>
                  <label className="field-label">Product Name *</label>
                  <input
                    className="modern-input"
                    placeholder="e.g. Wireless Keyboard"
                    value={productForm.productName}
                    onChange={(e) =>
                      setProductForm({ ...productForm, productName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Unit Price (₹) *</label>
                  <input
                    className="modern-input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Stock Quantity *</label>
                  <input
                    className="modern-input"
                    type="number"
                    placeholder="0"
                    value={productForm.quantity}
                    onChange={(e) =>
                      setProductForm({ ...productForm, quantity: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Category</label>
                  <input
                    className="modern-input"
                    placeholder="e.g. Electronics"
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value })
                    }
                  />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="submit"
                    className={`btn-modern ${
                      editingProductId ? "btn-warning" : "btn-success"
                    }`}
                    style={{ flex: 1 }}
                  >
                    {editingProductId ? "💾 Save Changes" : "＋ Add Product"}
                  </button>
                  {editingProductId && (
                    <button
                      type="button"
                      className="btn-modern btn-ghost"
                      onClick={() => {
                        setEditingProductId(null);
                        setProductForm({
                          productName: "",
                          price: "",
                          quantity: "",
                          category: "",
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* INTERACTIVE CATEGORY CHIPS & SEARCH/SORT */}
            <div className="chips-bar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`chip ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === "All" ? "All Categories" : cat}
                </button>
              ))}

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  className="modern-input"
                  placeholder="🔍 Search product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "200px", padding: "8px 12px" }}
                />
                <select
                  className="modern-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: "175px", padding: "8px 12px" }}
                >
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="stock-asc">Stock: Lowest First</option>
                  <option value="name-asc">Name: A → Z</option>
                </select>
              </div>
            </div>

            {/* PRODUCTS TABLE */}
            <div className="table-shell">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Stock Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: "center",
                          padding: "36px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        No products match your current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLow = p.quantity < 5;
                      const stockPercent = Math.min(
                        100,
                        Math.max(4, (p.quantity / maxStock) * 100)
                      );
                      return (
                        <tr
                          key={p.productId}
                          className={isLow ? "critical-low-row" : "healthy-row"}
                        >
                          <td
                            style={{
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                            }}
                          >
                            #{p.productId}
                          </td>
                          <td>
                            <div
                              style={{
                                fontWeight: 700,
                                color: isLow ? "#ef4444" : "var(--text-primary)",
                              }}
                            >
                              {p.productName}
                            </div>
                          </td>
                          <td>
                            <span className="chip" style={{ cursor: "default" }}>
                              {p.category || "Uncategorized"}
                            </span>
                          </td>
                          <td style={{ fontWeight: 800 }}>
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </td>
                          <td>
                            <div className="stock-cell">
                              <span
                                className={`stock-badge ${isLow ? "low" : "ok"}`}
                              >
                                {p.quantity} {isLow ? "⚠️ Low Stock" : "In Stock"}
                              </span>
                              <div className="stock-track">
                                <div
                                  className="stock-fill"
                                  style={{
                                    width: `${stockPercent}%`,
                                    background: isLow ? "#ef4444" : "#10b981",
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                              }}
                            >
                              {isLow && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickRestock(p, 5)}
                                  className="btn-modern btn-success btn-xs restock-btn"
                                  title="Instantly add +5 stock"
                                >
                                  ⚡ +5 Stock
                                </button>
                              )}
                              <button
                                onClick={() => handleEditProductClick(p)}
                                className="btn-modern btn-warning btn-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.productId)}
                                className="btn-modern btn-danger btn-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== 2. CUSTOMERS TAB ==================== */}
        {activeTab === "customers" && (
          <div>
            <form
              onSubmit={handleSaveCustomer}
              className={`form-card ${editingCustomerId ? "editing-mode" : ""}`}
            >
              <div className="form-header">
                <span>
                  {editingCustomerId
                    ? `✏️️ Editing Customer #${editingCustomerId}`
                    : "➕ Register New Customer"}
                </span>
              </div>

              <div className="form-grid">
                <div className="field-group">
                  <label className="field-label">Customer Name *</label>
                  <input
                    className="modern-input"
                    placeholder="Full Name"
                    value={customerForm.customerName}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        customerName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Email Address *</label>
                  <input
                    className="modern-input"
                    type="email"
                    placeholder="name@example.com"
                    value={customerForm.email}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Phone Number</label>
                  <input
                    className="modern-input"
                    placeholder="10-digit mobile"
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, phone: e.target.value })
                    }
                  />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="submit"
                    className={`btn-modern ${
                      editingCustomerId ? "btn-warning" : "btn-success"
                    }`}
                    style={{ flex: 1 }}
                  >
                    {editingCustomerId ? "💾 Save Changes" : "＋ Add Customer"}
                  </button>
                  {editingCustomerId && (
                    <button
                      type="button"
                      className="btn-modern btn-ghost"
                      onClick={() => {
                        setEditingCustomerId(null);
                        setCustomerForm({
                          customerName: "",
                          email: "",
                          phone: "",
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            <div
              style={{
                marginBottom: "14px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <input
                className="modern-input"
                placeholder="🔍 Search customer by name, email, phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                style={{ width: "300px", padding: "8px 14px" }}
              />
            </div>

            <div className="table-shell">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c.customerId} className="healthy-row">
                      <td
                        style={{
                          fontWeight: 700,
                          color: "var(--text-secondary)",
                        }}
                      >
                        #{c.customerId}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span className="avatar-circle">
                            {getInitials(c.customerName)}
                          </span>
                          <strong>{c.customerName}</strong>
                        </div>
                      </td>
                      <td>{c.email}</td>
                      <td>{c.phone || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleEditCustomerClick(c)}
                            className="btn-modern btn-warning btn-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c.customerId)}
                            className="btn-modern btn-danger btn-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== 3. ORDERS & CHECKOUT TAB ==================== */}
        {activeTab === "orders" && (
          <div>
            <form onSubmit={handlePlaceOrder} className="form-card">
              <div className="form-header">
                <span>🧾 Create New Customer Order</span>
              </div>

              <div className="form-grid">
                <div className="field-group">
                  <label className="field-label">Select Customer *</label>
                  <select
                    className="modern-select"
                    value={orderForm.customerId}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, customerId: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.customerId} value={c.customerId}>
                        {c.customerName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <label className="field-label">Select Product *</label>
                  <select
                    className="modern-select"
                    value={orderForm.productId}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, productId: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option
                        key={p.productId}
                        value={p.productId}
                        disabled={p.quantity <= 0}
                      >
                        {p.productName} — ₹{p.price} ({p.quantity} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <label className="field-label">Quantity *</label>
                  <input
                    className="modern-input"
                    type="number"
                    min="1"
                    max={selectedProductObj?.quantity || 999}
                    placeholder="Qty"
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, quantity: e.target.value })
                    }
                    required
                  />
                </div>

                <button type="submit" className="btn-modern btn-primary">
                  🛒 Place Order {previewTotal ? `(₹${previewTotal})` : ""}
                </button>
              </div>
            </form>

            {/* LIVE ORDER RECEIPT PREVIEW */}
            {selectedProductObj && (
              <div className="checkout-preview">
                <span>
                  🧾 <strong>Checkout Preview:</strong>{" "}
                  {selectedCustomerObj
                    ? `${selectedCustomerObj.customerName} is ordering `
                    : "Ordering "}
                  <strong>
                    {orderForm.quantity} × {selectedProductObj.productName}
                  </strong>{" "}
                  (Stock remaining after order:{" "}
                  {Math.max(0, selectedProductObj.quantity - orderForm.quantity)})
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "var(--primary)",
                  }}
                >
                  Estimated Total: ₹{Number(previewTotal).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="table-shell">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th>Detail ID</th>
                    <th>Order & Customer</th>
                    <th>Product</th>
                    <th>Qty Ordered</th>
                    <th>Calculated Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.map((od) => {
                    const matchedProduct = products.find(
                      (p) => p.productId === od.productId
                    );
                    const parentOrder = orders.find(
                      (o) => o.orderId === od.orderId
                    );
                    const matchedCustomer = customers.find(
                      (c) => c.customerId === parentOrder?.customerId
                    );

                    return (
                      <tr key={od.orderDetailId} className="healthy-row">
                        <td
                          style={{
                            fontWeight: 700,
                            color: "var(--text-secondary)",
                          }}
                        >
                          #{od.orderDetailId}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>
                            Order #{od.orderId}{" "}
                            {matchedCustomer
                              ? `• ${matchedCustomer.customerName}`
                              : ""}
                          </div>
                          {parentOrder?.orderDate && (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {new Date(parentOrder.orderDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>
                            {od.product?.productName ||
                              matchedProduct?.productName ||
                              `Product #${od.productId}`}
                          </strong>
                        </td>
                        <td>
                          <span className="chip">{od.quantity} units</span>
                        </td>
                        <td
                          style={{
                            color: "#10b981",
                            fontWeight: 800,
                            fontSize: "15px",
                          }}
                        >
                          ₹{Number(od.price).toLocaleString("en-IN")}
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              handleCancelOrderItem(od.orderDetailId)
                            }
                            className="btn-modern btn-danger btn-xs"
                          >
                            Cancel & Restore Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;