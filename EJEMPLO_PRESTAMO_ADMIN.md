# Ejemplo Práctico: Crear Préstamo Escaneando Código de Barras (Admin)

## 📖 ¿Qué hace esto?

Como administrador, puedes escanear el código de barras de un libro para crear un préstamo **de forma inmediata**.

## 🎯 Ejemplo Completo - Listo para Usar

### Opción 1: Página Simple de Préstamo por Escaneo

Crea o modifica cualquier página de admin (por ejemplo: `/frontend/src/private/admin/quick-loan.html`):

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Préstamo Rápido - Admin</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: white;
            padding: 20px;
        }
        
        h1 {
            margin-bottom: 30px;
            text-align: center;
        }
        
        .scan-button {
            background: linear-gradient(135deg, #0096ff 0%, #0066cc 100%);
            color: white;
            border: none;
            padding: 20px 40px;
            font-size: 1.3rem;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(0, 150, 255, 0.4);
            transition: transform 0.2s;
        }
        
        .scan-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 7px 25px rgba(0, 150, 255, 0.6);
        }
        
        .scan-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .result {
            margin-top: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            min-width: 300px;
            text-align: center;
        }
        
        .success {
            color: #00ff00;
            border: 2px solid #00ff00;
        }
        
        .error {
            color: #ff4444;
            border: 2px solid #ff4444;
        }
    </style>
</head>
<body>
    <h1>📚 Crear Préstamo por Escaneo</h1>
    <p style="text-align: center; margin-bottom: 30px;">
        Haz click en el botón y escanea el código de barras del libro
    </p>
    
    <button class="scan-button" id="scanLoanBtn">
        📷 Escanear Código de Barras
    </button>
    
    <div id="result" style="display: none;" class="result"></div>

    <!-- Incluir el componente de escaneo -->
    <script src="/js/barcode-scanner.js"></script>
    
    <script>
        const scanBtn = document.getElementById('scanLoanBtn');
        const resultDiv = document.getElementById('result');
        
        scanBtn.addEventListener('click', async function() {
            // Deshabilitar botón mientras escanea
            scanBtn.disabled = true;
            scanBtn.textContent = '⏳ Abriendo escáner...';
            resultDiv.style.display = 'none';
            
            try {
                // 1. ABRIR ESCÁNER Y ESPERAR CÓDIGO
                const scanResult = await openBarcodeScanner({
                    onScan: (data) => {
                        console.log('Código detectado:', data.code);
                    }
                });
                
                console.log('Código escaneado:', scanResult.code);
                scanBtn.textContent = '📡 Creando préstamo...';
                
                // 2. ENVIAR AL BACKEND PARA CREAR PRÉSTAMO
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
                
                // 3. MOSTRAR RESULTADO
                resultDiv.style.display = 'block';
                
                if (result.success) {
                    resultDiv.className = 'result success';
                    resultDiv.innerHTML = `
                        <h2>✅ Préstamo Creado</h2>
                        <p><strong>Código:</strong> ${scanResult.code}</p>
                        <p><strong>Libro:</strong> ${result.data.book?.title || result.data.item?.name || 'N/A'}</p>
                        <p><strong>ID Préstamo:</strong> ${result.data.loanId}</p>
                    `;
                } else {
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = `
                        <h2>❌ Error</h2>
                        <p>${result.message || 'No se pudo crear el préstamo'}</p>
                    `;
                }
                
            } catch (error) {
                console.log('Error o escaneo cancelado:', error);
                resultDiv.style.display = 'block';
                resultDiv.className = 'result error';
                resultDiv.innerHTML = `
                    <h2>⚠️ Cancelado</h2>
                    <p>El escaneo fue cancelado o hubo un error</p>
                `;
            } finally {
                // Re-habilitar botón
                scanBtn.disabled = false;
                scanBtn.textContent = '📷 Escanear Código de Barras';
            }
        });
    </script>
