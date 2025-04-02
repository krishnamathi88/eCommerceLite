async function loadProducts() {
  const response = await fetch('products.json');
  return await response.json();
}

async function searchProductInJson(productName) {
    try {
        // Fetch the JSON file
        const response = await fetch("products.json?cache-bust=" + Date.now());
        if (!response.ok) {
            console.error("Failed to fetch products.json:", response.status, response.statusText);
            throw new Error("Failed to fetch the products.json file");
        }

        // Parse the JSON data
        const products = await response.json();
        console.log("Parsed Products:", products); // Debugging

        // Filter matching products
        const matchingProducts = products.filter(product =>
            product.Product && product.Product.toLowerCase().includes(productName.toLowerCase())
        );

        // Display results
        if (matchingProducts.length > 0) {
            appendMessage("bot", `Found ${matchingProducts.length} matching product(s):`);
            matchingProducts.forEach((product, index) => {
                appendMessage(
                    "bot",
                    `Product ${index + 1}:\n` +
                    `  - Product Name: ${product.Product || "N/A"}\n` +
                    `  - Price: ${product.Price || "N/A"}\n` +
                    `  - Availability: ${product.Availability || "Unknown"}`
                );
            });

            // Ask the user to select a product if more than one is found
            if (matchingProducts.length > 1) {
                appendMessage("bot", "Please select a product by entering its number:");
                waitForProductSelection(matchingProducts);
            } else {
                // If only one product is found, proceed to quantity input
                appendMessage("bot", "How many do you want to buy?");
                createQuantityInput(matchingProducts[0]); // Pass the first matching product
            }
        } else {
            appendMessage("bot", `No products found matching "${productName}".`);
        }
    } catch (error) {
        console.error("Error fetching or processing JSON file:", error);
        appendMessage("bot", "Unable to fetch the product data. Please try again later.");
    }
}

function waitForProductSelection(matchingProducts) {
    const chatBox = document.getElementById("chat-box");
    const inputDiv = document.createElement("div");
    inputDiv.classList.add("message", "user");

    const inputField = document.createElement("input");
    inputField.type = "number";
    inputField.placeholder = "Enter product number";
    inputField.style.marginRight = "10px";

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";

    inputDiv.appendChild(inputField);
    inputDiv.appendChild(submitButton);
    chatBox.appendChild(inputDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Handle product selection
    submitButton.addEventListener("click", () => {
        const selectedIndex = parseInt(inputField.value, 10) - 1; // Convert to zero-based index
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= matchingProducts.length) {
            appendMessage("bot", "Please enter a valid product number.");
        } else {
            const selectedProduct = matchingProducts[selectedIndex];
            appendMessage("user", `Product ${selectedIndex + 1} selected: ${selectedProduct.Product}`);
            appendMessage("bot", "How many do you want to buy?");
            createQuantityInput(selectedProduct); // Pass the selected product
            inputDiv.remove(); // Remove the input field after selection
        }
    });
}