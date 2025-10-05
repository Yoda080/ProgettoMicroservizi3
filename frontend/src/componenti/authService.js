// src/services/authService.js
export const authService = {
    // Estrai l'user ID dal token - CORRETTA PER IL TUO TOKEN
    getUserIdFromToken: () => {
        const token = localStorage.getItem('authToken');
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('🔍 Token payload:', payload);
            
            // Il tuo token usa 'nameid' invece di 'userId'
            return payload.nameid || payload.userId || payload.id || payload.sub;
        } catch (error) {
            console.error('❌ Errore nel parsing del token:', error);
            return null;
        }
    },

    // Verifica se il token è valido
    isTokenValid: () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('❌ Nessun token trovato');
            return false;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            const isValid = Date.now() < expirationTime;
            
            console.log('🔍 Validità token:', {
                exp: new Date(expirationTime),
                now: new Date(),
                isValid: isValid
            });
            
            return isValid;
        } catch (error) {
            console.error('❌ Errore nella verifica del token:', error);
            return false;
        }
    },

    // Logout
    logout: () => {
        console.log('🚪 Logout in corso...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = '/login';
    },

    // Ottieni tutti i dati dal token
    getTokenData: () => {
        const token = localStorage.getItem('authToken');
        if (!token) return null;

        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (error) {
            console.error('❌ Errore nel parsing del token:', error);
            return null;
        }
    }
};

export default authService;