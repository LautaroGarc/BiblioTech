let allItems = [];
let currentItemType = null;
let editingItemId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    setupFilters();
    setupForms();
});

function setupFilters() {
    document.getElementById('itemTypeFilter').addEventListener('change', filterItems);
    document.getElementById('itemSearch').addEventListener('input', filterItems);
    document.getElementById('refreshItems').addEventListener('click', loadItems);
}

function setupForms() {
    document.getElementById('bookForm').addEventListener('submit', handleBookSubmit);
    document.getElementById('supplyForm').addEventListener('submit', handleSupplySubmit);
}

async function loadItems() {
    try {
        const container = document.getElementById('itemsContainer');
        container.innerHTML = '<div class="loading">Cargando items...</div>';

        console.log('[LOAD ITEMS] Iniciando carga...');
        console.log('[LOAD ITEMS] Cookies:', document.cookie);
        
        const [booksResponse, suppliesResponse] = await Promise.all([
            fetch('/api/books', {
                method: 'GET',
                credentials: 'include', // Envía cookies automáticamente
                headers: { 
                    'Content-Type': 'application/json'
                }
            }),
            fetch('/api/supplies', {
                method: 'GET',
                credentials: 'include', // Envía cookies automáticamente
                headers: { 
                    'Content-Type': 'application/json'
                }
            })
        ]);

        console.log('[LOAD ITEMS] Books response status:', booksResponse.status);
        console.log('[LOAD ITEMS] Supplies response status:', suppliesResponse.status);

        // Validar respuestas antes de parsear JSON
        if (!booksResponse.ok) {
            const errorText = await booksResponse.text();
            console.error('[LOAD ITEMS] Error en books:', booksResponse.status, errorText);
            if (booksResponse.status === 401 || booksResponse.status === 403) {
                window.location.href = '/login';
                return;
            }
            throw new Error(`Error al cargar libros: ${booksResponse.status}`);
        }

        if (!suppliesResponse.ok) {
            const errorText = await suppliesResponse.text();
            console.error('[LOAD ITEMS] Error en supplies:', suppliesResponse.status, errorText);
            if (suppliesResponse.status === 401 || suppliesResponse.status === 403) {
                window.location.href = '/login';
                return;
            }
            throw new Error(`Error al cargar útiles: ${suppliesResponse.status}`);
        }

        const booksData = await booksResponse.json();
        const suppliesData = await suppliesResponse.json();

        console.log('Books data:', booksData);
        console.log('Supplies data:', suppliesData);

        allItems = [];

        if (booksData.success && Array.isArray(booksData.data)) {
            allItems = allItems.concat(booksData.data.map(book => ({
                ...book,
                type: 'book',
                available: book.quant - (book.borrowed ? 1 : 0)
            })));
            console.log(`Loaded ${booksData.data.length} books`);
        } else {
            console.warn('No books data or invalid format:', booksData);
        }

        if (suppliesData.success && Array.isArray(suppliesData.data)) {
            allItems = allItems.concat(suppliesData.data.map(supply => ({
                ...supply,
                type: 'supply',
                available: (supply.total_quantity || 0) - (supply.borrowed || 0),
                quant: supply.total_quantity
            })));
            console.log(`Loaded ${suppliesData.data.length} supplies`);
        } else {
            console.warn('No supplies data or invalid format:', suppliesData);
        }

        console.log(`Total items loaded: ${allItems.length}`);
        filterItems();
    } catch (error) {
        console.error('Error loading items:', error);
        const container = document.getElementById('itemsContainer');
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error al cargar items</p></div>';
    }
}

function filterItems() {
    const typeFilter = document.getElementById('itemTypeFilter').value;
    const searchQuery = document.getElementById('itemSearch').value.toLowerCase();

    let filtered = allItems.filter(item => {
        // Filtro por tipo
        if (typeFilter === 'books' && item.type !== 'book') return false;
        if (typeFilter === 'supplies' && item.type !== 'supply') return false;

        // Filtro por búsqueda
        if (searchQuery) {
            const name = item.name.toLowerCase();
            const author = (item.author || '').toLowerCase();
            if (!name.includes(searchQuery) && !author.includes(searchQuery)) {
                return false;
            }
        }

        return true;
    });

    displayItems(filtered);
}

