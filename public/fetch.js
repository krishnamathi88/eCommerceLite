document.addEventListener('DOMContentLoaded', function() {
    const productSearch = document.getElementById('product-search');
    const searchButton = document.getElementById('search-button');
    const chatBox = document.getElementById('chat-box');
    let productsData = [];
    let currentOrder = [];

    // Initialize chat
    appendMessage('bot', 'Welcome to Tra! 🛒<br>What would you like to buy today?');
    loadProducts();

    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = message;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function loadProducts() {
        try {
            const response = await fetch('products.json?' + Date.now());
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            productsData = await response.json();
        } catch (error) {
            console.error('Error loading products:', error);
            appendMessage('bot', '⚠️ Temporary issue loading products. Please refresh.');
        }
    }

    function handleSearch() {
        const searchTerm = productSearch.value.trim();
        if (!searchTerm) {
            appendMessage('bot', 'Please enter a product name');
            return;
        }
        
        // Special case for Nescafe
        if (searchTerm.toLowerCase().includes('nescafe')) {
            handleNescafeSearch();
            return;
        }
        
        appendMessage('user', `Search: ${searchTerm}`);
        productSearch.value = '';
        
        if (productsData.length === 0) {
            appendMessage('bot', 'Loading products... please wait');
            loadProducts().then(() => searchProducts(searchTerm));
        } else {
            searchProducts(searchTerm);
        }
    }

    function handleNescafeSearch() {
        appendMessage('bot', 'Sorry, Nescafé products are not currently available.');
        showCoffeeAlternatives();
    }

    function showCoffeeAlternatives() {
        const alternatives = productsData.filter(p => 
            p.category === 'coffee' && !p.name.toLowerCase().includes('nescafe')
        ).slice(0, 3);

        if (alternatives.length > 0) {
            appendMessage('bot', 'You might like these coffee alternatives:');
            showProducts(alternatives);
        } else {
            appendMessage('bot', 'You might like these popular items instead:');
            showPopularItems();
        }
    }

    function showPopularItems() {
        const popularItems = productsData
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 3);
        showProducts(popularItems);
    }

    function searchProducts(searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = productsData.filter(p => 
            p.name.toLowerCase().includes(term)
        );

        if (matches.length === 0) {
            appendMessage('bot', `No products found matching "${searchTerm}"`);
            showSearchOptions();
            return;
        }

        showProducts(matches);
    }

    function showProducts(products) {
        let html = `Found ${products.length} item(s):<br><br>`;
        
        products.forEach((p, i) => {
            const stockStatus = p.stock > 0 
                ? `<span class="in-stock">(${p.stock} in stock)</span>` 
                : `<span class="out-of-stock">(Out of stock)</span>`;
            
            html += `
                <div class="product-item">
                    <b>${i+1}. ${p.name}</b><br>
                    ₹${p.price.toFixed(2)} ${stockStatus}
                </div>
            `;
        });

        appendMessage('bot', html);

        if (products.length === 1) {
            products[0].stock > 0 
                ? askQuantity(products[0]) 
                : showOutOfStock(products[0]);
        } else {
            askProductSelection(products);
        }
    }

    // NEW: Missing function added here
    function askProductSelection(products) {
        appendMessage('bot', 'Please enter the number of the product you want:');
        
        const div = document.createElement('div');
        div.className = 'message user-input';
        div.innerHTML = `
            <input type="number" min="1" max="${products.length}" 
                   placeholder="1-${products.length}">
            <button>Select</button>
        `;
        
        chatBox.appendChild(div);
        div.querySelector('button').addEventListener('click', () => {
            const selection = parseInt(div.querySelector('input').value) - 1;
            if (isNaN(selection) || selection < 0 || selection >= products.length) {
                appendMessage('bot', `Please enter a number between 1 and ${products.length}`);
                return;
            }
            
            const selectedProduct = products[selection];
            div.remove();
            
            if (selectedProduct.stock > 0) {
                askQuantity(selectedProduct);
            } else {
                showOutOfStock(selectedProduct);
            }
        });
    }

    function showOutOfStock(product) {
        appendMessage('bot', `Sorry, ${product.name} is currently out of stock.`);
        showSearchOptions();
    }

    function askQuantity(product) {
        appendMessage('bot', `How many ${product.name}? (Max: ${product.stock})`);
        
        const div = document.createElement('div');
        div.className = 'message user-input';
        div.innerHTML = `
            <input type="number" min="1" max="${product.stock}" 
                   placeholder="1-${product.stock}">
            <button>Add to Cart</button>
        `;
        
        chatBox.appendChild(div);
        div.querySelector('button').addEventListener('click', () => {
            const qty = parseInt(div.querySelector('input').value);
            if (qty > 0 && qty <= product.stock) {
                addToCart(product, qty);
                div.remove();
            } else {
                appendMessage('bot', `Please enter 1-${product.stock}`);
            }
        });
    }

    function addToCart(product, qty) {
        currentOrder.push({...product, qty});
        appendMessage('user', `Added ${qty} × ${product.name}`);
        appendMessage('bot', `✅ Added to cart!<br>${qty} × ${product.name} - ₹${(product.price*qty).toFixed(2)}`);
        askToBuyMore();
    }

    function askToBuyMore() {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'message bot-options';
        optionsDiv.innerHTML = `
            <p>Do you want to buy more products?</p>
            <div class="checkbox-group">
                <label class="checkbox-option">
                    <input type="checkbox" class="yes-checkbox">
                    <span class="checkmark"></span>
                    Yes
                </label>
                <label class="checkbox-option">
                    <input type="checkbox" class="no-checkbox">
                    <span class="checkmark"></span>
                    No
                </label>
            </div>
            <button class="submit-btn">Continue</button>
        `;

        chatBox.appendChild(optionsDiv);
        
        // Single selection logic
        const checkboxes = optionsDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    checkboxes.forEach(cb => {
                        if (cb !== this) cb.checked = false;
                    });
                }
            });
        });

        optionsDiv.querySelector('.submit-btn').addEventListener('click', function() {
            const yesChecked = optionsDiv.querySelector('.yes-checkbox').checked;
            const noChecked = optionsDiv.querySelector('.no-checkbox').checked;
            
            if (!yesChecked && !noChecked) {
                appendMessage('bot', 'Please select an option');
                return;
            }
            
            optionsDiv.remove();
            
            if (yesChecked) {
                appendMessage('user', 'Yes, continue shopping');
                appendMessage('bot', 'What else would you like to buy?');
                productSearch.focus();
            } else {
                appendMessage('user', 'No, finish shopping');
                if (currentOrder.length > 0) {
                    showCartOptions();
                } else {
                    endSession();
                }
            }
        });
    }

    function showSearchOptions() {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'message bot-options';
        optionsDiv.innerHTML = `
            <p>Would you like to:</p>
            <div class="checkbox-group">
                <label class="checkbox-option">
                    <input type="checkbox" class="search-again">
                    <span class="checkmark"></span>
                    Search again
                </label>
                <label class="checkbox-option">
                    <input type="checkbox" class="view-cart">
                    <span class="checkmark"></span>
                    View cart (${currentOrder.length})
                </label>
            </div>
            <button class="submit-btn">Continue</button>
        `;

        chatBox.appendChild(optionsDiv);
        
        // Single selection logic
        const checkboxes = optionsDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    checkboxes.forEach(cb => {
                        if (cb !== this) cb.checked = false;
                    });
                }
            });
        });

        optionsDiv.querySelector('.submit-btn').addEventListener('click', function() {
            const searchAgain = optionsDiv.querySelector('.search-again').checked;
            const viewCart = optionsDiv.querySelector('.view-cart').checked;
            
            if (!searchAgain && !viewCart) {
                appendMessage('bot', 'Please select an option');
                return;
            }
            
            optionsDiv.remove();
            
            if (searchAgain) {
                appendMessage('user', 'Search again');
                appendMessage('bot', 'What product would you like to search for?');
                productSearch.focus();
            } else {
                if (currentOrder.length > 0) {
                    showCartOptions();
                } else {
                    appendMessage('bot', 'Your cart is empty');
                    appendMessage('bot', 'What product would you like to search for?');
                    productSearch.focus();
                }
            }
        });
    }

    function showCartOptions() {
        let summary = '<b>Your Cart:</b><br><br>';
        let total = 0;
        
        currentOrder.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            summary += `${item.qty} × ${item.name} = ₹${itemTotal.toFixed(2)}<br>`;
        });
        
        summary += `<br><b>Total: ₹${total.toFixed(2)}</b>`;
        appendMessage('bot', summary);
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'message bot-options';
        optionsDiv.innerHTML = `
            <p>What would you like to do?</p>
            <div class="checkbox-group">
                <label class="checkbox-option">
                    <input type="checkbox" class="keep-shopping">
                    <span class="checkmark"></span>
                    Keep Shopping
                </label>
                <label class="checkbox-option">
                    <input type="checkbox" class="checkout">
                    <span class="checkmark"></span>
                    Proceed to Payment
                </label>
            </div>
            <button class="submit-btn">Continue</button>
        `;
        
        chatBox.appendChild(optionsDiv);
        
        // Single selection logic
        const checkboxes = optionsDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    checkboxes.forEach(cb => {
                        if (cb !== this) cb.checked = false;
                    });
                }
            });
        });

        optionsDiv.querySelector('.submit-btn').addEventListener('click', function() {
            const keepShopping = optionsDiv.querySelector('.keep-shopping').checked;
            const checkout = optionsDiv.querySelector('.checkout').checked;
            
            if (!keepShopping && !checkout) {
                appendMessage('bot', 'Please select an option');
                return;
            }
            
            optionsDiv.remove();
            
            if (keepShopping) {
                appendMessage('user', 'Keep shopping');
                appendMessage('bot', 'What else would you like to buy?');
                productSearch.focus();
            } else {
                processCheckout();
            }
        });
    }

    function processCheckout() {
        appendMessage('bot', '🎉 Order placed successfully!<br>Your items will be delivered soon.');
        appendMessage('bot', 'Thank you for shopping with us!');
        endSession();
    }

    function endSession() {
        productSearch.disabled = true;
        searchButton.disabled = true;
    }

    // Event listeners
    searchButton.addEventListener('click', handleSearch);
    productSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleSearch();
    });
    productSearch.focus();
});
