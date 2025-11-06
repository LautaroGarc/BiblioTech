const { URL } = require('url');
const LoanModel = require('../models/loans');
const { getBook, getBooksWith } = require('../models/books');

// Extrae un posible identificador/barcode de la URL o texto
function extractCandidateFromData(raw) {
    if (!raw) return null;
    // Si es URL, parsear
    try {
        const u = new URL(raw);
        // revisar query params comunes
        const keys = ['barcode','barCode','code','id','bookId','book','isbn'];
        for (const k of keys) {
            if (u.searchParams.has(k)) return u.searchParams.get(k);
        }
        // tomar el último segmento del path
        const segs = u.pathname.split('/').filter(Boolean);
        if (segs.length) return segs[segs.length-1];
        return null;
    } catch(e) {
        // no es URL, devolver raw trimmed
        return String(raw).trim();
    }
}

// POST /scan
async function handleScan(req, res) {
    try {
        const data = req.body && req.body.data;
        console.log('[SCAN DATA]', data);
        if (!data) return res.status(400).json({ success: false, message: 'Campo data (URL o texto) requerido' });

        const candidate = extractCandidateFromData(data);
        if (!candidate) return res.status(400).json({ success: false, message: 'No se pudo extraer identificador de la URL' });

        // Intentar identificar por id numérico
        let item = null;
        if (/^\d+$/.test(candidate)) {
            item = await getBook(candidate);
            if (item) {
                // found book by id
                const loanData = {
                    userId: req.user.id,
                    bookId: item.id,
                    // dateOut: por defecto en 14 días
                    dateOut: new Date(Date.now() + 14*24*3600*1000).toISOString().slice(0,10)
                };
                const result = await LoanModel.createBookLoan(loanData);
                return res.status(201).json({ success: true, message: 'Préstamo creado', data: { loanId: result.insertId, book: item } });
            }
        }

        // Buscar por barcode exacto en books o supplies usando LoanModel helper
        const found = await LoanModel.findItemByBarcode(candidate);
        if (found) {
            if (found.type === 'book') {
                const loanData = {
                    userId: req.user.id,
                    bookId: found.id,
                    dateOut: new Date(Date.now() + 14*24*3600*1000).toISOString().slice(0,10)
                };
                const result = await LoanModel.createBookLoan(loanData);
                return res.status(201).json({ success: true, message: 'Préstamo de libro creado', data: { loanId: result.insertId, item: found } });
            } else if (found.type === 'supply') {
                const loanData = {
                    userId: req.user.id,
                    itemId: found.id,
                    dateOut: new Date(Date.now() + 14*24*3600*1000).toISOString().slice(0,10)
                };
                const result = await LoanModel.createSupplyLoan(loanData);
                return res.status(201).json({ success: true, message: 'Préstamo de útil creado', data: { loanId: result.insertId, item: found } });
            }
        }

        // Intentar buscar en la tabla books por campos (barCode)
        const byBar = await getBooksWith('barCode', candidate);
        if (byBar && byBar.length) {
            const b = byBar[0];
            const loanData = {
                userId: req.user.id,
                bookId: b.id,
                dateOut: new Date(Date.now() + 14*24*3600*1000).toISOString().slice(0,10)
            };
            const result = await LoanModel.createBookLoan(loanData);
            return res.status(201).json({ success: true, message: 'Préstamo creado (por búsqueda)', data: { loanId: result.insertId, book: b } });
        }

        return res.status(404).json({ success: false, message: 'No se encontró el libro/ítem correspondiente al identificador' });
    } catch (error) {
        console.error('[SCAN HANDLER ERROR]', error);
        return res.status(500).json({ success: false, message: 'Error al procesar el escaneo' });
    }
}

module.exports = {
    handleScan
};
