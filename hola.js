// Html5Qrcode instance disponible a nivel de módulo para usar cámara y scan de archivos
let html5Qr = null;
let scannerRunning = false; // indica si la cámara está activa
// Configurable backend endpoint (ajusta según tu servidor)
const BACKEND_POST_URL = '/scan';
let lastSentData = null; // evitar envíos duplicados continuos

function generate_qr(){
    return new Html5Qrcode("qr-reader");
}

// Listar cámaras disponibles y rellenar el selector
async function populateCameraList(){
    const sel = document.getElementById('camera-select');
    if (!sel) return;
    sel.innerHTML = '';
    try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.text = 'No se detectaron cámaras';
            sel.appendChild(opt);
            return;
        }
        devices.forEach(cam => {
            const opt = document.createElement('option');
            opt.value = cam.id;
            opt.text = cam.label || cam.id;
            sel.appendChild(opt);
        });
    } catch(e){
        console.warn('No se pudieron listar cámaras:', e);
        const opt = document.createElement('option');
        opt.value = '';
        opt.text = 'Error al listar cámaras';
        sel.appendChild(opt);
    }
}

async function startCameraById(cameraId){
    if (!cameraId) {
        const msg = document.getElementById('scanner-message');
        if (msg) msg.innerText = 'Selecciona una cámara válida.';
        return;
    }

    // Si ya hay un scanner corriendo, detenerlo antes
    if (html5Qr && scannerRunning) {
        try { await html5Qr.stop(); } catch(e){} finally { scannerRunning = false; }
    }

    if (!html5Qr) html5Qr = generate_qr();
    const config = { fps: 10, qrbox: 250 };

    // start con cameraId string (mejor compatibilidad)
    html5Qr.start(
        cameraId,
        config,
        onSuccess,
        onFailure
    ).then(() => {
        scannerRunning = true;
        const msg = document.getElementById('scanner-message');
        if (msg) msg.innerText = 'Cámara iniciada';
    }).catch(err => {
        scannerRunning = false;
        const msg = document.getElementById('scanner-message');
        if (msg) msg.innerText = `Error iniciando cámara: ${err}`;
        console.warn('start error:', err);
    });
}

function isUrl(s){
    return typeof s === 'string' && /^https?:\/\//i.test(s);
}

