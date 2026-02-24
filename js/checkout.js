// Checkout page logic with validation and localStorage order storage
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
      createdAt: new Date().toISOString()
    };
    try {
      const existing = JSON.parse(localStorage.getItem('rsm_orders') || '[]');
      existing.push(order);
      localStorage.setItem('rsm_orders', JSON.stringify(existing));
      clearCart();
      renderCart();
      showMessage('success', 'Order submitted! We will verify your payment shortly.');
    } catch (e) {
      showMessage('error', 'Failed to save order. Please try again.');
    }
  });
});
