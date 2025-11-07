    document.addEventListener('DOMContentLoaded', () => {

       // --- LÓGICA PARA LAS COOKIES ---
  const cookieCart = {}; // Objeto para guardar la cantidad de cada cookie
  const totalCountEl = document.getElementById('cookie-total-count');
  const totalPriceEl = document.getElementById('cookie-total-price');

  const PRICE_INDIVIDUAL = 1200;
  const PRICE_PACK_5 = 5000;
  const PRICE_PACK_10 = 9000;

  // Función para calcular el precio total con descuentos
  function calculateTotalPrice(totalCookies) {
    if (totalCookies === 0) return 0;

    let packsOfTen = Math.floor(totalCookies / 10);
    let remainingAfterTens = totalCookies % 10;

    let packsOfFive = Math.floor(remainingAfterTens / 5);
    let remainingSingles = remainingAfterTens % 5;

    // Lógica especial: si quedan 4 o menos, pero el total era de 5 a 9, el pack de 5 ya se cobró.
    // Esta lógica es más simple:
    let total = (packsOfTen * PRICE_PACK_10) + (packsOfFive * PRICE_PACK_5) + (remainingSingles * PRICE_INDIVIDUAL);
    return total;
  }
  
  // Función central para actualizar la UI
  function updateCartAndUI() {
    let totalCookies = 0;
    // Sumar todas las cookies del carrito
    for (const cookieId in cookieCart) {
      totalCookies += cookieCart[cookieId];
    }
    
    const totalPrice = calculateTotalPrice(totalCookies);

    totalCountEl.textContent = totalCookies;
    totalPriceEl.textContent = totalPrice;
  }

  // Configurar cada tarjeta de cookie
  document.querySelectorAll('.cookie-card').forEach(card => {
    const cookieId = card.dataset.cookieId;
    cookieCart[cookieId] = 0; // Inicializar cantidad en 0

    const quantityEl = card.querySelector('.cookie-quantity');
    const btnAdd = card.querySelector('.btn-add');
    const btnRemove = card.querySelector('.btn-remove');

    btnAdd.addEventListener('click', () => {
      cookieCart[cookieId]++;
      quantityEl.textContent = cookieCart[cookieId];
      updateCartAndUI();
    });

    btnRemove.addEventListener('click', () => {
      if (cookieCart[cookieId] > 0) {
        cookieCart[cookieId]--;
        quantityEl.textContent = cookieCart[cookieId];
        updateCartAndUI();
      }
    });
  });

      // Lógica para los BUDINES
      function updateBudinPrice(budinCard) {
        const sizeSelect = budinCard.querySelector('.budin-size');
        const selectedSizeOption = sizeSelect.options[sizeSelect.selectedIndex];
        let currentPrice = parseFloat(selectedSizeOption.dataset.price);

        const toppingCheckboxes = budinCard.querySelectorAll('.budin-toppings input:checked');
        toppingCheckboxes.forEach(checkbox => {
          currentPrice += parseFloat(checkbox.dataset.toppingPrice);
        });

        budinCard.querySelector('.calculated-price').textContent = currentPrice;
      }

      document.querySelectorAll('.budin-card').forEach(card => {
        const inputs = card.querySelectorAll('select, input[type="checkbox"]');
        inputs.forEach(input => {
          input.addEventListener('change', () => updateBudinPrice(card));
        });
        // Inicializar precio al cargar
        updateBudinPrice(card);
      });
    });
