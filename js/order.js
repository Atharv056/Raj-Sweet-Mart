document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('payBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
        var name = document.getElementById('customerName').value.trim();
        var phone = document.getElementById('customerPhone').value.trim();
        var amountInput = document.getElementById('orderAmount').value.trim();
        var amount = parseInt(amountInput, 10);
        if (!name || !phone || !amount || amount <= 0) {
            alert('Please enter valid name, phone and amount.');
            return;
        }
        if (phone.length < 10) {
            alert('Please enter a valid phone number.');
            return;
        }
        if (typeof Razorpay === 'undefined') {
            alert('Payment gateway is not available.');
            return;
        }
        var keyId = localStorage.getItem('razorpay_key_id') || '';
        var options = {
            key: keyId,
            amount: amount * 100,
            currency: 'INR',
            name: 'Raj Sweet Mart',
            description: 'Order Payment',
            prefill: {
                name: name,
                contact: phone
            },
            theme: {
                color: '#d35400'
            },
            handler: function (response) {
                alert('Payment successful. ID: ' + response.razorpay_payment_id);
            }
        };
        if (!options.key) {
            alert('Razorpay key is not set. Add it in localStorage as "razorpay_key_id".');
            return;
        }
        var rzp = new Razorpay(options);
        rzp.open();
    });
});
