# Guía de Integración - Escáner de Códigos de Barras

## 📍 Integración en Páginas Existentes

Esta guía muestra cómo integrar el escáner de códigos de barras en las páginas existentes de BiblioTech.

## 1. Admin Plus Page (Agregar Libros)

**Archivo:** `/frontend/src/private/admin/plus.html`

### Paso 1: Agregar el script al HTML

Agregar antes del cierre de `</body>`:

```html
<!-- Barcode Scanner Integration -->
<script src="/js/barcode-scanner.js"></script>
```

### Paso 2: Agregar botón de escaneo

Agregar cerca del campo de ISBN o código de barras:

```html
<div class="input-group">
    <input type="text" id="isbnInput" placeholder="ISBN o Código de Barras">
    <button type="button" id="scanISBNBtn" class="scan-button">
        📷 Escanear
    </button>
</div>
```

### Paso 3: Agregar JavaScript

Agregar al archivo JS correspondiente o dentro de `<script>`:

```javascript
// Inicializar scanner para agregar libro
document.addEventListener('DOMContentLoaded', function() {
    const scanBtn = document.getElementById('scanISBNBtn');
    const isbnInput = document.getElementById('isbnInput');
    
    if (scanBtn) {
        scanBtn.addEventListener('click', async function() {
            try {
                const result = await openBarcodeScanner({
                    onScan: (data) => {
                        // Llenar automáticamente el campo
                        isbnInput.value = data.code;
                        
                        // Opcional: buscar información del libro automáticamente
                        // searchBookByISBN(data.code);
                    }
                });
                
                console.log('ISBN escaneado:', result.code);
                
                // Opcional: trigger evento para buscar libro
                isbnInput.dispatchEvent(new Event('change'));
                
            } catch (error) {
                console.log('Escaneo cancelado');
            }
        });
    }
});
```

---

## 2. User Plus Page (Solicitar Préstamo)

**Archivo:** `/frontend/src/private/user/plus.html`

### Integración para préstamo rápido

```html
<!-- Botón de escaneo rápido -->
<button id="quickLoanBtn" class="btn-primary">
    📚 Préstamo Rápido (Escanear)
</button>

<!-- Incluir script -->
<script src="/js/barcode-scanner.js"></script>

<script>
document.getElementById('quickLoanBtn').addEventListener('click', async function() {
    const button = this;
    button.disabled = true;
    button.textContent = 'Escaneando...';
    
    try {
        const scanResult = await openBarcodeScanner({
            onScan: (data) => {
                console.log('Creando préstamo para:', data.code);
            }
        });
        
        // Llamar al endpoint de scan existente
        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                data: scanResult.code 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ ¡Préstamo creado exitosamente!');
            // Opcional: redirigir o actualizar vista
            // window.location.href = '/books';
        } else {
            alert('❌ Error: ' + result.message);
        }
        
    } catch (error) {
        console.log('Escaneo cancelado o error:', error);
    } finally {
        button.disabled = false;
        button.textContent = '📚 Préstamo Rápido (Escanear)';
    }
});
</script>
```

---

## 3. Search Page (Búsqueda por Código)

**Archivo:** `/frontend/src/private/search.html`

### Integración para búsqueda rápida

```html
<!-- Campo de búsqueda con botón de escaneo -->
<div class="search-container">
    <input type="text" id="searchInput" placeholder="Buscar libro...">
    <button id="searchBtn" class="btn-search">🔍 Buscar</button>
    <button id="scanSearchBtn" class="btn-scan">📷 Escanear</button>
</div>

<div id="searchResults"></div>

<!-- Incluir script -->
<script src="/js/barcode-scanner.js"></script>

<script>
// Función para buscar libros
async function searchBooks(query) {
    try {
        const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const books = await response.json();
        displaySearchResults(books);
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
    }
}

// Búsqueda por texto
document.getElementById('searchBtn').addEventListener('click', function() {
    const query = document.getElementById('searchInput').value;
    if (query.trim()) {
        searchBooks(query);
    }
});

// Búsqueda por escaneo
document.getElementById('scanSearchBtn').addEventListener('click', async function() {
    try {
        const result = await openBarcodeScanner({
            onScan: (data) => {
                // Llenar campo de búsqueda
                document.getElementById('searchInput').value = data.code;
            }
        });
        
        // Buscar automáticamente
        searchBooks(result.code);
        
    } catch (error) {
        console.log('Búsqueda por escaneo cancelada');
    }
});

function displaySearchResults(books) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (!books || books.length === 0) {
        resultsDiv.innerHTML = '<p>No se encontraron resultados</p>';
        return;
    }
    
    resultsDiv.innerHTML = books.map(book => `
        <div class="book-card">
            <h3>${book.title}</h3>
            <p>ISBN: ${book.barCode || 'N/A'}</p>
            <button onclick="viewBook(${book.id})">Ver Detalles</button>
        </div>
    `).join('');
}
</script>
```

---

## 4. QR Reader Page (Reemplazo/Mejora)

**Archivo:** `/frontend/src/private/qrReader.html`

