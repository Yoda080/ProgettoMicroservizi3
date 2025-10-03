import React, { useState, useEffect, useContext, createContext } from 'react';
import { useNavigate } from 'react-router-dom';

// 🛑 URL del microservizio Bank/Payments
const BANK_SERVICE_URL = 'http://localhost:5004/api/payments';

// 1. Creazione del Context
const WalletContext = createContext();

// Funzione helper per le chiamate fetch
const safeFetch = async (url, config) => {
    const response = await fetch(url, config);
    
    // Gestione errore 401: Token non valido (da gestire esternamente)
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
export const useWallet = () => useContext(WalletContext);

// 3. Provider: WalletProvider
export const WalletProvider = ({ children }) => {
    const [balance, setBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [walletError, setWalletError] = useState(null);
    const navigate = useNavigate();
    
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
                navigate('/login');
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
            const newBalance = data.newBalance; 
            setBalance(newBalance); 
            return newBalance;

        } catch (err) {
             if (err.message === "UNAUTHORIZED") {
                localStorage.removeItem('authToken');
                navigate('/login');
                throw new Error("UNAUTHORIZED");
            }
            throw new Error(err.message || "Errore sconosciuto durante il debito.");
        }
    };
    
    // Carica il saldo all'avvio
    useEffect(() => {
        fetchBalance();
    }, [token, navigate]);

    // Oggetto valore del context
    const contextValue = {
        balance,
        isLoading,
        walletError,
        fetchBalance, // Ricarica manuale
        debitWallet, // Funzione di pagamento
    };

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
};