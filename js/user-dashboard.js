// User dashboard to view and delete own orders
document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('ordersContainer');
  const phoneEl = document.getElementById('phoneInput');
  const tokenEl = document.getElementById('tokenInput');
  const loadBtn = document.getElementById('loadOrdersBtn');
  const infoEl = document.getElementById('infoMessage');

  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem('rsm_orders') || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveOrders(orders) {
    localStorage.setItem('rsm_orders', JSON.stringify(orders));
  }

  function ymd(d) {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }

  function labelForDate(d) {
    const today = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const target = new Date(d);
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const t1 = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
    const diffDays = Math.round((t0 - t1) / dayMs);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return target.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  function render() {
    let orders = getOrders();
    const phone = (phoneEl && phoneEl.value.trim()) || localStorage.getItem('rsm_user_phone') || '';
    const token = (tokenEl && tokenEl.value.trim()) || localStorage.getItem('rsm_user_token') || '';
    if (!phone || !token) {
      infoEl.textContent = 'Enter your phone number and access token to view your orders.';
      container.innerHTML = '';
      return;
    }
    infoEl.textContent = '';
    orders = orders.filter(o => o.phone === phone && (o.accessToken || '') === token);
    if (orders.length === 0) {
      container.innerHTML = '<p style="color:#6b7280;">No orders found for this number.</p>';
      return;
    }
    // group by date
    orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    const groups = {};
    orders.forEach(o => {
      const key = ymd(o.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(o);
    });
    const keys = Object.keys(groups).sort((a,b)=> new Date(b) - new Date(a));
    const sections = keys.map(key => {
      const title = labelForDate(key);
      const cards = groups[key].map(o => {
        const itemsRows = (o.items || []).map(i => {
          const sub = (i.price * i.qty).toFixed(2);
          return `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹ ${i.price.toFixed(2)}</td><td>₹ ${sub}</td></tr>`;
        }).join('');
        return `
        <div class="order-card" data-id="${o.id}">
          <div class="card-head">
            <div class="badges">
              <span class="badge badge-id">${o.id}</span>
            </div>
            <span class="badge badge-pending">${o.status || 'Pending'}</span>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="label">Customer</div><div>${o.customerName} — ${o.phone}</div>
              <div class="label">Address</div><div>📍 <span style="word-break:break-word; overflow-wrap:anywhere;">${o.address}</span></div>
              <div class="label">Total</div><div class="amount">₹ ${o.totalAmount.toFixed(2)}</div>
              <div class="label">Created</div><div class="timestamp">${new Date(o.createdAt).toLocaleString()}</div>
            </div>
            <div class="items-accordion">
              <details class="order-items">
                <summary><span>Items</span><span>▾</span></summary>
                <div class="items-table-wrap">
                  <table class="items-table">
                    <thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr></thead>
                    <tbody>${itemsRows}</tbody>
                  </table>
                </div>
              </details>
            </div>
            <div class="actions">
              <button class="btn btn-danger" data-action="delete" data-id="${o.id}">🗑 Delete</button>
            </div>
          </div>
        </div>
        `;
      }).join('');
      const dateText = new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `
        <section class="orders-group">
          <h3 class="group-title">${title} <span class="timestamp">• ${dateText}</span></h3>
          <div class="orders-grid">${cards}</div>
        </section>
      `;
    }).join('');
    container.innerHTML = sections;
  }

  function load() {
    localStorage.setItem('rsm_user_phone', phoneEl.value.trim());
    if (tokenEl) localStorage.setItem('rsm_user_token', tokenEl.value.trim());
    render();
  }

  if (loadBtn) loadBtn.addEventListener('click', load);
  if (phoneEl) phoneEl.addEventListener('keypress', function(e){ if(e.key==='Enter'){ load(); } });

  // auto load if phone and token saved
  const savedPhone = localStorage.getItem('rsm_user_phone');
  const savedToken = localStorage.getItem('rsm_user_token');
  if (savedPhone && phoneEl) phoneEl.value = savedPhone;
  if (savedToken && tokenEl) tokenEl.value = savedToken;
  if (savedPhone && savedToken) render();

  container.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'delete') {
      const ordersAll = getOrders();
      const target = ordersAll.find(o => o.id === id);
      if (!target) return;
      const currentToken = (tokenEl && tokenEl.value.trim()) || localStorage.getItem('rsm_user_token') || '';
      if ((target.accessToken || '') !== currentToken) {
        alert('Invalid access token. Deletion denied.');
        return;
      }
      // Confirm before deleting
      if (!confirm(`Are you sure you want to delete order ${id}?\n\nThis action cannot be undone.`)) {
        return;
      }
      let orders = ordersAll.filter(o => o.id !== id);
      saveOrders(orders);
      render();
    }
  });
});