function sendToBackend(data){
    // Evitar reenvío si es el mismo valor que se envió justo antes
    if (data === lastSentData) return Promise.resolve({ skipped: true });
    lastSentData = data;

    const payload = { data, timestamp: new Date().toISOString() };
    return fetch(BACKEND_POST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(async res => {
        const text = await res.text().catch(()=>null);
        if (!res.ok) throw new Error(`HTTP ${res.status} ${text || ''}`);
        return { ok: true, status: res.status, body: text };
    });
}

function onSuccess(decodedText, decodedResult){
    // Normalizar el valor si la librería devuelve un objeto con decodedText
    let value = decodedText && decodedText.decodedText ? decodedText.decodedText : decodedText;
    const msg = document.getElementById("scanner-message");
    if (msg) msg.innerText = `Resultado: ${value}`;
    console.log("QR decoded:", value, decodedResult);

    // Detener la cámara si está corriendo (intento seguro)
    if (html5Qr && scannerRunning) {
        html5Qr.stop().then(()=>{ scannerRunning = false; }).catch(()=>{ scannerRunning = false; });
    }

    // Enviar al backend (no bloquear la UI)
    sendToBackend(value).then(r => {
        const statusEl = document.getElementById('post-status');
        if (statusEl) {
            statusEl.innerText = r && r.skipped ? 'Ya enviado (omitido)' : `Enviado al servidor (status ${r.status})`;
        }
    }).catch(err => {
        const statusEl = document.getElementById('post-status');
        if (statusEl) statusEl.innerText = `Error enviando al servidor: ${err}`;
        console.warn('Post error', err);
    });

    // Si es una URL, abrir en nueva pestaña (no redirección automática)
    if (isUrl(value)){
        const linkContainer = document.getElementById('result-link');
        if (linkContainer) linkContainer.innerHTML = `<a href="${value}" target="_blank">Abrir URL detectada</a>`;
        return;
    }

    const linkContainer = document.getElementById('result-link');
    if (linkContainer) {
        const escaped = (''+value).replace(/"/g, '&quot;');
        linkContainer.innerHTML = `
            <div>Texto leído: <span id="decoded-text">${escaped}</span></div>
            <button id="copy-btn">Copiar</button>
            <div id="post-status" style="margin-top:6px;color:#080"></div>
        `;
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn && navigator.clipboard) copyBtn.addEventListener('click', ()=> navigator.clipboard.writeText(value));
    }
}

function onFailure(error){
    // Filtrar errores de parse esperados para evitar spam en consola
    const msg = (typeof error === 'string') ? error : (error && error.message) || '';
    if (msg.includes('QR code parse error') || msg.includes('No MultiFormat') || msg.includes('No MultiFormat Reader')){
        // silencioso: estos ocurren continuamente cuando no hay QR en el frame
        return;
    }

    // Mostrar solo errores relevantes
    console.warn('QR scan error:', error);
    const ui = document.getElementById('scanner-message');
    if (ui) ui.innerText = `Error: ${msg}`;
}

function scanFileFromInput(file){
    if (!file) return Promise.reject('No file');
    const ui = document.getElementById('scanner-message');
    if (ui) ui.innerText = 'Escaneando imagen...';

    // html5-qrcode v2 tiene scanFileV2, si no existe, intentar scanFile
    if (!html5Qr) html5Qr = generate_qr();

    // Si la cámara está corriendo, detenerla temporalmente antes de escanear archivo
    const safeStop = async () => {
        if (!html5Qr) return;
        if (!scannerRunning) return;
        try {
            await html5Qr.stop();
        } catch(e){
            // Ignorar errores donde el scanner ya no está corriendo
        } finally {
            scannerRunning = false;
        }
    };

    return safeStop().then(() => {
        if (typeof html5Qr.scanFileV2 === 'function'){
            return html5Qr.scanFileV2(file, true).then(result => {
                onSuccess(result, null);
                return result;
            }).catch(err => { onFailure(err); throw err; });
        }

        if (typeof html5Qr.scanFile === 'function'){
            return html5Qr.scanFile(file, true).then(result => {
                onSuccess(result, null);
                return result;
            }).catch(err => { onFailure(err); throw err; });
        }

        const err = 'La función de escaneo desde archivo no está disponible en esta versión de html5-qrcode.';
        if (ui) ui.innerText = err;
        return Promise.reject(err);
    });

    const err = 'La función de escaneo desde archivo no está disponible en esta versión de html5-qrcode.';
    if (ui) ui.innerText = err;
    return Promise.reject(err);
}

function initQr(){
    html5Qr = generate_qr();
    const config = { fps: 10, qrbox: 250 };

    // Intentamos poblar la lista de cámaras para que el usuario elija
    populateCameraList().then(()=>{
        // Si hay una cámara en el selector, iniciarla automáticamente
        const sel = document.getElementById('camera-select');
        if (sel && sel.options && sel.options.length>0 && sel.value) {
            startCameraById(sel.value);
        } else if (sel && sel.options && sel.options.length>0 && sel.options[0].value){
            // si no hay valor seleccionado explícito, tomar el primero válido
            const firstValid = Array.from(sel.options).find(o => o.value);
            if (firstValid) startCameraById(firstValid.value);
        } else {
            // fallback: intentar start con facingMode (poco fiable en algunos setups)
            html5Qr.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, onSuccess, onFailure)
                .then(()=>{ scannerRunning = true; })
                .catch(err => {
                    const msg = document.getElementById("scanner-message");
                    if (msg) msg.innerText = `Error inicializando cámara: ${err}`;
                });
        }
    }).catch(()=>{
        // en caso de fallo al listar, intentamos arrancar con facingMode
        html5Qr.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, onSuccess, onFailure)
            .then(()=>{ scannerRunning = true; })
            .catch(err => {
                const msg = document.getElementById("scanner-message");
                if (msg) msg.innerText = `Error inicializando cámara: ${err}`;
            });
    });

    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', async () => {
            if (!html5Qr) return;
            if (!scannerRunning) {
                const msg = document.getElementById('scanner-message');
                if (msg) msg.innerText = 'Escaneo detenido (no estaba corriendo)';
                return;
            }
            try {
                await html5Qr.stop();
                scannerRunning = false;
                const msg = document.getElementById('scanner-message');
                if (msg) msg.innerText = 'Escaneo detenido';
            } catch(e){
                // Si el stop falla porque ya estaba detenido, no mostrar error molesto
                console.warn('Error stopping scanner (ignored)', e);
                scannerRunning = false;
            }
        });
    }

    // File input handler
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', (ev) => {
            const f = ev.target.files && ev.target.files[0];
            if (f) {
                scanFileFromInput(f).catch(()=>{});
            }
            // limpiar el input para permitir volver a subir el mismo archivo
            fileInput.value = '';
        });
    }

    // Camera selector and buttons wiring
    const sel = document.getElementById('camera-select');
    const startBtn = document.getElementById('start-camera');
    const stopBtn = document.getElementById('stop-camera');
    if (startBtn) startBtn.addEventListener('click', ()=>{
        const camId = (sel && sel.value) ? sel.value : null;
        if (camId) startCameraById(camId);
        else {
            // fallback: try facingMode
            if (html5Qr) html5Qr.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, onSuccess, onFailure)
                .then(()=>{ scannerRunning = true; })
                .catch(err=>{ const msg = document.getElementById('scanner-message'); if (msg) msg.innerText = `Error: ${err}`; });
        }
    });
    if (stopBtn) stopBtn.addEventListener('click', async ()=>{
        if (!html5Qr || !scannerRunning){ const msg = document.getElementById('scanner-message'); if (msg) msg.innerText = 'Escaneo detenido (no estaba corriendo)'; return; }
        try { await html5Qr.stop(); scannerRunning = false; const msg = document.getElementById('scanner-message'); if (msg) msg.innerText = 'Escaneo detenido'; } catch(e){ console.warn('stop error', e); scannerRunning = false; }
    });
}

window.addEventListener("DOMContentLoaded", initQr);
