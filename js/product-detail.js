document.addEventListener('DOMContentLoaded', function () {
    // Get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name') || 'Sweets';
    const priceText = urlParams.get('priceText') || '₹0';
    const price = parseFloat(urlParams.get('price')) || 0;
    const unit = urlParams.get('unit') || 'kg';
    const imgSrc = urlParams.get('imgSrc') || '';
    
    // Populate product details
    document.getElementById('product-name').textContent = name;
    document.getElementById('product-price').textContent = priceText;
    
    const productImg = document.getElementById('product-img');
    if (productImg) {
        productImg.src = imgSrc;
        productImg.alt = name;
    }
    
    const breadcrumbName = document.getElementById('breadcrumb-product-name');
    if (breadcrumbName) {
        breadcrumbName.textContent = name;
    }
    
    // Elements
    const weightInput = document.getElementById('weight-input');
    const calculatedPriceEl = document.getElementById('calculated-price');
    const presetPills = document.querySelectorAll('.preset-pill');
    const qtyMinusBtn = document.getElementById('qty-minus');
    const qtyPlusBtn = document.getElementById('qty-plus');
    
    // Calculate and update custom price
    function updateCalculatedPrice() {
        const grams = parseInt(weightInput.value) || 0;
        const calculatedPrice = (price / 1000) * grams;
        calculatedPriceEl.textContent = '₹' + Math.round(calculatedPrice);
        
        // Sync active pill state
        presetPills.forEach(pill => {
            const pillWeight = parseInt(pill.getAttribute('data-weight'));
            if (pillWeight === grams) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    }
    
    // Initialize price
    updateCalculatedPrice();
    
    // Input listener
    weightInput.addEventListener('input', function() {
        if (parseInt(weightInput.value) < 0) {
            weightInput.value = 0;
        }
        updateCalculatedPrice();
    });
    
    // Preset Pill Click handlers
    presetPills.forEach(pill => {
        pill.addEventListener('click', function() {
            const weight = parseInt(this.getAttribute('data-weight'));
            weightInput.value = weight;
            updateCalculatedPrice();
            
            // Add subtle click scale transition
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
    
    // Quantity Plus/Minus Step triggers
    if (qtyMinusBtn && qtyPlusBtn) {
        qtyMinusBtn.addEventListener('click', function() {
            let currentVal = parseInt(weightInput.value) || 0;
            if (currentVal > 0) {
                weightInput.value = currentVal - 1;
                updateCalculatedPrice();
            }
        });
        
        qtyPlusBtn.addEventListener('click', function() {
            let currentVal = parseInt(weightInput.value) || 0;
            weightInput.value = currentVal + 1;
            updateCalculatedPrice();
        });
    }
    
    // Show Premium Toast Notification
    function showToast(productName, grams) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        
        const displayWeight = grams >= 1000 ? (grams / 1000) + ' kg' : grams + ' g';
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">Added to Cart</div>
                <div class="toast-msg">${productName} (${displayWeight}) added successfully!</div>
            </div>
            <button class="toast-close" aria-label="Close message">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Close event
        toast.querySelector('.toast-close').addEventListener('click', function() {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        });
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('hide');
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }
    
    // Add custom weight to cart
    document.getElementById('custom-add-btn').addEventListener('click', function(e) {
        // Add pulse scale to add-to-cart button
        this.style.transform = 'scale(0.97)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
        
        const grams = parseInt(weightInput.value) || 0;
        if (grams <= 0) {
            alert('Please enter a valid weight');
            return;
        }
        
        const calculatedPrice = (price / 1000) * grams;
        const id = (name + '_' + price + '_' + grams + 'g').toLowerCase().replace(/\s+/g, '-');
        
        const formattedWeightText = grams >= 1000 ? (grams/1000) + 'kg' : grams + 'g';
        
        if (typeof addToCart === 'function') {
            addToCart({
                id,
                name: name + ' (' + formattedWeightText + ')',
                price: calculatedPrice,
                pricePerUnit: price,
                unit,
                weight: grams,
                qty: 1
            });
        }
        
        // Trigger premium notification toast
        showToast(name, grams);
    });
});