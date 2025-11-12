document.addEventListener('DOMContentLoaded', () => {

  // --- El "Cerebro" de nuestro carrito ---
  // Guardará todos los productos que el cliente añada.
  const carrito = {};

  // --- Precios especiales por niveles ---
   const PRECIOS = {
    cookies: { individual: 1200, pack5: 5000, pack10: 9000 },
    'alfajor': { 1: 800, 6: 4500, 12: 7800 },
    brownie: { 1: 1500, 6: 8000 }
  };

  // --- Elementos del DOM para el Carrito Flotante ---
const carritoResumenEl = document.getElementById('carrito-resumen');
  const carritoItemsEl = document.getElementById('carrito-items');
  const carritoTotalPrecioEl = document.getElementById('carrito-total-precio');
  const btnEnviarPedido = document.getElementById('btn-enviar-pedido');

 // --- FUNCIONES DE CÁLCULO DE PRECIOS ---
  function calcularPrecioPorNiveles(cantidad, preciosNivel) {
    let total = 0;
    const niveles = Object.keys(preciosNivel).map(Number).sort((a, b) => b - a); // [12, 6, 1]
    
    let cantidadRestante = cantidad;
    for (const nivel of niveles) {
      const cantidadEnNivel = Math.floor(cantidadRestante / nivel);
      if (cantidadEnNivel > 0) {
        total += cantidadEnNivel * preciosNivel[nivel];
        cantidadRestante %= nivel;
      }
    }
    return total;
  }

  function calcularPrecioCookies(cantidad) {
    let total = 0;
    let packs10 = Math.floor(cantidad / 10);
    let remanente = cantidad % 10;
    let packs5 = Math.floor(remanente / 5);
    let individuales = remanente % 5;
    total = (packs10 * PRECIOS.cookies.pack10) + (packs5 * PRECIOS.cookies.pack5) + (individuales * PRECIOS.cookies.individual);
    return total;
  }

  // --- FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN ---
  function actualizarCarritoUI() {
    carritoItemsEl.innerHTML = '';
    let granTotal = 0;
    const agrupadoPorCategoria = {};

    // Agrupar items por categoría
    for (const id in carrito) {
      const item = carrito[id];
      if (item.cantidad > 0) {
        if (!agrupadoPorCategoria[item.categoria]) {
          agrupadoPorCategoria[item.categoria] = [];
        }
        agrupadoPorCategoria[item.categoria].push(item);
      }
    }
    
    // Renderizar cada categoría en el carrito
    for (const categoria in agrupadoPorCategoria) {
      const items = agrupadoPorCategoria[categoria];
      let cantidadTotalCategoria = 0;
      let precioTotalCategoria = 0;

      // Calcular totales de la categoría y aplicar lógicas de precio
      if (categoria === 'Cookies') {
        cantidadTotalCategoria = items.reduce((sum, item) => sum + item.cantidad, 0);
        precioTotalCategoria = calcularPrecioCookies(cantidadTotalCategoria);
      } else if (categoria === 'Alfajores') {
        // Nueva lógica para Alfajores: sumar todos primero
        cantidadTotalCategoria = items.reduce((sum, item) => sum + item.cantidad, 0);
        precioTotalCategoria = calcularPrecioPorNiveles(cantidadTotalCategoria, PRECIOS['alfajor']);
      } else if (categoria === 'Brownies') {
        //logica brownies
        const porTipo = {};
        items.forEach(item => {
          if (!porTipo[item.tipoPrecio]) porTipo[item.tipoPrecio] = 0;
          porTipo[item.tipoPrecio] += item.cantidad;
        });
        for (const tipo in porTipo) {
            cantidadTotalCategoria += porTipo[tipo];
            precioTotalCategoria += calcularPrecioPorNiveles(porTipo[tipo], PRECIOS[tipo]);
        }
      } else { // Budines, Scones, Box
        items.forEach(item => {
          const cantidadReal = item.packSize ? item.cantidad * item.packSize : item.cantidad;
          cantidadTotalCategoria += cantidadReal;
          precioTotalCategoria += item.cantidad * item.precio;
        });
      }
      
      granTotal += precioTotalCategoria;

      // Crear HTML para la categoría
      const liCategoria = document.createElement('li');
      liCategoria.className = 'carrito-categoria-item';
      
      liCategoria.innerHTML = `
        <div class="categoria-summary">
          <span class="categoria-nombre">${items.reduce((sum, item) => sum + item.cantidad, 0)}x ${categoria}</span>
          <strong class="categoria-precio">$${precioTotalCategoria}</strong>
          <button class="toggle-detalles">+ detalle</button>
        </div>
        
        <ul class="carrito-detalles">
          ${items.map(item => `<li>${item.cantidad}x ${item.nombre}</li>`).join('')}
        </ul>
      `;
      carritoItemsEl.appendChild(liCategoria);
    }

    carritoTotalPrecioEl.textContent = granTotal;
    carritoResumenEl.classList.toggle('oculto', granTotal === 0);
  }

  // Event listener para los botones "+ detalle"
  carritoItemsEl.addEventListener('click', function(e) {
    if (e.target.classList.contains('toggle-detalles')) {
      const detallesEl = e.target.closest('.carrito-categoria-item').querySelector('.carrito-detalles');
      detallesEl.classList.toggle('visible');
      e.target.textContent = detallesEl.classList.contains('visible') ? '- detalle' : '+ detalle';
    }
  });

  // --- INICIALIZACIÓN DE PRODUCTOS ---
  document.querySelectorAll('.producto-simple').forEach(card => {
    const productoId = card.dataset.productoId;
    const baseData = {
      nombre: card.dataset.nombre,
      categoria: card.dataset.categoria,
      precio: parseInt(card.dataset.precio) || 0,
      packSize: parseInt(card.dataset.packSize) || null,
      tipoPrecio: card.dataset.tipoPrecio || null,
      cantidad: 0
    };
    carrito[productoId] = baseData;

    const quantityEl = card.querySelector('.quantity');
    card.querySelector('.btn-add').addEventListener('click', () => {
      carrito[productoId].cantidad++;
      quantityEl.textContent = carrito[productoId].cantidad;
      actualizarCarritoUI();
    });
    card.querySelector('.btn-remove').addEventListener('click', () => {
      if (carrito[productoId].cantidad > 0) {
        carrito[productoId].cantidad--;
        quantityEl.textContent = carrito[productoId].cantidad;
        actualizarCarritoUI();
      }
    });
  });
  
  function calcularPrecioBudin(card) {
    const sizeSelect = card.querySelector('.budin-size');
    const selectedSizeOption = sizeSelect.options[sizeSelect.selectedIndex];
    let precio = parseFloat(selectedSizeOption.dataset.price);
    card.querySelectorAll('.budin-toppings input:checked').forEach(cb => {
      precio += parseFloat(cb.dataset.toppingPrice);
    });
    card.querySelector('.calculated-price').textContent = precio;
    return precio;
  }

  document.querySelectorAll('.budin-card').forEach(card => {
    // 1. Crear un 'name' único para el grupo de radio buttons de ESTA tarjeta
    const toppingGroupName = `topping-${card.dataset.productoId || Date.now()}`;
    
    // 2. Asignar ese 'name' único a todos los radio buttons dentro de la tarjeta
    card.querySelectorAll('.budin-toppings input[type="radio"]').forEach(radio => {
      radio.name = toppingGroupName;
    });

    card.querySelectorAll('select, input').forEach(input => input.addEventListener('change', () => calcularPrecioBudin(card)));
    
    card.querySelector('.btn-add-budin').addEventListener('click', () => {
      const size = card.querySelector('.budin-size').value;
      
      const toppingInput = card.querySelector('.budin-toppings input:checked');
      const toppingValue = toppingInput ? toppingInput.value : ''; // Obtenemos el valor
      
      const nombreCompleto = `${card.dataset.nombreBase} (${size})${toppingValue ? ' con ' + toppingValue : ''}`;
      const precioFinal = calcularPrecioBudin(card);
      const id = `budin-${Date.now()}`; // ID único por si añaden 2 budines iguales
      
      carrito[id] = { nombre: nombreCompleto, categoria: 'Budines', precio: precioFinal, cantidad: 1 };
      
      actualizarCarritoUI();
    });
    
    // 4. Calcular el precio inicial al cargar
    calcularPrecioBudin(card);
  });

  // --- LÓGICA PARA ENVIAR PEDIDO A WHATSAPP ---
  btnEnviarPedido.addEventListener('click', () => {

    alert("Estas a punto de hacer tu pedido! al continuar, vas a poder terminar de efectuar el pago y coordinar momento de entrega :) gracias ❤️");

    let mensaje = '¡Hola Tinas Bake! Quisiera hacer el siguiente pedido:\n\n';
    
    // 1. Obtener los items agrupados
    const itemsAgrupados = agruparItemsPorCategoria();
    
    // 2. Definir el orden y el formato de título (exacto como tu ejemplo)
    const categoriasOrdenadas = [
      { nombre: 'Cookies', titulo: 'Cookies:' },
      { nombre: 'Alfajores', titulo: 'Alfajores:' },
      { nombre: 'Brownies', titulo: 'Brownies' }, // Sin dos puntos
      { nombre: 'Scones', titulo: 'Scones:' },
      { nombre: 'Box', titulo: 'Box:' },
      { nombre: 'Budines', titulo: 'Budines' }  // Sin dos puntos
    ];

    // 3. Recorrer en el orden definido
    categoriasOrdenadas.forEach(cat => {
      const categoria = cat.nombre;
      const titulo = cat.titulo;
      
      // Solo si hay items de esta categoría en el carrito...
      if (itemsAgrupados[categoria] && itemsAgrupados[categoria].length > 0) {
        
        mensaje += `${titulo}\n`; // Añadir el título (ej: "Alfajores:")
        
        // Añadir cada item de esa categoría
        itemsAgrupados[categoria].forEach(item => {
          mensaje += `- ${item.cantidad}x ${item.nombre}\n`;
        });
        
        // Añadir un espacio antes de la próxima categoría
        mensaje += '\n'; 
      }
    });

    // 4. Obtener el total (ya está calculado en la UI)
    const granTotal = carritoTotalPrecioEl.textContent;

    // 5. Armar el mensaje final (exacto como tu ejemplo)
    mensaje += `Total estimado: $${granTotal} ¡Muchas gracias!`;

    // 6. Enviar a WhatsApp
    const numeroTelefono = '5492235503672'; 
    const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(urlWhatsApp, '_blank');
  });
  
  // Función helper para agrupar items, usada en el mensaje de Wpp
  function agruparItemsPorCategoria() {
      const agrupado = {};
      for (const id in carrito) {
          const item = carrito[id];
          if (item.cantidad > 0) {
              if (!agrupado[item.categoria]) agrupado[item.categoria] = [];
              agrupado[item.categoria].push(item);
          }
      }
      return agrupado;
  }
});