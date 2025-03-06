let cart = [];

// Load cart from server on page load
window.onload = async function() {
    await loadCart();
    updateCartDisplay();
    // Start dynamic updates for time
    setInterval(updateTime, 60000); // Update every minute
    setInterval(updateCartTimes, 60000); // Update cart times every minute
};

// Load cart from server
async function loadCart() {
    try {
        const response = await fetch('/.netlify/functions/api/get_cart', {
            method: 'GET'
        });
        const result = await response.json();
        if (result.cart) {
            cart = result.cart;
        }
    } catch (error) {
        document.getElementById('status').innerHTML = `Error loading cart: ${error.message}`;
    }
}

// Save cart to server
async function saveCart() {
    try {
        const response = await fetch('/.netlify/functions/api/save_cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart })
        });
        const result = await response.json();
        if (!response.ok) {
            document.getElementById('status').innerHTML = `Error saving cart: ${result.error}`;
        }
    } catch (error) {
        document.getElementById('status').innerHTML = `Error saving cart: ${error.message}`;
    }
}

// Convert time to IST
async function convertToIST() {
    const country = document.getElementById('countrySelect').value;
    const localTimeDisplay = document.getElementById('localTime');
    const istTimeDisplay = document.getElementById('istTime');
    const status = document.getElementById('status');

    if (!country) {
        status.innerHTML = 'Please select a country';
        return;
    }

    status.innerHTML = 'Fetching time...';

    try {
        const response = await fetch('/.netlify/functions/api/convert_time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country })
        });

        const result = await response.json();

        if (response.ok) {
            localTimeDisplay.innerHTML = `Local Time: ${result.local_time}`;
            istTimeDisplay.innerHTML = `Converted IST Time: ${result.ist_time}`;
        } else {
            status.innerHTML = result.error;
        }
    } catch (error) {
        status.innerHTML = `Error fetching time: ${error.message}`;
    }
}

// Add selected country and time to cart
async function addToCart() {
    const country = document.getElementById('countrySelect').value;
    const localTime = document.getElementById('localTime').innerHTML.split('Local Time: ')[1];
    const istTime = document.getElementById('istTime').innerHTML.split('Converted IST Time: ')[1];
    const status = document.getElementById('status');

    if (!country) {
        status.innerHTML = 'Please select a country';
        return;
    }
    if (!localTime || !istTime) {
        status.innerHTML = 'Please convert the time first';
        return;
    }

    // Store the original local time and country for dynamic updates
    cart.push({ country, localTime, istTime });
    await saveCart();
    updateCartDisplay();
    status.innerHTML = `${country} added to cart`;
}

// Update cart display
function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = '';

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${item.country}: ${item.localTime}</span>
            <span>Indian Time: ${item.istTime} IST</span>
            <button onclick="removeFromCart(${index})">Delete</button>
        `;
        cartItemsDiv.appendChild(cartItem);
    });
}

// Remove item from cart
async function removeFromCart(index) {
    cart.splice(index, 1);
    await saveCart();
    updateCartDisplay();
}

// Update time dynamically every minute
async function updateTime() {
    const country = document.getElementById('countrySelect').value;
    if (!country) return; // No country selected

    const localTimeDisplay = document.getElementById('localTime');
    const istTimeDisplay = document.getElementById('istTime');

    try {
        const response = await fetch('/.netlify/functions/api/convert_time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country })
        });

        const result = await response.json();

        if (response.ok) {
            localTimeDisplay.innerHTML = `Local Time: ${result.local_time}`;
            istTimeDisplay.innerHTML = `Converted IST Time: ${result.ist_time}`;
        }
    } catch (error) {
        console.error('Error updating time:', error);
    }
}

// Update cart times dynamically every minute
async function updateCartTimes() {
    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        try {
            const response = await fetch('/.netlify/functions/api/convert_time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country: item.country })
            });

            const result = await response.json();

            if (response.ok) {
                // Update both the local time and IST time for the cart item
                cart[i].localTime = result.local_time; // Update local time
                cart[i].istTime = result.ist_time;     // Update IST time
            }
        } catch (error) {
            console.error(`Error updating time for ${item.country}:`, error);
        }
    }
    await saveCart();
    updateCartDisplay();
}