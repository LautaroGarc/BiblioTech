# Barcode Scanner Component - BiblioTech

## 📋 Descripción

Componente HTML externo e independiente para escanear códigos de barras que puede ser invocado desde cualquier parte de la aplicación BiblioTech. Utiliza QuaggaJS para el escaneo en tiempo real y soporta múltiples formatos de código de barras.

## ✨ Características

- ✅ Componente auto-contenido e independiente
- ✅ Activación de cámara web para escaneo en tiempo real
- ✅ Soporte para múltiples formatos: EAN-13, EAN-8, Code 128, Code 39, UPC
- ✅ Comunicación mediante `window.postMessage()` y eventos custom
- ✅ Interfaz limpia con opciones de cerrar/cancelar
- ✅ Manejo completo de errores (cámara no disponible, permisos, etc.)
- ✅ Diseño responsive y mobile-first
- ✅ Compatibilidad cross-browser
- ✅ Plug-and-play - fácil integración

## 📁 Archivos del Componente

```
frontend/src/
├── components/
│   ├── barcode-scanner.html          # Componente principal
│   └── barcode-scanner-demo.html     # Página de demostración
├── js/
│   └── barcode-scanner.js            # Módulo de invocación
└── css/
    └── barcode-scanner.css           # Estilos del componente
```

## 🚀 Uso Básico

### 1. Incluir el módulo en tu página

```html
<script src="../js/barcode-scanner.js"></script>
```

### 2. Abrir el escáner

```javascript
// Opción 1: Usando async/await
async function scanBarcode() {
    try {
        const result = await openBarcodeScanner({
            onScan: (data) => {
                console.log('Código escaneado:', data.code);
                console.log('Formato:', data.format);
            },
            onClose: () => {
                console.log('Scanner cerrado');
            }
        });
        
        // El resultado también se devuelve aquí
        console.log('Resultado:', result.code);
        
    } catch (error) {
        console.log('Escaneo cancelado o error:', error);
    }
}
```

```javascript
// Opción 2: Usando promesas
openBarcodeScanner()
    .then(result => {
        console.log('Código:', result.code);
        console.log('Formato:', result.format);
    })
    .catch(error => {
        console.log('Cancelado:', error);
    });
```

## 📱 Casos de Uso e Integración

### Caso 1: Agregar Libro (Admin Panel)

**Archivo:** `/frontend/src/private/admin/plus.html`

```html
<button id="scanISBN">Escanear ISBN</button>
<input type="text" id="isbnInput" placeholder="ISBN">

<script src="../../js/barcode-scanner.js"></script>
<script>
document.getElementById('scanISBN').addEventListener('click', async () => {
    try {
        const result = await openBarcodeScanner({
            onScan: (data) => {
                document.getElementById('isbnInput').value = data.code;
            }
        });
        
        // Opcional: búsqueda automática del libro
        await searchBookByISBN(result.code);
        
    } catch (err) {
        console.log('Escaneo cancelado');
    }
});
</script>
```

### Caso 2: Búsqueda Rápida

**Archivo:** `/frontend/src/private/search.html`

```html
<button id="scanSearch">🔍 Buscar por Código</button>

<script src="../js/barcode-scanner.js"></script>
<script>
document.getElementById('scanSearch').addEventListener('click', () => {
    openBarcodeScanner({
        onScan: async (data) => {
            // Realizar búsqueda con el código escaneado
            const response = await fetch(`/api/books/search?barcode=${data.code}`);
            const books = await response.json();
            displayResults(books);
        }
    });
});
</script>
```

### Caso 3: Préstamo Rápido

**Archivo:** `/frontend/src/private/user/plus.html` o `/frontend/src/private/qrReader.html`

```html
<button id="quickLoan">📚 Préstamo Rápido</button>

<script src="../../js/barcode-scanner.js"></script>
<script>
document.getElementById('quickLoan').addEventListener('click', async () => {
    try {
        const scanResult = await openBarcodeScanner();
        
        // Enviar al endpoint de escaneo existente
        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                data: scanResult.code 
            })
        });
        
        const loan = await response.json();
        
        if (loan.success) {
            alert('¡Préstamo creado exitosamente!');
        } else {
            alert('Error: ' + loan.message);
        }
        
    } catch (err) {
        console.error('Error en préstamo:', err);
    }
});
</script>
```

### Caso 4: Gestión de Inventario

**Archivo:** `/frontend/src/private/admin/books.html`

```html
<button id="scanInventory">📦 Escanear Item</button>

<script src="../../js/barcode-scanner.js"></script>
<script>
document.getElementById('scanInventory').addEventListener('click', async () => {
    const result = await openBarcodeScanner({
        onScan: async (data) => {
            // Buscar item en inventario
            await findItemByBarcode(data.code);
        }
    });
});
</script>
```

## 🔧 API del Componente

### Funciones Principales

#### `openBarcodeScanner(options)`

Abre el escáner de códigos de barras.

**Parámetros:**
- `options` (Object, opcional):
  - `onScan` (Function): Callback ejecutado cuando se escanea un código
  - `onClose` (Function): Callback ejecutado cuando se cierra el escáner

**Retorna:** Promise que resuelve con el objeto de datos escaneados o rechaza si se cancela.

**Objeto de resultado:**
```javascript
{
    code: "9781234567897",      // Código escaneado
    format: "ean_reader",        // Formato detectado
    timestamp: "2024-01-15T10:30:00.000Z"  // Timestamp ISO
}
```

#### `closeBarcodeScanner()`

Cierra manualmente el escáner de códigos de barras.

```javascript
closeBarcodeScanner();
```

#### `isScannerActive()`

