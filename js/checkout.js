// Checkout page logic with Google Apps Script integration
// All orders are sent to Google Apps Script Web App endpoint

// Google Apps Script Web App URL
// Replace with your actual deployed GAS web app URL
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz_aeQuq6iWRX3pYORewYQSH0hV4mN-FT5ENIC-g0Usk3x_rWP75wOCRqbMEDHiO-RVpQ/exec';

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

// helper: push order to Firebase
function saveOrderToFirebase(order) {
  return firebase.database().ref('orders').push(order);
}


document.addEventListener('DOMContentLoaded', function () {
  const cartEl = document.getElementById('cartContainer');
  const totalEl = document.getElementById('cartTotal');
  const payAmountEl = document.getElementById('payAmount');
  const clearBtn = document.getElementById('clearCartBtn');
  const qrImg = document.getElementById('paytmQR');
  const txnIdEl = document.getElementById('txnId');
  const submitBtn = document.getElementById('submitOrderBtn');
  const msgEl = document.getElementById('checkoutMessage');
  const nameEl = document.getElementById('customerName');
  const phoneEl = document.getElementById('customerPhone');
  const addrEl = document.getElementById('customerAddress');

  // Load QR image URL dynamically from localStorage (fallback to placeholder)
  try {
    const qru = localStorage.getItem('paytm_qr_url');
    if (qru) qrImg.src = qru;
  } catch (e) { }

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

  function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.style.opacity = isLoading ? '0.6' : '1';
    submitBtn.style.cursor = isLoading ? 'not-allowed' : 'pointer';
    submitBtn.innerHTML = isLoading ? '<i class="fas fa-spinner fa-spin"></i> Submitting...' : 'Submit Order';
  }

  submitBtn.addEventListener('click', function () {
    const errs = validate();
    if (errs.length) {
      showMessage('error', errs.join(' '));
      return;
    }

    setLoadingState(true);
    msgEl.textContent = '';

    const formattedItems = getCart()
      .map(item => `${item.name} - ₹${item.price} - Qty: ${item.qty}`)
      .join(" | ");

    const payload = {
      upiTransactionId: txnIdEl.value.trim(),
      name: nameEl.value.trim(),
      phone: phoneEl.value.trim(),
      address: addrEl.value.trim(),
      items: formattedItems,
      totalAmount: cartTotal()
    };

    // Send order to Google Apps Script via FormData and no-cors
    const formData = new FormData();
    formData.append('upiTransactionId', payload.upiTransactionId);
    formData.append('name', payload.name);
    formData.append('phone', payload.phone);
    formData.append('address', payload.address);
    formData.append('items', JSON.stringify(payload.items));
    formData.append('totalAmount', payload.totalAmount);

    console.log('Sending FormData payload to GAS:', payload);
    fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    })
      .then(() => {
        setLoadingState(false);

        // Clear form and cart
        clearCart();
        txnIdEl.value = '';
        nameEl.value = '';
        phoneEl.value = '';
        addrEl.value = '';
        renderCart();

        // Show success message
        showMessage('success', 'Order placed successfully!');
      })
      .catch(error => {
        setLoadingState(false);
        console.error('Order submission error:', error);

        showMessage('error', 'Failed to submit order. Please check your details and try again.');
      });
  });
});