function displayItems(items) {
    const container = document.getElementById('itemsContainer');

    console.log('Displaying items:', items.length);

    if (!container) {
        console.error('Container #itemsContainer not found!');
        return;
    }

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <p class="empty-message">No se encontraron items</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(item => {
        const availabilityClass = item.available > 0 ? 'available' : 'unavailable';
        const availabilityText = item.available > 0 ? 
            `${item.available} disponible(s)` : 'No disponible';

        const imageUrl = item.img && item.img.trim() !== '' 
            ? item.img 
            : '/assets/items/default.png';
            
        return `
            <div class="item-card">
                <span class="item-badge ${item.type}">${item.type === 'book' ? '📚 Libro' : '✏️ Útil'}</span>
                <div class="item-image-container">
                    <img src="${imageUrl}" alt="${item.name}" class="item-image" onerror="this.src='/assets/items/default.png'">
                </div>
                <div class="item-title">${item.name}</div>
                ${item.author ? `<div class="item-author">Por ${item.author}</div>` : ''}
                <div class="item-stock ${availabilityClass}">${availabilityText} de ${item.quant || 0}</div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editItem(${item.id}, '${item.type}')">✏️ Editar</button>
                    <button class="btn-delete" onclick="deleteItem(${item.id}, '${item.type}')">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

// Gestión de modales
function showCreateItemModal() {
    editingItemId = null;
    document.getElementById('modalTitle').textContent = 'Crear Item';
    document.getElementById('typeSelector').style.display = 'flex';
    document.getElementById('bookForm').style.display = 'none';
    document.getElementById('supplyForm').style.display = 'none';
    
    // Reset forms
    document.getElementById('bookForm').reset();
    document.getElementById('supplyForm').reset();
    
    document.getElementById('itemModal').classList.add('active');
}

function closeItemModal() {
    document.getElementById('itemModal').classList.remove('active');
    currentItemType = null;
    editingItemId = null;
}

function selectItemType(type) {
    currentItemType = type;
    
    // Actualizar botones
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('selected');
    
    // Mostrar formulario correspondiente
    document.getElementById('typeSelector').style.display = 'none';
    
    if (type === 'book') {
        document.getElementById('bookForm').style.display = 'flex';
        document.getElementById('supplyForm').style.display = 'none';
    } else {
        document.getElementById('bookForm').style.display = 'none';
        document.getElementById('supplyForm').style.display = 'flex';
    }
}

function scanForCreate() {
    if (typeof openBarcodeScanner === 'function') {
        openBarcodeScanner('create', (item) => {
            if (item.notFound) {
                // Código de barras nuevo
                if (currentItemType === 'book') {
                    document.getElementById('bookBarcode').value = item.barcode;
                } else {
                    document.getElementById('supplyBarcode').value = item.barcode;
                }
            } else {
                // Item ya existe
                alert('Este código de barras ya está registrado: ' + item.name);
            }
        });
    }
}

// Crear/Editar items
async function handleBookSubmit(e) {
    e.preventDefault();
    
    const bookData = {
        name: document.getElementById('bookName').value,
        author: document.getElementById('bookAuthor').value,
        sinopsis: document.getElementById('bookSinopsis').value,
        editorial: document.getElementById('bookEditorial').value,
        gender: document.getElementById('bookGender').value,
        readLevel: document.getElementById('bookReadLevel').value,
        length: parseInt(document.getElementById('bookLength').value),
        theme: document.getElementById('bookTheme').value,
        quant: parseInt(document.getElementById('bookQuant').value),
        img: document.getElementById('bookImg').value || undefined
    };

    const barcode = document.getElementById('bookBarcode').value;
    if (barcode) {
        bookData.barCode = barcode;
    }

    try {
        const url = editingItemId ? `/api/books/${editingItemId}` : '/api/books';
        const method = editingItemId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });

        const data = await response.json();

        if (data.success) {
            alert(editingItemId ? 'Libro actualizado exitosamente' : 'Libro creado exitosamente');
            closeItemModal();
            loadItems();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving book:', error);
        alert('Error al guardar libro');
    }
}

async function handleSupplySubmit(e) {
    e.preventDefault();
    
    const supplyData = {
        name: document.getElementById('supplyName').value,
        total_quantity: parseInt(document.getElementById('supplyQuantity').value),
        img: document.getElementById('supplyImg').value || undefined
    };

    const barcode = document.getElementById('supplyBarcode').value;
    if (barcode) {
        supplyData.barCode = barcode;
    }

    try {
        const url = editingItemId ? `/api/supplies/${editingItemId}` : '/api/supplies';
        const method = editingItemId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplyData)
        });

        const data = await response.json();

        if (data.success) {
            alert(editingItemId ? 'Útil actualizado exitosamente' : 'Útil creado exitosamente');
            closeItemModal();
            loadItems();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving supply:', error);
        alert('Error al guardar útil');
    }
}

async function editItem(id, type) {
    editingItemId = id;
    currentItemType = type;
    
    const item = allItems.find(i => i.id === id && i.type === type);
    if (!item) return;

    document.getElementById('modalTitle').textContent = 'Editar Item';
    document.getElementById('typeSelector').style.display = 'none';

    if (type === 'book') {
        document.getElementById('bookForm').style.display = 'flex';
        document.getElementById('supplyForm').style.display = 'none';
        
        document.getElementById('bookBarcode').value = item.barCode || '';
        document.getElementById('bookName').value = item.name;
        document.getElementById('bookAuthor').value = item.author;
        document.getElementById('bookSinopsis').value = item.sinopsis;
        document.getElementById('bookEditorial').value = item.editorial;
        document.getElementById('bookGender').value = item.gender;
        document.getElementById('bookReadLevel').value = item.readLevel;
        document.getElementById('bookLength').value = item.length;
        document.getElementById('bookTheme').value = item.theme;
        document.getElementById('bookQuant').value = item.quant;
        document.getElementById('bookImg').value = item.img || '';
    } else {
        document.getElementById('bookForm').style.display = 'none';
        document.getElementById('supplyForm').style.display = 'flex';
        
        document.getElementById('supplyBarcode').value = item.barCode || '';
        document.getElementById('supplyName').value = item.name;
        document.getElementById('supplyQuantity').value = item.total_quantity || item.quant;
        document.getElementById('supplyImg').value = item.img || '';
    }

    document.getElementById('itemModal').classList.add('active');
}

async function deleteItem(id, type) {
    if (!confirm('¿Está seguro de que desea eliminar este item?')) {
        return;
    }

    try {
        const endpoint = type === 'book' ? 'books' : 'supplies';
        
        const response = await fetch(`/api/${endpoint}/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('Item eliminado exitosamente');
            loadItems();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error al eliminar item');
    }
}

// Tramitar préstamo directo (entrega inmediata)
async function tramitarPrestamo() {
    const userEmail = prompt('Ingrese el email del usuario:');
    if (!userEmail) return;

    const itemId = prompt('Ingrese el ID del item (libro/útil):');
    if (!itemId) return;

    const itemType = prompt('Tipo de item (escriba "book" para libro o "supply" para útil):').toLowerCase();
    if (itemType !== 'book' && itemType !== 'supply') {
        alert('Tipo inválido. Debe ser "book" o "supply"');
        return;
    }

    console.log(`[TRAMITAR PRESTAMO] User: ${userEmail}, Item: ${itemId}, Type: ${itemType}`);

    try {
        // Buscar usuario por email
        const usersResponse = await fetch('/api/admin/users', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        const usersData = await usersResponse.json();
        const user = usersData.data?.find(u => u.email.toLowerCase() === userEmail.toLowerCase());

        if (!user) {
            alert('Usuario no encontrado con ese email');
            return;
        }

        // Verificar disponibilidad del item
        const itemsResponse = await fetch(`/api/${itemType === 'book' ? 'books' : 'supplies'}/${itemId}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!itemsResponse.ok) {
            alert('Item no encontrado');
            return;
        }

        const itemData = await itemsResponse.json();
        const item = itemData.data;

        const available = itemType === 'book' 
            ? (item.quant - (item.borrowed || 0))
            : (item.total_quantity - (item.borrowed || 0));

        if (available <= 0) {
            alert('Este item no tiene unidades disponibles');
            return;
        }

        // Crear préstamo directo (estado: "en prestamo")
        const response = await fetch('/api/loans/pickup', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user.id,
                itemId: parseInt(itemId),
                type: itemType
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(`✅ Préstamo entregado exitosamente a ${user.name} ${user.lastName}\n\nItem: ${item.name}\nEstado: En Préstamo`);
            loadItems();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('[TRAMITAR PRESTAMO] Error:', error);
        alert('Error al tramitar préstamo: ' + error.message);
    }
}

// Tramitar devolución
async function tramitarDevolucion() {
    const loanId = prompt('Ingrese el ID del préstamo a devolver:');
    if (!loanId) return;

    console.log(`[TRAMITAR DEVOLUCION] Loan ID: ${loanId}`);

    try {
        // Obtener información del préstamo
        const loansResponse = await fetch(`/api/loans/all`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        const loansData = await loansResponse.json();

        if (!loansData.success) {
            alert('Error al cargar préstamos');
            return;
        }

        const loan = loansData.data.find(l => l.id === parseInt(loanId));

        if (!loan) {
            alert('Préstamo no encontrado');
            return;
        }

        if (loan.state !== 'en prestamo' && loan.state !== 'atrasado') {
            alert(`Este préstamo no está activo. Estado actual: ${loan.state}`);
            return;
        }

        const confirmMsg = `¿Confirmar devolución?\n\nUsuario: ${loan.userName} ${loan.userLastName}\nItem: ${loan.itemName}\nEstado: ${loan.state}`;
        
        if (!confirm(confirmMsg)) {
            return;
        }

        // Tramitar devolución
        const returnResponse = await fetch('/api/loans/return', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loanId: parseInt(loanId),
                type: loan.type
            })
        });

        const returnData = await returnResponse.json();

        if (returnData.success) {
            alert(`✅ Devolución tramitada exitosamente\n\nUsuario: ${loan.userName} ${loan.userLastName}\nItem: ${loan.itemName}\nEstado: Devuelto`);
            loadItems();
        } else {
            alert('Error: ' + returnData.message);
        }
    } catch (error) {
        console.error('[TRAMITAR DEVOLUCION] Error:', error);
        alert('Error al tramitar devolución: ' + error.message);
    }
}

function showError(message) {
    alert('Error: ' + message);
}

// Cerrar modal al hacer click fuera
document.getElementById('itemModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeItemModal();
    }
});

// ========== FUNCIONES MEJORADAS PARA MODALES ==========

// Variables globales para modales
let allBooksForModal = [];
let allSuppliesForModal = [];
let allActiveLoansForModal = [];

// Cerrar modal de préstamo
function closeLoanModal() {
  document.getElementById('loanModal').style.display = 'none';
}

// Función mejorada para abrir modal de préstamo
async function tramitarPrestamoModal() {
  console.log('[MODAL PRESTAMO] Abriendo modal...');
  document.getElementById('loanModal').style.display = 'flex';
  document.getElementById('loanUserEmail').value = '';
  document.getElementById('loanItemType').value = '';
  document.getElementById('loanItemId').innerHTML = '<option value="">Selecciona tipo primero...</option>';
}

// Cargar items según el tipo seleccionado
async function loadItemsForLoan() {
  const type = document.getElementById('loanItemType').value;
  const itemSelect = document.getElementById('loanItemId');
  
  console.log('[LOAD ITEMS FOR LOAN] Tipo seleccionado:', type);
  
  if (!type) {
    itemSelect.innerHTML = '<option value="">Selecciona tipo primero...</option>';
    return;
  }

  try {
    itemSelect.innerHTML = '<option value="">Cargando...</option>';
    
    const endpoint = type === 'libro' ? '/api/books' : '/api/supplies';
    console.log('[LOAD ITEMS FOR LOAN] Fetching from:', endpoint);
    
    const response = await fetch(endpoint, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('[LOAD ITEMS FOR LOAN] Response:', responseData);
    
    // Extraer el array de items (la respuesta viene como { success: true, data: [...] })
    const items = responseData.data || responseData;
    console.log(`[LOAD ITEMS FOR LOAN] ${type}s cargados:`, items.length);

    if (!Array.isArray(items) || items.length === 0) {
      itemSelect.innerHTML = '<option value="">No hay items disponibles</option>';
      return;
    }

    // Filtrar solo items con disponibilidad
    const availableItems = items.filter(item => {
      const borrowed = item.borrowed || 0;
      const total = type === 'libro' ? (item.quant || 0) : (item.total_quantity || 0);
      return (total - borrowed) > 0;
    });

    console.log('[LOAD ITEMS FOR LOAN] Items con disponibilidad:', availableItems.length);

    if (availableItems.length === 0) {
      itemSelect.innerHTML = '<option value="">No hay items con disponibilidad</option>';
      return;
    }

    // Crear opciones
    itemSelect.innerHTML = '<option value="">Seleccionar item...</option>';
    availableItems.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      const borrowed = item.borrowed || 0;
      const total = type === 'libro' ? (item.quant || 0) : (item.total_quantity || 0);
      const available = total - borrowed;
      const name = item.name || item.title || 'Sin nombre';
      option.textContent = `${name} (Disponibles: ${available}/${total})`;
      itemSelect.appendChild(option);
    });

  } catch (error) {
    console.error('[LOAD ITEMS FOR LOAN] Error:', error);
    itemSelect.innerHTML = '<option value="">Error al cargar items</option>';
  }
}

// Procesar el préstamo desde el modal
async function processTramitarPrestamo() {
  const userEmail = document.getElementById('loanUserEmail').value.trim();
  const itemType = document.getElementById('loanItemType').value;
  const itemId = document.getElementById('loanItemId').value;

  console.log('[TRAMITAR PRESTAMO MODAL] Procesando:', { userEmail, itemType, itemId });

  // Validaciones
  if (!userEmail) {
    alert('❌ Por favor ingresa el email del usuario');
    return;
  }

  if (!itemType) {
    alert('❌ Por favor selecciona el tipo de item');
    return;
  }

  if (!itemId) {
    alert('❌ Por favor selecciona un item');
    return;
  }

  try {
    const response = await fetch('/api/loans/pickup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        userEmail,
        itemId: parseInt(itemId),
        type: itemType
      })
    });

    const data = await response.json();
    console.log('[TRAMITAR PRESTAMO MODAL] Respuesta:', data);

    if (response.ok) {
      alert('✅ Préstamo tramitado exitosamente');
      closeLoanModal();
      loadItems(); // Recargar items
    } else {
      alert(`❌ Error: ${data.message || 'No se pudo tramitar el préstamo'}`);
    }
  } catch (error) {
    console.error('[TRAMITAR PRESTAMO MODAL] Error:', error);
    alert('❌ Error al tramitar préstamo. Ver consola para detalles.');
  }
}

// Cerrar modal de devolución
function closeReturnModal() {
  document.getElementById('returnModal').style.display = 'none';
}

// Función mejorada para abrir modal de devolución
async function tramitarDevolucionModal() {
  console.log('[MODAL DEVOLUCION] Abriendo modal...');
  document.getElementById('returnModal').style.display = 'flex';
  document.getElementById('returnSearchInput').value = '';
  await loadActiveLoans();
}

// Cargar préstamos activos
async function loadActiveLoans() {
  const loanSelect = document.getElementById('returnLoanId');
  
  try {
    loanSelect.innerHTML = '<option value="">Cargando préstamos activos...</option>';
    
    const response = await fetch('/api/loans/all', {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const loans = data.data || data;
    
    console.log('[LOAD ACTIVE LOANS] Total préstamos:', loans.length);

    // Filtrar solo préstamos activos
    allActiveLoansForModal = loans.filter(loan => 
      loan.state === 'en prestamo' || loan.state === 'atrasado'
    );

    console.log('[LOAD ACTIVE LOANS] Préstamos activos:', allActiveLoansForModal.length);

    if (allActiveLoansForModal.length === 0) {
      loanSelect.innerHTML = '<option value="">No hay préstamos activos</option>';
      return;
    }

    // Crear opciones
    renderLoanOptions(allActiveLoansForModal);

  } catch (error) {
    console.error('[LOAD ACTIVE LOANS] Error:', error);
    loanSelect.innerHTML = '<option value="">Error al cargar préstamos</option>';
  }
}

// Renderizar opciones de préstamos
function renderLoanOptions(loans) {
  const loanSelect = document.getElementById('returnLoanId');
  
  if (loans.length === 0) {
    loanSelect.innerHTML = '<option value="">No se encontraron préstamos</option>';
    return;
  }

  loanSelect.innerHTML = '';
  loans.forEach(loan => {
    const option = document.createElement('option');
    option.value = loan.id;
    
    const userName = `${loan.userName || ''} ${loan.userLastName || ''}`.trim();
    const itemName = loan.itemName || 'Sin nombre';
    const state = loan.state || 'desconocido';
    const stateEmoji = state === 'atrasado' ? '⚠️' : '📚';
    
    option.textContent = `${stateEmoji} ID: ${loan.id} | ${userName} | ${itemName} | ${state}`;
    option.dataset.userName = userName.toLowerCase();
    option.dataset.itemName = itemName.toLowerCase();
    
    loanSelect.appendChild(option);
  });
}

// Filtrar préstamos en tiempo real
function filterActiveLoans() {
  const searchTerm = document.getElementById('returnSearchInput').value.toLowerCase().trim();
  
  if (!searchTerm) {
    renderLoanOptions(allActiveLoansForModal);
    return;
  }

  const filtered = allActiveLoansForModal.filter(loan => {
    const userName = `${loan.userName || ''} ${loan.userLastName || ''}`.toLowerCase();
    const itemName = (loan.itemName || '').toLowerCase();
    const loanId = (loan.id || '').toString();
    
    return userName.includes(searchTerm) || 
           itemName.includes(searchTerm) || 
           loanId.includes(searchTerm);
  });

  console.log('[FILTER LOANS] Término:', searchTerm, 'Resultados:', filtered.length);
  renderLoanOptions(filtered);
}

// Procesar la devolución desde el modal
async function processTramitarDevolucion() {
  const loanId = document.getElementById('returnLoanId').value;

  console.log('[TRAMITAR DEVOLUCION MODAL] Loan ID:', loanId);

  if (!loanId) {
    alert('❌ Por favor selecciona un préstamo');
    return;
  }

  try {
    // Buscar información del préstamo seleccionado
    const loan = allActiveLoansForModal.find(l => l.id === parseInt(loanId));
    
    if (!loan) {
      alert('❌ No se encontró información del préstamo');
      return;
    }

    const userName = `${loan.userName || ''} ${loan.userLastName || ''}`.trim();
    const itemName = loan.itemName || 'Sin nombre';
    
    const confirmMsg = `¿Confirmar devolución?\n\nUsuario: ${userName}\nItem: ${itemName}\nEstado: ${loan.state}`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    const response = await fetch('/api/loans/return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        loanId: parseInt(loanId),
        type: loan.type
      })
    });

    const data = await response.json();
    console.log('[TRAMITAR DEVOLUCION MODAL] Respuesta:', data);

    if (response.ok && data.success) {
      alert(`✅ Devolución tramitada exitosamente\n\nUsuario: ${userName}\nItem: ${itemName}`);
      closeReturnModal();
      loadItems(); // Recargar items
    } else {
      alert(`❌ Error: ${data.message || 'No se pudo tramitar la devolución'}`);
    }
  } catch (error) {
    console.error('[TRAMITAR DEVOLUCION MODAL] Error:', error);
    alert('❌ Error al tramitar devolución. Ver consola para detalles.');
  }
}

// Cerrar modales al hacer click fuera
document.getElementById('loanModal')?.addEventListener('click', function(e) {
  if (e.target === this) {
    closeLoanModal();
  }
});

document.getElementById('returnModal')?.addEventListener('click', function(e) {
  if (e.target === this) {
    closeReturnModal();
  }
});
