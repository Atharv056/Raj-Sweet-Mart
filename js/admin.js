// Admin page to list and update orders stored in localStorage
document.addEventListener('DOMContentLoaded', function () {
  const isAuthed = localStorage.getItem('rsm_admin_logged_in') === 'true';
  if (!isAuthed) {
    window.location.href = 'admin-login.html';
    return;
  }
  const container = document.getElementById('ordersContainer');
  const clearBtn = document.getElementById('clearOrdersBtn');
  const filterEl = document.getElementById('filterStatus');
  const searchEl = document.getElementById('searchInput');
  const countEl = document.getElementById('ordersCount');
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('rsm_admin_logged_in');
      window.location.href = 'admin-login.html';
    });
  }

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
  function statusClass(s) {
    const t = (s || '').toLowerCase();
    if (t === 'verified') return 'badge badge-verified';
    if (t === 'delivered') return 'badge badge-delivered';
    if (t === 'cancelled') return 'badge badge-cancelled';
    return 'badge badge-pending';
  }

  function ymd(d) {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  }
  function labelForDate(d) {
    const today = new Date();
    const dayMs = 24*60*60*1000;
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
    const f = (filterEl && filterEl.value) || 'All';
    const q = (searchEl && searchEl.value || '').trim().toLowerCase();
    if (f !== 'All') orders = orders.filter(o => (o.status || 'Pending') === f);
    if (q) orders = orders.filter(o =>
      (o.id || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q)
    );
    if (countEl) countEl.textContent = orders.length ? `${orders.length} orders` : 'No orders';
    if (orders.length === 0) {
      container.innerHTML = '<p style="color:#6b7280;">No orders found.</p>';
      return;
    }
    orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    const groups = {};
    orders.forEach(o => {
      const key = ymd(o.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(o);
    });
    const keys = Object.keys(groups).sort((a,b) => new Date(b) - new Date(a));
    const sections = keys.map(key => {
      const title = labelForDate(key);
      const cards = groups[key].map(o => {
        const itemsRows = (o.items || []).map(i => {
          const sub = (i.price * i.qty).toFixed(2);
          return `<tr><td>${i.name}</td><td>${i.qty}</td><td>₹ ${i.price.toFixed(2)}</td><td>₹ ${sub}</td></tr>`;
        }).join('');
        const proof = o.proofScreenshot ? `<div style="margin-top:8px;"><img src="${o.proofScreenshot}" alt="Proof" style="max-width:220px; border-radius:12px; border:1px solid #e5e7eb;" /></div>` : '';
        const cls = statusClass(o.status || 'Pending');
        return `
        <div class="order-card" data-id="${o.id}">
          <div class="card-head">
            <div class="badges">
              <span class="badge badge-id">${o.id}</span>
            </div>
            <span class="${cls}">${o.status || 'Pending'}</span>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="label">Customer</div><div>${o.customerName} — ${o.phone}</div>
              <div class="label">Address</div><div>📍 <span style="word-break:break-word; overflow-wrap:anywhere;">${o.address}</span></div>
              <div class="label">Total</div><div class="amount">₹ ${o.totalAmount.toFixed(2)}</div>
              <div class="label">Created</div><div class="timestamp">${new Date(o.createdAt).toLocaleString()}</div>
            </div>
            ${proof}
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
              <button class="btn btn-primary" data-action="verify" data-id="${o.id}">✔ Mark Verified</button>
              <button class="btn btn-success" data-action="deliver" data-id="${o.id}">🚚 Mark Delivered</button>
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

  container.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const orders = getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx < 0) return;
    if (action === 'verify') {
      orders[idx].status = 'Verified';
    } else if (action === 'deliver') {
      orders[idx].status = 'Delivered';
    } else if (action === 'delete') {
      orders.splice(idx, 1);
    }
    saveOrders(orders);
    render();
  });

  clearBtn.addEventListener('click', function () {
    if (confirm('Clear all orders?')) {
      saveOrders([]);
      render();
    }
  });

  if (filterEl) filterEl.addEventListener('change', render);
  if (searchEl) searchEl.addEventListener('input', render);

  render();
});
