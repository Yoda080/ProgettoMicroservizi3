import React, { useState, useEffect, useContext, createContext } from 'react';

// 🛑 URL del microservizio Bank/Payments
const BANK_SERVICE_URL = 'http://localhost:5004/api/payments';

// 1. Creazione del Context
const WalletContext = createContext();

// Funzione helper per le chiamate fetch
const safeFetch = async (url, config) => {
    const response = await fetch(url, config);
    
    // Gestione errore 401: Token non valido
    if (response.status === 401) {
        throw new Error("UNAUTHORIZED"); 
    }
    if (!response.ok) {
        let errorText = response.statusText;
        try {
            const errorBody = await response.json();
            errorText = errorBody.message || errorText;
        } catch {}
        throw new Error(`[${response.status}] Errore API: ${errorText}`);
    }
    return await response.json();
};

// 2. Hook Personalizzato: useWallet
export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet deve essere usato dentro un WalletProvider');
    }
    return context;
};

// 3. Provider: WalletProvider (SENZA useNavigate)
export const WalletProvider = ({ children }) => {
    const [balance, setBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [walletError, setWalletError] = useState(null);
    
    const token = localStorage.getItem('authToken');

    // Funzione per recuperare il saldo
    const fetchBalance = async () => {
        if (!token) {
            setWalletError("Token mancante. Effettuare il login.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setWalletError(null);
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const data = await safeFetch(`${BANK_SERVICE_URL}/balance`, config);
            setBalance(data.balance);
        } catch (err) {
            if (err.message === "UNAUTHORIZED") {
                localStorage.removeItem('authToken');
                // ⚠️ NON usare navigate qui - gestiscilo nei componenti
                console.log('🔐 Token scaduto, redirect al login necessario');
                setWalletError("Sessione scaduta. Rieffettua il login.");
            } else {
                setWalletError(`Errore nel caricamento saldo: ${err.message}`);
                setBalance(0);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    // Funzione per effettuare un addebito
    const debitWallet = async (amount) => {
        if (!token) throw new Error("Utente non autorizzato.");
        
        const config = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount })
        };
        
        try {
            const data = await safeFetch(`${BANK_SERVICE_URL}/debit`, config);
            // Assumiamo che l'API restituisca il nuovo saldo
            const newBalance = data.newBalance || data.balance; 
            setBalance(newBalance); 
            return newBalance;

        } catch (err) {
            if (err.message === "UNAUTHORIZED") {
                localStorage.removeItem('authToken');
                // ⚠️ NON usare navigate qui
                console.log('🔐 Token scaduto durante pagamento');
                throw new Error("UNAUTHORIZED");
            }
            throw new Error(err.message || "Errore sconosciuto durante il debito.");
        }
    };
    
    // Carica il saldo all'avvio
    useEffect(() => {
        fetchBalance();
    }, [token]); // ⚠️ Rimuovi navigate dalle dipendenze

    // Oggetto valore del context
    const contextValue = {
        balance,
        isLoading,
        walletError,
        fetchBalance,
        debitWallet,
    };

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
};