### Opción A: Reemplazar completamente

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scanner BiblioTech</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        }
        
        .start-button {
            background: linear-gradient(135deg, #0096ff 0%, #0066cc 100%);
            color: white;
            border: none;
            padding: 20px 40px;
            font-size: 1.5rem;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(0, 150, 255, 0.4);
        }
        
        .start-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 7px 25px rgba(0, 150, 255, 0.6);
        }
    </style>
</head>
<body>
    <button class="start-button" id="startScanBtn">
        📷 Iniciar Escáner
    </button>

    <script src="../js/barcode-scanner.js"></script>
    <script>
        document.getElementById('startScanBtn').addEventListener('click', async function() {
            try {
                const result = await openBarcodeScanner();
                
                // Enviar a API de préstamo
                const response = await fetch('/api/scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ data: result.code })
                });
                
                const loan = await response.json();
                
                if (loan.success) {
                    alert('✅ Préstamo creado exitosamente!');
                    // Opcional: redirigir
                    // window.location.href = '/home';
                } else {
                    alert('❌ ' + loan.message);
                }
                
            } catch (error) {
                console.log('Escaneo cancelado');
            }
        });
    </script>
</body>
</html>
```

### Opción B: Agregar junto al scanner existente

Mantener el scanner existente y agregar un botón adicional para el nuevo:

```html
<!-- Agregar al qrReader.html existente -->
<button id="newScannerBtn" style="margin-top: 20px;">
    Usar Nuevo Escáner (Códigos de Barras)
</button>

<script src="../js/barcode-scanner.js"></script>
<script>
document.getElementById('newScannerBtn').addEventListener('click', async () => {
    try {
        const result = await openBarcodeScanner();
        // Procesar igual que el scanner existente
        console.log('Código:', result.code);
    } catch (err) {
        console.log('Cancelado');
    }
});
</script>
```

---

## 5. Books Page (Gestión de Inventario)

**Archivo:** `/frontend/src/private/admin/books.html`

### Integración para gestión de inventario

```html
<!-- Botón para escanear y buscar -->
<button id="scanInventoryBtn" class="btn-inventory">
    📦 Escanear Item
</button>

<script src="/js/barcode-scanner.js"></script>

<script>
document.getElementById('scanInventoryBtn').addEventListener('click', async function() {
    try {
        const result = await openBarcodeScanner({
            onScan: async (data) => {
                // Buscar libro en inventario
                console.log('Buscando en inventario:', data.code);
            }
        });
        
        // Buscar libro por código de barras
        const response = await fetch(`/api/books?barcode=${result.code}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const books = await response.json();
        
        if (books.length > 0) {
            // Mostrar información del libro
            showBookDetails(books[0]);
        } else {
            alert('Libro no encontrado en inventario');
        }
        
    } catch (error) {
        console.log('Búsqueda cancelada');
    }
});

function showBookDetails(book) {
    // Implementar visualización de detalles
    console.log('Libro encontrado:', book);
}
</script>
```

---

## 🎨 Estilos CSS Sugeridos para Botones

Agregar a los archivos CSS correspondientes:

```css
/* Botón de escaneo estándar */
.scan-button, .btn-scan {
    background: linear-gradient(135deg, #0096ff 0%, #0066cc 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(0, 150, 255, 0.3);
}

.scan-button:hover, .btn-scan:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 150, 255, 0.5);
}

.scan-button:disabled, .btn-scan:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* Input group con botón de escaneo */
.input-group {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 15px;
}

.input-group input {
    flex: 1;
    padding: 12px;
    border: 2px solid rgba(0, 150, 255, 0.3);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 1rem;
}

.input-group input:focus {
    outline: none;
    border-color: rgba(0, 150, 255, 0.6);
    box-shadow: 0 0 10px rgba(0, 150, 255, 0.3);
}

/* Responsive para móviles */
@media (max-width: 768px) {
    .input-group {
        flex-direction: column;
    }
    
    .scan-button, .btn-scan {
        width: 100%;
        justify-content: center;
    }
}
```

---

## 🔧 Troubleshooting

### El escáner no se abre

1. Verificar que el script esté incluido:
   ```html
   <script src="/js/barcode-scanner.js"></script>
   ```

2. Verificar que la función se llame correctamente:
   ```javascript
   openBarcodeScanner()
   ```

3. Revisar la consola del navegador para errores

### La cámara no se activa

1. Verificar permisos de cámara en el navegador
2. Asegurarse de usar HTTPS (o localhost)
3. Verificar que ninguna otra app esté usando la cámara

### No detecta códigos

1. Mejorar la iluminación
2. Mantener el código estable
3. Ajustar la distancia
4. Verificar que el formato sea soportado

---

## 📚 Recursos Adicionales

- Ver `/BARCODE_SCANNER_README.md` para documentación completa
- Ver `/frontend/src/components/barcode-scanner-demo.html` para ejemplos interactivos
- Consultar la API del componente para opciones avanzadas

---

## ✅ Checklist de Integración

Para cada página donde quieras integrar el escáner:

- [ ] Incluir el script `barcode-scanner.js`
- [ ] Agregar botón o trigger para abrir el escáner
- [ ] Implementar callback `onScan` para manejar resultados
- [ ] Agregar manejo de errores (try-catch)
- [ ] Probar en móvil y escritorio
- [ ] Verificar permisos de cámara
- [ ] Estilizar según diseño de la página
