import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

// URL del tuo Bank Service
const BANK_SERVICE_URL = 'http://localhost:5004/api/payments';

const BankDashboard = ({ onBack }) => {  // ✅ Ricevi onBack come prop invece di useNavigate
    const token = localStorage.getItem('authToken');
    
    const [balance, setBalance] = useState(null);
    const [depositAmount, setDepositAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            // ✅ Usa la navigazione manuale invece di useNavigate
            if (onBack) {
                onBack();
            } else {
                window.location.href = '/#/login';
            }
            return;
        }
        fetchBalance();
    }, [token, onBack]);  // ✅ Aggiungi onBack alle dipendenze

    // ✅ FUNZIONE PER TORNARE ALLA DASHBOARD
    const handleBackToDashboard = () => {
        if (onBack) {
            onBack();
        } else {
            window.location.href = '/#/dashboard';
        }
    };

    // Funzione per recuperare il saldo dal Bank Service
    const fetchBalance = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.get(`${BANK_SERVICE_URL}/balance`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setBalance(response.data.balance);
        } catch (error) {
            console.error("Errore nel recupero del saldo:", error.response || error);
            setMessage(`Errore: ${error.response?.status === 401 ? 'Non Autorizzato. Rilogga.' : 'Impossibile connettersi al Bank Service.'}`);
            setBalance(null);
        } finally {
            setLoading(false);
        }
    };

    // Funzione per effettuare un deposito
    const handleDeposit = async (e) => {
        e.preventDefault();
        const amount = parseFloat(depositAmount);

        if (isNaN(amount) || amount <= 0) {
            setMessage("Inserisci un importo valido.");
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // CORREZIONE: Il payload deve corrispondere al modello C# DepositRequest
            const response = await axios.post(`${BANK_SERVICE_URL}/deposit`, 
            { 
                Amount: amount,  // "Amount" con A maiuscola come in C#
                Currency: "EUR"  // "Currency" con C maiuscola
            }, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Aggiorna il saldo e mostra un messaggio di successo
            setBalance(response.data.newBalance);
            setMessage(`Successo! Depositati €${amount.toFixed(2)}. Nuovo Saldo: €${response.data.newBalance.toFixed(2)}`);
            setDepositAmount('');
        } catch (error) {
            console.error("Errore nel deposito:", error.response || error);
            setMessage(`Errore nel deposito: ${error.response?.data?.message || 'Problema di connessione o autorizzazione.'}`);
        } finally {
            setLoading(false);
        }
    };

    // Determina la classe CSS per il saldo in base al valore
    const getBalanceClass = () => {
        if (balance === null) return 'balance-neutral';
        return balance >= 0 ? 'balance-positive' : 'balance-negative';
    };

    // Determina la classe CSS per il messaggio
    const getMessageClass = () => {
        return message.startsWith('Errore') ? 'error-message' : 'success-message';
    };

    return (
        <div className="bank-container">
            <button 
                onClick={handleBackToDashboard}  // ✅ Usa la funzione helper
                className="back-button"
            >
                &larr; Torna alla Dashboard
            </button>
            <h1 className="bank-header">Gestione Conto Banca</h1>
            
            <div className="balance-card">
                <h2 className="card-title">Saldo Attuale</h2>
                <p className={`balance-text ${getBalanceClass()}`}>
                    {loading ? 'Caricamento...' : balance !== null ? `€ ${balance.toFixed(2)}` : 'N/A'}
                </p>
                <button 
                    onClick={fetchBalance} 
                    className="refresh-button" 
                    disabled={loading}
                >
                    Aggiorna Saldo
                </button>
            </div>

            <div className="form-card">
                <h2 className="card-title">Effettua Deposito</h2>
                <form onSubmit={handleDeposit}>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Importo (€)"
                        className="input-field"
                        required
                        disabled={loading}
                    />
                    <button 
                        type="submit" 
                        className={`deposit-button ${loading ? 'button-disabled' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Elaborazione...' : 'Conferma Deposito'}
                    </button>
                </form>
                {message && (
                    <p className={getMessageClass()}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default BankDashboard;