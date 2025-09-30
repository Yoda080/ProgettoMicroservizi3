import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// URL del tuo Bank Service (DEVE corrispondere alla porta 5004 del container)
const BANK_SERVICE_URL = 'http://localhost:5004/api/payments';

const BankDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');
    
    const [balance, setBalance] = useState('N/A');
    const [depositAmount, setDepositAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchBalance();
    }, [token, navigate]);

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
            // Assumiamo che la risposta sia { balance: 123.45 }
            setBalance(response.data.balance.toFixed(2)); 
        } catch (error) {
            console.error("Errore nel recupero del saldo:", error.response || error);
            setMessage(`Errore: ${error.response?.status === 401 ? 'Non Autorizzato. Rilogga.' : 'Impossibile connettersi al Bank Service.'}`);
            setBalance('Errore');
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
            const response = await axios.post(`${BANK_SERVICE_URL}/deposit`, 
            { amount: amount, currency: "EUR" }, // Payload richiesto dal C#
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Aggiorna il saldo e mostra un messaggio di successo
            setBalance(response.data.newBalance.toFixed(2));
            setMessage(`Successo! Depositati €${amount.toFixed(2)}. Nuovo Saldo: €${response.data.newBalance.toFixed(2)}`);
            setDepositAmount(''); // Reset campo
        } catch (error) {
            console.error("Errore nel deposito:", error.response || error);
            setMessage(`Errore nel deposito: ${error.response?.data?.message || 'Problema di connessione o autorizzazione.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <button 
                onClick={() => navigate('/dashboard')} 
                style={styles.backButton}>
                &larr; Torna alla Dashboard
            </button>
            <h1 style={styles.header}>Gestione Conto Banca</h1>
            
            <div style={styles.card}>
                <h2 style={styles.cardTitle}>Saldo Attuale</h2>
                <p style={styles.balanceText}>
                    {loading ? 'Caricamento...' : `€ ${balance}`}
                </p>
                <button onClick={fetchBalance} style={styles.refreshButton} disabled={loading}>
                    Aggiorna Saldo
                </button>
            </div>

            <div style={styles.formCard}>
                <h2 style={styles.cardTitle}>Effettua Deposito</h2>
                <form onSubmit={handleDeposit}>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Importo (€)"
                        style={styles.inputField}
                        required
                        disabled={loading}
                    />
                    <button type="submit" style={styles.depositButton} disabled={loading}>
                        {loading ? 'Elaborazione...' : 'Conferma Deposito'}
                    </button>
                </form>
                {message && (
                    <p style={message.startsWith('Errore') ? styles.errorMessage : styles.successMessage}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

// Stili base per un aspetto accettabile (usa Tailwind/CSS esterni per la produzione)
const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    header: {
        fontSize: '2em',
        fontWeight: 'bold',
        color: '#1f2937',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '10px',
        marginBottom: '20px'
    },
    backButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#4f46e5',
        cursor: 'pointer',
        marginBottom: '15px',
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        marginBottom: '20px',
        textAlign: 'center'
    },
    formCard: {
        backgroundColor: '#fefefe',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        marginBottom: '20px'
    },
    cardTitle: {
        fontSize: '1.5em',
        color: '#374151',
        marginBottom: '15px'
    },
    balanceText: {
        fontSize: '3em',
        fontWeight: 'bolder',
        color: '#10b981' // Green
    },
    inputField: {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        boxSizing: 'border-box'
    },
    depositButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s'
    },
    refreshButton: {
        padding: '8px 15px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s'
    },
    errorMessage: {
        color: '#ef4444',
        marginTop: '10px',
        fontWeight: '500'
    },
    successMessage: {
        color: '#10b981',
        marginTop: '10px',
        fontWeight: '500'
    }
};

export default BankDashboard;
