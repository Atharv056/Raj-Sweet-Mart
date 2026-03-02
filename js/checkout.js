// Checkout page logic with validation and localStorage order storage
//
// ISSUE
// The current implementation stores orders in localStorage. Each browser/device
// has its own separate localStorage, so:
//   Customer A orders from Device 1 → saved in Device 1's storage
//   Customer B orders from Device 2 → saved in Device 2's storage
//   Admin opens panel on Device 3 → reads Device 3's (empty) storage
// Therefore the admin panel can never see orders placed on other devices.
// localStorage is scoped to a single origin+browser profile and is not shared.
//
// SOLUTION (Option 1: Use Firebase - Easiest / free tier)
// No server code required. Use Firebase Realtime Database or Firestore:
//    • All clients connect to the same cloud database
//    • Customers write orders to Firebase
//    • Admin panel reads orders from Firebase in real time
// Setup takes ~10 minutes and works on any device.
//
// (Option 2 would be to host your own backend/API and store orders in a
// central database, but Firebase removes that overhead.)

//
// ✅ Option 1: Use Firebase (Best for You)
//
// Use Firebase (Google’s backend service) instead of localStorage.
//
// How It Works
//    Customer Device → Firebase Database → Admin Device
//    (All connected to same cloud database)
//
// Instead of saving orders in localStorage:
//    • Save orders in Firebase Realtime Database
//    • All devices read/write from same cloud database
//    • Admin panel automatically sees new orders
//
// Flow:
//    Customer Device → Firebase Database → Admin Device
//    (All connected to same cloud database)
//
// This ensures that orders placed from any device are visible
// to the admin panel in real time.