Verifica si el escáner está actualmente activo.

**Retorna:** Boolean

```javascript
if (isScannerActive()) {
    console.log('El escáner está abierto');
}
```

## 🎨 Formatos Soportados

- **EAN-13**: Códigos de barras estándar en productos (ISBN libros)
- **EAN-8**: Versión corta de EAN
- **Code 128**: Códigos alfanuméricos de alta densidad
- **Code 39**: Códigos alfanuméricos estándar
- **UPC-A**: Universal Product Code (común en USA)
- **UPC-E**: Versión compacta de UPC

## 🔒 Manejo de Errores

El componente maneja automáticamente los siguientes errores:

| Error | Descripción | Mensaje al Usuario |
|-------|-------------|-------------------|
| `NotAllowedError` | Permiso de cámara denegado | "Permiso de cámara denegado. Por favor, habilite el acceso a la cámara." |
| `NotFoundError` | No se encontró cámara | "No se encontró una cámara disponible." |
| `NotReadableError` | Cámara en uso | "La cámara está en uso por otra aplicación." |
| `OverconstrainedError` | Requisitos no satisfechos | "No se pudo satisfacer los requisitos de la cámara." |

### Ejemplo de manejo de errores

```javascript
try {
    const result = await openBarcodeScanner();
    console.log('Éxito:', result.code);
} catch (error) {
    if (error.message.includes('closed without scanning')) {
        console.log('Usuario canceló el escaneo');
    } else {
        console.error('Error en el escáner:', error);
    }
}
```

## 📡 Comunicación

El componente utiliza dos métodos de comunicación:

### 1. window.postMessage()

Para uso en iframe:

```javascript
// El componente envía
window.parent.postMessage({
    type: 'BARCODE_SCANNED',
    data: { code, format, timestamp }
}, '*');
```

### 2. Custom Events

Para uso en la misma página:

```javascript
// Escuchar eventos
window.addEventListener('barcode-scanned', (event) => {
    console.log('Código:', event.detail.code);
});

window.addEventListener('barcode-scanner-closed', () => {
    console.log('Scanner cerrado');
});
```

## 🎯 Mejores Prácticas

### 1. Verificar disponibilidad de cámara

```javascript
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // La API está disponible
    openBarcodeScanner();
} else {
    alert('Su navegador no soporta acceso a la cámara');
}
```

### 2. Validar códigos escaneados

```javascript
openBarcodeScanner({
    onScan: (data) => {
        // Validar formato de ISBN-13
        if (data.format === 'ean_reader' && data.code.length === 13) {
            processISBN(data.code);
        } else {
            alert('Por favor escanee un ISBN válido');
        }
    }
});
```

### 3. Proporcionar feedback al usuario

```javascript
const button = document.getElementById('scanBtn');

button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Escaneando...';
    
    try {
        const result = await openBarcodeScanner();
        showSuccessMessage(`Código ${result.code} escaneado`);
    } catch (err) {
        showErrorMessage('Escaneo cancelado');
    } finally {
        button.disabled = false;
        button.textContent = 'Escanear';
    }
});
```

## 📱 Optimización Mobile

El componente está diseñado con enfoque mobile-first:

- Interfaz táctil optimizada
- Botones grandes para fácil interacción
- Diseño responsive que se adapta a diferentes tamaños
- Uso eficiente de recursos (pausa cuando está oculto)
- Soporte para cámara trasera en dispositivos móviles

## 🌐 Compatibilidad de Navegadores

| Navegador | Versión Mínima | Notas |
|-----------|----------------|-------|
| Chrome | 53+ | ✅ Soporte completo |
| Firefox | 36+ | ✅ Soporte completo |
| Safari | 11+ | ✅ Requiere HTTPS |
| Edge | 79+ | ✅ Soporte completo |
| Opera | 40+ | ✅ Soporte completo |
| Samsung Internet | 6+ | ✅ Soporte completo |

**Nota:** El acceso a la cámara requiere HTTPS en producción (excepto localhost).

## 🧪 Testing

Para probar el componente:

1. Abrir `/frontend/src/components/barcode-scanner-demo.html`
2. Hacer clic en cualquiera de los botones de demostración
3. Permitir acceso a la cámara cuando se solicite
4. Apuntar la cámara a un código de barras

**Códigos de prueba recomendados:**
- ISBN libro: 9780134685991 (Effective Java)
- EAN-13: 5901234123457
- Cualquier producto con código de barras

## 🔄 Integración con Backend Existente

El componente se integra perfectamente con el endpoint existente `/api/scan`:

```javascript
async function createLoanFromScan() {
    try {
        const scanResult = await openBarcodeScanner();
        
        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${yourAuthToken}`
            },
            body: JSON.stringify({ 
                data: scanResult.code 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Préstamo creado: ${result.data.loanId}`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## 🐛 Solución de Problemas

### El escáner no se abre
- Verificar que el archivo `barcode-scanner.js` esté correctamente incluido
- Verificar la ruta al componente `/components/barcode-scanner.html`
- Comprobar la consola del navegador para errores

### La cámara no se activa
- Verificar permisos de cámara en el navegador
- Asegurarse de que la página esté servida por HTTPS (o localhost)
- Verificar que ninguna otra aplicación esté usando la cámara

### No detecta códigos de barras
- Asegurarse de que haya buena iluminación
- Mantener el código estable y enfocado
- Verificar que el formato del código sea uno de los soportados
- Probar con diferentes distancias de la cámara

## 📄 Licencia

Este componente es parte del proyecto BiblioTech - ET21 "Fragata Libertad"

## 👥 Contribución

Para reportar problemas o sugerir mejoras, contactar al equipo de desarrollo.
