import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalRevenue: 0, todayOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/orders/${id}`, { status });
      fetchOrders();
      fetchStats();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(`${API_URL}/orders/${id}`);
      fetchOrders();
      fetchStats();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Confirmed': return '#3b82f6';
      case 'Shipped': return '#8b5cf6';
      case 'Delivered': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="header-left">
          <h1>Kiran Bore Wells - Admin</h1>
        </div>
        <div className="header-right">
          <span className="date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingOrders}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">₹{stats.totalRevenue.toLocaleString()}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.todayOrders}</span>
            <span className="stat-label">Today</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="orders-section">
          <div className="section-header">
            <h2>Orders</h2>
            <div className="filter-buttons">
              {['all', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders">No orders found</div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div
                  key={order._id}
                  className={`order-card ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-header">
                    <span className="order-id">{order.orderId}</span>
                    <span className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-customer">{order.customerName}</div>
                  <div className="order-details">
                    <span className="order-phone">📞 {order.phone}</span>
                    <span className="order-total">₹{order.total?.toLocaleString()}</span>
                  </div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="order-details-section">
          {selectedOrder ? (
            <>
              <div className="details-header">
                <h2>Order Details</h2>
                <span className="order-status-large" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="details-card">
                <div className="detail-row">
                  <span className="detail-label">Order ID</span>
                  <span className="detail-value">{selectedOrder.orderId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>

              <div className="details-card">
                <h3>Customer Info</h3>
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{selectedOrder.customerName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">
                    <a href={`tel:${selectedOrder.phone}`}>{selectedOrder.phone}</a>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{selectedOrder.address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">PIN Code</span>
                  <span className="detail-value">{selectedOrder.pincode}</span>
                </div>
              </div>

              <div className="details-card">
                <h3>Products</h3>
                <div className="products-list">
                  {selectedOrder.products?.map((product, idx) => (
                    <div key={idx} className="product-item">
                      <span className="product-name">{product.name}</span>
                      <span className="product-qty">x{product.quantity}</span>
                      <span className="product-price">₹{product.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="summary-row">
                    <span>GST (18%)</span>
                    <span>₹{selectedOrder.gst?.toLocaleString()}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="details-card">
                <h3>Update Status</h3>
                <div className="status-buttons">
                  {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                    <button
                      key={status}
                      className={`status-btn ${selectedOrder.status === status ? 'active' : ''}`}
                      style={{
                        backgroundColor: selectedOrder.status === status ? getStatusColor(status) : 'transparent',
                        borderColor: getStatusColor(status),
                        color: selectedOrder.status === status ? '#fff' : getStatusColor(status)
                      }}
                      onClick={() => updateStatus(selectedOrder._id, status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="action-buttons">
                <a
                  href={`https://wa.me/91${selectedOrder.phone}?text=Hi ${selectedOrder.customerName}, your order ${selectedOrder.orderId} status: ${selectedOrder.status}. Thank you - Kiran Bore Wells!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn whatsapp-btn"
                >
                  📱 WhatsApp
                </a>
                <button className="btn delete-btn" onClick={() => deleteOrder(selectedOrder._id)}>
                  🗑️ Delete
                </button>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <span className="no-selection-icon">📋</span>
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
