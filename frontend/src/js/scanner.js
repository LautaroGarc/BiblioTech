// Configuración del scanner
const config = {
    fps: 10,
    qrbox: {
        width: 250,
        height: 250
    },
    aspectRatio: 1.0
};

// Elemento donde mostraremos los resultados
const resultContainer = document.getElementById('result');

// Función para manejar el éxito del escaneo
function onScanSuccess(decodedText, decodedResult) {
    // Detener el scanner después de un escaneo exitoso
    html5QrcodeScanner.clear();
    
    // Mostrar el resultado
    resultContainer.innerHTML = `
        <div class="success-result">
            <h2>Código escaneado exitosamente!</h2>
            <p>Resultado: ${decodedText}</p>
        </div>
        <button onclick="location.reload()">Escanear otro código</button>
    `;
}

// Función para manejar errores
function onScanError(errorMessage) {
    // Manejar errores si es necesario
    console.error(errorMessage);
}

// Crear instancia del scanner
const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    config
);

// Iniciar el scanner
html5QrcodeScanner.render(onScanSuccess, onScanError);