document.addEventListener('DOMContentLoaded', function () {
  const cartEl = document.getElementById('cartContainer');
  const totalEl = document.getElementById('cartTotal');
  const payAmountEl = document.getElementById('payAmount');
  const clearBtn = document.getElementById('clearCartBtn');
  const qrImg = document.getElementById('paytmQR');
  const txnIdEl = document.getElementById('txnId');
  const screenshotInput = document.getElementById('paymentScreenshot');
  const screenshotPreview = document.getElementById('screenshotPreview');
  const submitBtn = document.getElementById('submitOrderBtn');
  const msgEl = document.getElementById('checkoutMessage');
  const nameEl = document.getElementById('customerName');
  const phoneEl = document.getElementById('customerPhone');
  const addrEl = document.getElementById('customerAddress');

  // Load QR image URL dynamically from localStorage (fallback to placeholder)
  try {
    const qru = localStorage.getItem('paytm_qr_url');
    if (qru) qrImg.src = qru;
  } catch (e) {}

  function renderCart() {
    const cart = getCart();
    if (cart.length === 0) {
      cartEl.innerHTML = '<p>Your cart is empty. Go to Menu to add items.</p>';
    } else {
      const rows = cart.map(i => `
        <div class="cart-row">
          <div class="col-item">${i.name}</div>
          <div class="col-price"><span class="nowrap">₹ ${Math.round(i.price)}</span></div>
          <div class="col-qty">
            <button class="nav-button" data-action="dec" data-id="${i.id}">-</button>
            <span>${i.qty}</span>
            <button class="nav-button" data-action="inc" data-id="${i.id}">+</button>
          </div>
          <div class="col-total"><span class="nowrap">₹ ${(i.price * i.qty).toFixed(2)}</span></div>
          <div class="col-actions">
            <button class="nav-button" data-action="remove" data-id="${i.id}">Remove</button>
          </div>
        </div>
      `).join('');
      cartEl.innerHTML = rows;
    }
    const t = cartTotal();
    totalEl.textContent = t.toFixed(2);
    payAmountEl.textContent = t.toFixed(2);
  }

  renderCart();

  cartEl.addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'remove') {
      removeFromCart(id);
    } else if (action === 'inc') {
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if (item) updateQty(id, item.qty + 1);
    } else if (action === 'dec') {
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if (item) updateQty(id, Math.max(1, item.qty - 1));
    }
    renderCart();
  });

  clearBtn.addEventListener('click', function () {
    clearCart();
    renderCart();
  });

  screenshotInput.addEventListener('change', function () {
    const file = screenshotInput.files && screenshotInput.files[0];
    if (!file) {
      screenshotPreview.innerHTML = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      const url = reader.result;
      screenshotPreview.innerHTML = `<img src="${url}" alt="Payment screenshot" style="max-width: 100%; border-radius: 8px;" />`;
      screenshotPreview.dataset.img = url;
    };
    reader.readAsDataURL(file);
  });

  function validate() {
    const errors = [];
    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const address = addrEl.value.trim();
    const txnId = txnIdEl.value.trim();
    const total = cartTotal();

    if (!name) errors.push('Name is required.');
    if (!phone || phone.length < 10) errors.push('Valid phone is required.');
    if (!address) errors.push('Address is required.');
    if (total <= 0) errors.push('Cart is empty.');
    if (!txnId) errors.push('UPI Transaction ID is required.');

    return errors;
  }

  function showMessage(type, text) {
    msgEl.textContent = text;
    msgEl.style.color = type === 'error' ? '#b00020' : '#116611';
    msgEl.style.fontWeight = '600';
  }

  submitBtn.addEventListener('click', function () {
    const errs = validate();
    if (errs.length) {
      showMessage('error', errs.join(' '));
      return;
    }
    // create a small random token for access
    const accessToken = Math.random().toString(36).substring(2, 10);
    const order = {
      id: 'ORD-' + Date.now(),
      customerName: nameEl.value.trim(),
      phone: phoneEl.value.trim(),
      address: addrEl.value.trim(),
      items: getCart(),
      totalAmount: cartTotal(),
      txnId: txnIdEl.value.trim(),
      proofScreenshot: screenshotPreview.dataset.img || '',
      status: 'Payment Pending Verification',
      createdAt: new Date().toISOString(),
      accessToken: accessToken
    };
      // safer save: try storing order, retry without screenshot if quota exceeded
      function trySaveOrder(o) {
        const existing = JSON.parse(localStorage.getItem('rsm_orders') || '[]');
        existing.push(o);
        localStorage.setItem('rsm_orders', JSON.stringify(existing));
      }

      try {
        trySaveOrder(order);
        // remember user phone and token for dashboard lookup
        localStorage.setItem('rsm_user_phone', phoneEl.value.trim());
        localStorage.setItem('rsm_user_token', accessToken);
        clearCart();
        renderCart();
        showMessage('success', 'Order submitted successfully!');
        // provide quick link to dashboard with styled buttons
        msgEl.innerHTML += `
          <div class="order-action-buttons">
            <a href="user-dashboard.html" class="view-order-btn">
              <i class="fas fa-eye"></i> View Order
            </a>
            <div class="token-display" title="Copy token">${accessToken}</div>
            <button class="token-btn" onclick="copyToken('${accessToken}')" title="Copy to clipboard">
              <i class="fas fa-copy"></i> Copy Token
            </button>
          </div>
        `;
      } catch (e) {
        // if storage quota exceeded, try again without screenshot (common cause)
        console.error('Failed to save order to localStorage:', e);
        const isQuota = (e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22));
        if (isQuota && order.proofScreenshot) {
          try {
            const fallback = Object.assign({}, order, { proofScreenshot: '' });
            trySaveOrder(fallback);
            localStorage.setItem('rsm_user_phone', phoneEl.value.trim());
            localStorage.setItem('rsm_user_token', accessToken);
            clearCart();
            renderCart();
            showMessage('success', 'Order submitted (without screenshot due to storage limits).');
            msgEl.innerHTML += `
              <div class="order-action-buttons">
                <a href="user-dashboard.html" class="view-order-btn">
                  <i class="fas fa-eye"></i> View Order
                </a>
                <div class="token-display" title="Copy token">${accessToken}</div>
                <button class="token-btn" onclick="copyToken('${accessToken}')" title="Copy to clipboard">
                  <i class="fas fa-copy"></i> Copy Token
                </button>
              </div>
            `;
            return;
          } catch (e2) {
            console.error('Fallback save without screenshot also failed:', e2);
          }
        }
        // show developer-friendly hint to user and log
        showMessage('error', 'Failed to save order. ' + (e && e.message ? e.message : 'Please try again.'));
    }
  });
});

// Function to copy token to clipboard
function copyToken(token) {
  navigator.clipboard.writeText(token).then(function() {
    // Show temporary success feedback
    const btn = event.target.closest('.token-btn');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(function() {
        btn.innerHTML = originalText;
      }, 2000);
    }
  }).catch(function(err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = token;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Token copied to clipboard!');
  });
}
