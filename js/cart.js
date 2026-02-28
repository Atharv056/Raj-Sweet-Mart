// Cart management utility
// Stores cart in localStorage under "rsm_cart"
// Each item: { id, name, price, qty }

// Get cart from localStorage
function getCart() {
    try {
        const data = localStorage.getItem('rsm_cart');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('rsm_cart', JSON.stringify(cart));
}

// Find item index by id
function findItemIndex(cart, id) {
    return cart.findIndex(i => i.id === id);
}

// Add item to cart (or increase qty)
function addToCart(item) {
    const cart = getCart();
    const idx = findItemIndex(cart, item.id);
    if (idx >= 0) {
        cart[idx].qty += 1;
    } else {
        cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    }
    saveCart(cart);
}

// Remove item from cart
function removeFromCart(id) {
    const cart = getCart().filter(i => i.id !== id);
    saveCart(cart);
}

// Update quantity
function updateQty(id, qty) {
    const cart = getCart();
    const idx = findItemIndex(cart, id);
    if (idx >= 0) {
        cart[idx].qty = Math.max(1, qty);
        saveCart(cart);
    }
}

// Clear cart
function clearCart() {
    saveCart([]);
}

// Calculate total
function cartTotal() {
    return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

// Helper: parse numeric price from strings like "₹400/kg"
function parsePrice(text) {
    const m = String(text || '').replace(/,/g, '').match(/(\d+(\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
}

// UI enhancer: attach Add to Cart buttons on menu items
document.addEventListener('DOMContentLoaded', function () {
    const items = document.querySelectorAll('.sweet-item');
    items.forEach((el) => {
        const name = el.dataset.name || el.querySelector('.sweet-name')?.textContent?.trim() || 'Item';
        const priceText = el.dataset.price || el.querySelector('.sweet-price')?.textContent?.trim() || '';
        const price = parsePrice(priceText);
        const id = (name + '_' + price).toLowerCase().replace(/\s+/g, '-');

        // Avoid duplicate buttons
        if (el.querySelector('.add-to-cart-btn')) return;

        const details = el.querySelector('.sweet-details') || el;
        const btn = document.createElement('button');
        // Add Tailwind-like utility classes for future compatibility and semantic clarity
        btn.className = 'add-to-cart-btn px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300';
        btn.textContent = 'Add to Cart';
        btn.style.marginTop = '8px';
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            
            // Trigger pulse animation
            btn.classList.add('pulse');
            
            // Add success glow animation
            setTimeout(() => {
                btn.classList.add('success');
            }, 100);
            
            // Show cart notification
            const notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i>${name} added to cart!`;
            document.body.appendChild(notification);
            
            // Remove notification after animation completes
            setTimeout(() => {
                notification.remove();
            }, 1000);
            
            // Add item to cart
            addToCart({ id, name, price });
            
            // Update button text and back to original
            const originalText = btn.textContent;
            btn.textContent = '✓ Added!';
            
            // Reset button styles and text
            setTimeout(() => {
                btn.classList.remove('pulse', 'success');
                btn.textContent = originalText;
            }, 1500);
        });
        details.appendChild(btn);
    });
});
