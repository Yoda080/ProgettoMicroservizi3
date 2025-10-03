const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Sarà necessario per il controllo del token

// Funzione di utilità per verificare l'autenticazione (Mocking)
const mockAuthentication = (req, res, next) => {
    // Il token viene inviato dal frontend nel header "Authorization"
    const authHeader = req.headers.authorization;
    
    // Controlliamo se l'header è presente e ha il formato "Bearer [token]"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // 401: Unauthorized - Manca il token
        console.log("Tentativo di accesso senza token.");
        return res.status(401).json({ error: "Accesso negato. Token non fornito." });
    }

    const token = authHeader.split(' ')[1];
    
    // In un'applicazione reale, qui verificheresti il token (es. jwt.verify(token, secret))
    // Per ora, simuliamo il successo se il token è presente.
    if (token) {
        // Se c'è un token (anche se fittizio), passiamo alla funzione successiva (il controller)
        // In una vera app, qui decodificheremmo l'userId dal token.
        console.log("Token ricevuto. Autenticazione mock superata.");
        req.userId = 'mock-user-123'; // Aggiungiamo un ID utente di esempio alla richiesta
        next();
    } else {
        // Se per qualche motivo il token non viene estratto
        console.log("Token non valido o malformato.");
        return res.status(401).json({ error: "Token non valido." });
    }
};


/**
 * @route POST /api/rentals/checkout
 * @description Gestisce la richiesta di checkout per il noleggio di film.
 * 1. Verifica l'autenticazione.
 * 2. Simula l'elaborazione del pagamento/noleggio.
 */
router.post('/api/rentals/checkout', mockAuthentication, (req, res) => {
    console.log(`Checkout richiesto da UserId: ${req.userId}`);
    const { items, totalAmount } = req.body;
    
    if (!items || items.length === 0 || !totalAmount) {
        // 400: Bad Request
        return res.status(400).json({ error: "Dati di checkout mancanti o non validi." });
    }

    // --- SIMULAZIONE LOGICA DI BUSINESS ---
    
    // 1. Simula l'invio della richiesta al servizio Bank (in una vera architettura)
    // Qui dovresti fare una fetch POST al tuo Bank Service (es. http://bank-service:5004/api/bank/debit)
    console.log(`Tentativo di addebitare €${totalAmount} per ${items.length} articoli.`);
    
    // 2. Simula la registrazione del noleggio nel database (in una vera architettura)
    
    // --- RISPOSTA DI SUCCESSO ---
    
    // 201: Created - Risposta tipica per la creazione di una nuova risorsa (il noleggio)
    res.status(201).json({ 
        message: "Checkout completato con successo (Mock).",
        rentalId: `RENT-${Date.now()}`,
        itemsProcessed: items.map(item => item.filmId),
        amount: totalAmount,
        status: "Noleggiato"
    });
});


module.exports = router;
