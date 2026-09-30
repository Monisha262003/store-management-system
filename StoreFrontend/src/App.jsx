import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://localhost:7172/api";

function App() {
  const [activeTab, setActiveTab] = useState("products");

  // Data states
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [error, setError] = useState("");

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
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetchProducts();
    fetchCustomers();
    fetchOrders();
    fetchOrderDetails();
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
      } else {
        await axios.post(`${API_BASE}/Product`, {
          productName: productForm.productName,
          price: parseFloat(productForm.price),
          quantity: parseInt(productForm.quantity),
          category: productForm.category,
        });
      }
      setProductForm({ productName: "", price: "", quantity: "", category: "" });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data || "Error saving product.");
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
  };

  const handleDeleteProduct = async (id) => {
    await axios.delete(`${API_BASE}/Product/${id}`);
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
      } else {
        await axios.post(`${API_BASE}/Customer`, customerForm);
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
  };

  const handleDeleteCustomer = async (id) => {
    await axios.delete(`${API_BASE}/Customer/${id}`);
    fetchCustomers();
  };

  // ---------------- PLACE ORDER (TRIGGERS BUSINESS LOGIC) ----------------
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      // 1. Create the Order for the selected Customer
      const orderRes = await axios.post(`${API_BASE}/Order`, {
        customerId: parseInt(orderForm.customerId),
        orderDate: new Date().toISOString(),
      });

      const newOrderId = orderRes.data.orderId;

      // 2. Create the OrderDetail (Backend automatically checks stock, deducts stock, and calculates price!)
      await axios.post(`${API_BASE}/OrderDetail`, {
        orderId: newOrderId,
        productId: parseInt(orderForm.productId),
        quantity: parseInt(orderForm.quantity),
        price: 0, // Auto-calculated in OrderDetailService!
      });

      setOrderForm({ customerId: "", productId: "", quantity: 1 });
      fetchAllData(); // Refreshes Product stock & Order list!
    } catch (err) {
      alert(err.response?.data || "Error placing order.");
    }
  };

  // Delete an Order Item (Restores stock automatically via OrderDetailService!)
  const handleCancelOrderItem = async (orderDetailId) => {
    await axios.delete(`${API_BASE}/OrderDetail/${orderDetailId}`);
    fetchAllData();
  };

  // Dashboard Metrics
  const totalRevenue = orderDetails.reduce((sum, item) => sum + (item.price || 0), 0);
  const lowStockCount = products.filter((p) => p.quantity < 5).length;

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", fontFamily: "Segoe UI, sans-serif", padding: "0 20px" }}>
      <h1 style={{ fontSize: "34px", lineHeight: "1.3", margin: "0 0 10px 0" }}>
        🛒 Store Management System
      </h1>
      <p style={{ color: "#666", fontSize: "15px", marginTop: 0, marginBottom: "28px" }}>
        3-Tier .NET Core 8 Web API • Entity Framework Core • SQL Server • React
      </p>

      {error && (
        <div style={{ background: "#ffe6e6", color: "#b30000", padding: "12px", borderRadius: "6px", marginBottom: "20px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* KPI SUMMARY CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" }}>
        <div style={{ background: "#eff6ff", padding: "15px", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
          <div style={{ fontSize: "13px", color: "#1d4ed8", fontWeight: "bold" }}>TOTAL PRODUCTS</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginTop: "5px" }}>{products.length}</div>
        </div>
        <div style={{ background: "#fef2f2", padding: "15px", borderRadius: "8px", border: "1px solid #fecaca" }}>
          <div style={{ fontSize: "13px", color: "#b91c1c", fontWeight: "bold" }}>LOW STOCK (&lt; 5)</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginTop: "5px" }}>{lowStockCount}</div>
        </div>
        <div style={{ background: "#f0fdf4", padding: "15px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: "13px", color: "#15803d", fontWeight: "bold" }}>TOTAL CUSTOMERS</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginTop: "5px" }}>{customers.length}</div>
        </div>
        <div style={{ background: "#faf5ff", padding: "15px", borderRadius: "8px", border: "1px solid #e9d5ff" }}>
          <div style={{ fontSize: "13px", color: "#6d28d9", fontWeight: "bold" }}>TOTAL REVENUE</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", marginTop: "5px" }}>₹{totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
        <button
          onClick={() => setActiveTab("products")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "none",
            background: activeTab === "products" ? "#2563eb" : "#e5e7eb",
            color: activeTab === "products" ? "#fff" : "#111",
            fontWeight: "bold",
          }}
        >
          📦 Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "none",
            background: activeTab === "customers" ? "#2563eb" : "#e5e7eb",
            color: activeTab === "customers" ? "#fff" : "#111",
            fontWeight: "bold",
          }}
        >
          👥 Customers ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "none",
            background: activeTab === "orders" ? "#2563eb" : "#e5e7eb",
            color: activeTab === "orders" ? "#fff" : "#111",
            fontWeight: "bold",
          }}
        >
          🧾 Orders & Checkout ({orderDetails.length})
        </button>
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === "products" && (
        <div>
          <form onSubmit={handleSaveProduct} style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input
              placeholder="Product Name"
              value={productForm.productName}
              onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
              required
              style={{ padding: "8px", flex: 1 }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              required
              style={{ padding: "8px", width: "110px" }}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={productForm.quantity}
              onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
              required
              style={{ padding: "8px", width: "90px" }}
            />
            <input
              placeholder="Category"
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              style={{ padding: "8px", width: "140px" }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                background: editingProductId ? "#f59e0b" : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {editingProductId ? "💾 Update Product" : "+ Add Product"}
            </button>
          </form>

          <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse", border: "1px solid #ddd" }}>
            <thead style={{ background: "#f3f4f6", textAlign: "left" }}>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.productId} style={{ borderTop: "1px solid #ddd" }}>
                  <td>{p.productId}</td>
                  <td><strong>{p.productName}</strong></td>
                  <td>{p.category}</td>
                  <td>₹{p.price}</td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        background: p.quantity < 5 ? "#fee2e2" : "#dcfce7",
                        color: p.quantity < 5 ? "#b91c1c" : "#15803d",
                      }}
                    >
                      {p.quantity} {p.quantity < 5 ? "⚠️ Low" : "In Stock"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEditProductClick(p)}
                      style={{ background: "#f59e0b", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.productId)}
                      style={{ background: "#dc2626", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === "customers" && (
        <div>
          <form onSubmit={handleSaveCustomer} style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input
              placeholder="Customer Name"
              value={customerForm.customerName}
              onChange={(e) => setCustomerForm({ ...customerForm, customerName: e.target.value })}
              required
              style={{ padding: "8px", flex: 1 }}
            />
            <input
              type="email"
              placeholder="Email"
              value={customerForm.email}
              onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
              style={{ padding: "8px", flex: 1 }}
            />
            <input
              placeholder="Phone (10 digits)"
              value={customerForm.phone}
              onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
              style={{ padding: "8px", width: "160px" }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                background: editingCustomerId ? "#f59e0b" : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {editingCustomerId ? "💾 Update Customer" : "+ Add Customer"}
            </button>
          </form>

          <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse", border: "1px solid #ddd" }}>
            <thead style={{ background: "#f3f4f6", textAlign: "left" }}>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.customerId} style={{ borderTop: "1px solid #ddd" }}>
                  <td>{c.customerId}</td>
                  <td><strong>{c.customerName}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEditCustomerClick(c)}
                      style={{ background: "#f59e0b", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(c.customerId)}
                      style={{ background: "#dc2626", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDERS & CHECKOUT TAB */}
      {activeTab === "orders" && (
        <div>
          <form onSubmit={handlePlaceOrder} style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", background: "#f9fafb", padding: "15px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <select
              value={orderForm.customerId}
              onChange={(e) => setOrderForm({ ...orderForm, customerId: e.target.value })}
              required
              style={{ padding: "8px", flex: 1 }}
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.customerName} ({c.email})
                </option>
              ))}
            </select>

            <select
              value={orderForm.productId}
              onChange={(e) => setOrderForm({ ...orderForm, productId: e.target.value })}
              required
              style={{ padding: "8px", flex: 1 }}
            >
              <option value="">-- Select Product --</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productName} (₹{p.price} • {p.quantity} in stock)
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              placeholder="Qty"
              value={orderForm.quantity}
              onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
              required
              style={{ padding: "8px", width: "80px" }}
            />

            <button
              type="submit"
              style={{ padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
            >
              🛒 Place Order
            </button>
          </form>

          <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse", border: "1px solid #ddd" }}>
            <thead style={{ background: "#f3f4f6", textAlign: "left" }}>
              <tr>
                <th>Detail ID</th>
                <th>Order ID</th>
                <th>Product</th>
                <th>Qty Ordered</th>
                <th>Auto-Calculated Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.map((od) => (
                <tr key={od.orderDetailId} style={{ borderTop: "1px solid #ddd" }}>
                  <td>{od.orderDetailId}</td>
                  <td>#{od.orderId}</td>
                  <td><strong>{od.product?.productName || `Product ID: ${od.productId}`}</strong></td>
                  <td>{od.quantity}</td>
                  <td style={{ color: "#15803d", fontWeight: "bold" }}>₹{od.price}</td>
                  <td>
                    <button
                      onClick={() => handleCancelOrderItem(od.orderDetailId)}
                      style={{ background: "#dc2626", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Cancel & Restore Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;