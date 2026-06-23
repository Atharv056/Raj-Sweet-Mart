document.addEventListener('DOMContentLoaded', function () {
    // Get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const priceText = urlParams.get('priceText');
    const price = parseFloat(urlParams.get('price'));
    const unit = urlParams.get('unit');
    const imgSrc = urlParams.get('imgSrc');
    
    // Populate product details
    document.getElementById('product-name').textContent = name;
    document.getElementById('product-price').textContent = priceText;
    document.getElementById('product-img').src = imgSrc;
    
    // Calculate and update custom price
    const weightInput = document.getElementById('weight-input');
    const calculatedPriceEl = document.getElementById('calculated-price');
    
    function updateCalculatedPrice() {
        const grams = parseInt(weightInput.value) || 0;
        const calculatedPrice = (price / 1000) * grams;
        calculatedPriceEl.textContent = '₹' + calculatedPrice.toFixed(2);
    }
    
    updateCalculatedPrice();
    weightInput.addEventListener('input', updateCalculatedPrice);
    
    // Add pulse animation to buttons
    function addButtonAnimation(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }
    
    // Quick add 1kg to cart
    document.getElementById('quick-add-btn').addEventListener('click', function(e) {
        addButtonAnimation(e.currentTarget);
        const id = (name + '_' + price + '_1000g').toLowerCase().replace(/\s+/g, '-');
        addToCart({
            id,
            name,
            price,
            pricePerUnit: price,
            unit,
            weight: 1000,
            qty: 1
        });
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i>${name} (1kg) added to cart!`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 1500);
    });
    
    // Add custom weight to cart
    document.getElementById('custom-add-btn').addEventListener('click', function(e) {
        addButtonAnimation(e.currentTarget);
        const grams = parseInt(weightInput.value) || 0;
        if (grams <= 0) {
            alert('Please enter a valid weight');
            return;
        }
        
        const calculatedPrice = (price / 1000) * grams;
        const id = (name + '_' + price + '_' + grams + 'g').toLowerCase().replace(/\s+/g, '-');
        
        addToCart({
            id,
            name: name + ' (' + grams + 'g)',
            price: calculatedPrice,
            pricePerUnit: price,
            unit,
            weight: grams,
            qty: 1
        });
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i>${name} (${grams}g) added to cart!`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 1500);
    });
});