</body>
</html>
```

---

### Opción 2: Agregar Botón a Página Existente

Si ya tienes una página donde quieres agregar esta funcionalidad, simplemente agrega:

```html
<!-- En cualquier parte del HTML -->
<button id="quickScanLoan" class="btn-primary">
    📷 Escanear para Préstamo
</button>

<!-- Antes de cerrar </body> -->
<script src="/js/barcode-scanner.js"></script>

<script>
document.getElementById('quickScanLoan').addEventListener('click', async () => {
    try {
        // Escanear código
        const scan = await openBarcodeScanner();
        
        // Crear préstamo
        const res = await fetch('/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ data: scan.code })
        });
        
        const result = await res.json();
        
        if (result.success) {
            alert(`✅ Préstamo creado exitosamente!\nLibro: ${result.data.book?.title || 'N/A'}`);
        } else {
            alert(`❌ Error: ${result.message}`);
        }
    } catch (err) {
        console.log('Cancelado');
    }
});
</script>
```

---

## 🎬 Flujo de Uso

1. **Admin abre la página**
   - Ve el botón "Escanear Código de Barras"

2. **Hace click en el botón**
   - Se abre una ventana modal con la cámara
   - La cámara se activa automáticamente

3. **Apunta la cámara al código de barras**
   - El código puede ser EAN-13 (ISBN), Code 128, etc.
   - Se detecta automáticamente en 1-3 segundos

4. **El código se escanea**
   - La modal se cierra automáticamente
   - Se envía el código al backend `/api/scan`

5. **El backend crea el préstamo**
   - Busca el libro por el código de barras
   - Crea el préstamo para el usuario actual
   - Devuelve confirmación

6. **Se muestra el resultado**
   - Éxito: Muestra detalles del préstamo
   - Error: Muestra mensaje de error (ej: libro no encontrado)

---

## 🔧 Personalización

### Cambiar el usuario del préstamo

El endpoint `/api/scan` actualmente crea el préstamo para `req.user.id`. Si necesitas especificar otro usuario:

```javascript
// En lugar de usar /api/scan, podrías llamar directamente a crear préstamo
const response = await fetch('/api/loans', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
        userId: 123, // ID del usuario que toma el préstamo
        bookId: bookId, // Obtenido buscando por código de barras
        dateOut: '2024-12-31'
    })
});
```

### Agregar confirmación antes de crear

```javascript
const scan = await openBarcodeScanner();

if (confirm(`¿Crear préstamo para el código ${scan.code}?`)) {
    // Proceder a crear préstamo
    const res = await fetch('/api/scan', { ... });
}
```

### Mostrar información del libro antes de confirmar

```javascript
const scan = await openBarcodeScanner();

// Primero buscar el libro
const bookRes = await fetch(`/api/books?barcode=${scan.code}`);
const books = await bookRes.json();

if (books.length > 0) {
    const book = books[0];
    if (confirm(`¿Crear préstamo para: ${book.title}?`)) {
        // Crear préstamo
    }
}
```

---

## 📝 Notas Importantes

1. **Permisos de Admin**: Asegúrate de que esta página solo sea accesible para administradores
2. **Autenticación**: El token debe estar en `localStorage.getItem('token')`
3. **HTTPS**: En producción, la cámara solo funciona con HTTPS
4. **Códigos Soportados**: EAN-13, EAN-8, Code 128, Code 39, UPC

---

## 🐛 Solución de Problemas

### La cámara no se abre
- Verifica que estés en HTTPS (o localhost)
- Revisa permisos de cámara en el navegador
- Cierra otras aplicaciones que usen la cámara

### El código no se detecta
- Mejora la iluminación
- Mantén el código estable
- Ajusta la distancia (8-12 pulgadas es ideal)

### Error "libro no encontrado"
- Verifica que el libro esté en la base de datos
- Confirma que el código de barras esté registrado correctamente
- Revisa que el campo `barCode` en la tabla `books` tenga el valor

---

## 📞 ¿Necesitas Ayuda?

Si necesitas ayuda para integrar esto en una página específica, dime qué archivo quieres modificar y te ayudo con el código exacto.
