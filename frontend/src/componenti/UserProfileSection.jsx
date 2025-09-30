import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

// URL dei servizi
const USER_SERVICE_URL = 'http://localhost:5001/api/Auth';
const BANK_SERVICE_URL = 'http://localhost:5004/api/payments';

const UserProfileSection = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');
    
    const [profile, setProfile] = useState(null);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const cachedUsername = localStorage.getItem('username');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                // Fetch parallelo di profilo e saldo
                const [profileResponse, balanceResponse] = await Promise.all([
                    axios.get(`${USER_SERVICE_URL}/me`, config),
                    axios.get(`${BANK_SERVICE_URL}/balance`, config)
                ]);
                
                setProfile(profileResponse.data);
                setBalance(balanceResponse.data.balance);
            } catch (err) {
                console.error("Errore nel recupero dei dati:", err.response || err);
                
                // Gestione errori specifica
                if (err.response?.status === 404) {
                    setError("Endpoint non trovato. Verifica che i servizi siano attivi.");
                } else if (err.response?.status === 401) {
                    setError("Token non valido. Effettua nuovamente il login.");
                    localStorage.removeItem('authToken');
                    navigate('/login');
                } else {
                    setError("Impossibile caricare i dati del profilo. Riprova più tardi.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token, navigate]);

    // Funzione per determinare la classe del saldo
    const getBalanceClass = () => {
        if (balance === null) return 'balance-neutral';
        return balance >= 0 ? 'balance-positive' : 'balance-negative';
    };

    return (
        <div className="profile-container">
            <button 
                onClick={() => navigate('/dashboard')} 
                className="back-button"
            >
                &larr; Torna alla Dashboard
            </button>
            <h1 className="profile-header">Dettagli del Tuo Account</h1>
            
            {loading && <p className="loading-text">Caricamento dati...</p>}
            {error && <div className="error-message">{error}</div>}

            {profile && (
                <div className="profile-card">
                    <h2 className="profile-card-title">Profilo Utente</h2>
                    <div className="detail-row">
                        <span className="detail-label">Nome Utente:</span>
                        <span className="detail-value">{profile.username || cachedUsername || 'Non Specificato'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{profile.email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">ID Utente:</span>
                        <span className="detail-value">{profile.userId || profile.id || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Registrato il:</span>
                        <span className="detail-value">
                            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('it-IT') : 'N/A'}
                        </span>
                    </div>
                    {/* SEZIONE SALDO */}
                    <div className="detail-row">
                        <span className="detail-label">Saldo Conto:</span>
                        <span className={`detail-value balance-text ${getBalanceClass()}`}>
                            {balance !== null ? `${balance.toFixed(2)} €` : 'N/A'}
                        </span>
                    </div>
                </div>
            )}
            
            <p className="info-text">
                Questi dati sono gestiti e forniti dai microservizi utente e banca.
            </p>
        </div>
    );
};

export default UserProfileSection;