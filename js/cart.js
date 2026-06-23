// Cart management utility
// Stores cart in localStorage under "rsm_cart"
// Each item: { id, name, price, qty, weight, pricePerUnit, unit }

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
    updateCartCount();
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
        cart.push({ 
            id: item.id, 
            name: item.name, 
            price: item.price, 
            qty: item.qty || 1,
            weight: item.weight || 1000, // Default 1kg
            pricePerUnit: item.pricePerUnit || item.price,
            unit: item.unit || 'kg'
        });
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
    return getCart().reduce((sum, i) => sum + (i.price || (i.pricePerUnit * (i.weight / 1000))) * i.qty, 0);
}

// Get total number of items in cart
function cartItemCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
}

// Update cart count display
function updateCartCount() {
    // Update floating cart count
    const floatingCountElement = document.getElementById('cart-item-count');
    if (floatingCountElement) {
        const count = cartItemCount();
        floatingCountElement.textContent = count;
        floatingCountElement.style.display = count > 0 ? 'flex' : 'none';
    }
    
    // Update navbar cart count
    const navCountElement = document.getElementById('nav-cart-count');
    if (navCountElement) {
        const count = cartItemCount();
        navCountElement.textContent = count;
        navCountElement.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Helper: parse numeric price from strings like "₹400/kg"
function parsePrice(text) {
    const m = String(text || '').replace(/,/g, '').match(/(\d+(\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
}

// Helper: parse unit from strings like "₹400/kg"
function parseUnit(text) {
    const t = String(text || '').toLowerCase();
    if (t.includes('/kg')) return 'kg';
    if (t.includes('/g')) return 'g';
    if (t.includes('/piece')) return 'piece';
    if (t.includes('/pic')) return 'piece';
    if (t.includes('/liter')) return 'liter';
    if (t.includes('/l')) return 'liter';
    return 'unit';
}

// UI enhancer: make items clickable to open product detail page
document.addEventListener('DOMContentLoaded', function () {
    // Update cart count on load
    updateCartCount();
    
    const items = document.querySelectorAll('.sweet-item');
    items.forEach((el) => {
        const name = el.dataset.name || el.querySelector('.sweet-name')?.textContent?.trim() || 'Item';
        const priceText = el.dataset.price || el.querySelector('.sweet-price')?.textContent?.trim() || '';
        const price = parsePrice(priceText);
        const unit = parseUnit(priceText);
        
        // Get image src
        let imgSrc = '';
        const imgEl = el.querySelector('.sweet-photo');
        if (imgEl) imgSrc = imgEl.src;

        // Make item clickable to open product detail page
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
            const params = new URLSearchParams({
                name,
                priceText,
                price,
                unit,
                imgSrc
            });
            window.location.href = 'product-detail.html?' + params.toString();
        });
    });
});
