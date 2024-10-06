let openShopping = document.querySelector('.shopping');
let closeShopping = document.querySelector('.closeShopping');
let list = document.querySelector('.list');
let listCard = document.querySelector('.listCard');
let body = document.querySelector('body');
let total = document.querySelector('.total');
let quantity = document.querySelector('.quantity');

// Lista de productos
let products = [
    { id: 1, name: 'Verduras Frescas De Pollo', image: '1.PNG', price: 60000 },
    { id: 2, name: 'Pollo A La Parrilla', image: '3.PNG', price: 65000 },
    { id: 3, name: 'Pastas Carbonara', image: '2.PNG', price: 50000 },
    { id: 4, name: 'Pastas De Pollo', image: '4.PNG', price: 45000 },
    { id: 5, name: 'Huevo Cocido Y Pan', image: '5.PNG', price: 30000 },
    { id: 6, name: 'Plato De Inmunidad', image: '6.PNG', price: 45000 }
];

// Carrito de compras
let listCards = [];

function initApp() {
    products.forEach((product, index) => {
        let newDiv = document.createElement('div');
        newDiv.classList.add('item');
        newDiv.innerHTML = `
            <img src="image/${product.image}">
            <div class="title">${product.name}</div>
            <div class="price">$${product.price.toLocaleString()}</div>
            <button onclick="addToCard(${index})">Agregar</button>`;
        list.appendChild(newDiv);
    });
}

initApp();

// Añadir producto al carrito
function addToCard(index) {
    let product = products[index];
    let foundIndex = listCards.findIndex(item => item.id === product.id);
    if (foundIndex === -1) {
        listCards.push({ ...product, quantity: 1 });
    } else {
        listCards[foundIndex].quantity++;
    }
    localStorage.setItem("carrito", JSON.stringify(listCards));
    reloadCard();
}

// Actualizar la visualización del carrito
function reloadCard() {
    listCard.innerHTML = '';
    let totalPrice = 0;
    listCards.forEach((item, index) => {
        totalPrice += item.price * item.quantity;
        let newDiv = document.createElement('li');
        newDiv.innerHTML = `
            <div><img src="image/${item.image}" alt="${item.name}"/></div>
            <div>${item.name}</div>
            <div>$${(item.price * item.quantity).toLocaleString()}</div>
            <div>
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
            </div>`;
        listCard.appendChild(newDiv);
    });
    total.innerText = `Total: $${totalPrice.toLocaleString()}`;
    quantity.innerText = listCards.reduce((acc, item) => acc + item.quantity, 0);
}

// Cambiar cantidad de un producto en el carrito
function changeQuantity(index, change) {
    if (listCards[index].quantity + change > 0) {
        listCards[index].quantity += change;
    } else {
        listCards.splice(index, 1);
    }
    localStorage.setItem("carrito", JSON.stringify(listCards));
    reloadCard();
}

openShopping.addEventListener('click', () => {
    body.classList.add('active');
});

closeShopping.addEventListener('click', () => {
    body.classList.remove('active');
});

// Integración de PayPal
paypal.Buttons({
    createOrder: function(data, actions) {
        const carrito = JSON.parse(localStorage.getItem("carrito"));

        if (carrito.length === 0) {
            alert("No hay productos en el carrito. Agrega algunos artículos antes de realizar el pago.");
            return; // Salir de la función sin crear la orden
        }
        let totalAmount = carrito.reduce((acc, item) => acc + item.price * item.quantity, 0); // Ajusta el valor a formato moneda
        const tasaCambio = obtenerTasaCambio();
        const totalConvertido = (totalAmount * tasaCambio / 1000).toFixed(2); // Redondear a dos decimales

        return actions.order.create({
            purchase_units: [{
                amount: {
                    currency_code: "MXN", 
                    value: totalConvertido
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert('Transacción completada por ' + details.payer.name.given_name);
        });
    },
})
.render('#paypal-button-container');

window.addEventListener("load", initApp);
