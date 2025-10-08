import React, { useState, useEffect } from 'react';
import { Film, Calendar, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';


const UserProfileSection = ({ onBack, onNavigate }) => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    const [profile, setProfile] = useState(null);
    const [balance, setBalance] = useState(null);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            setError("Token di autenticazione mancante.");
            setLoading(false);
            return;
        }
        fetchUserData();
    }, [token]);

    const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const baseProfile = {
                userId: userId || 'ID-non-disponibile',
                username: username || 'Utente',
                email: 'email@example.com',
                createdAt: new Date().toISOString()
            };
            
            setProfile(baseProfile);

            try {
                const balanceResponse = await fetch('http://localhost:5004/api/payments/balance', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (balanceResponse.ok) {
                    const balanceData = await balanceResponse.json();
                    setBalance(balanceData.balance);
                } else {
                    setBalance(50.00);
                }
            } catch {
                setBalance(50.00);
            }

            try {
                const storedRentals = JSON.parse(localStorage.getItem('userRentals') || '[]');
                const activeRentals = storedRentals.filter(rental => {
                    if (!rental.expirationDate) return false;
                    const expirationDate = new Date(rental.expirationDate);
                    return expirationDate > new Date();
                });
                setRentals(activeRentals);
            } catch {
                setRentals([]);
            }

        } catch (err) {
            setError("Errore nel caricamento dei dati: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchUserData();
    };

    const renderRentals = () => {
        if (rentals.length === 0) {
            return (
                <div className="empty-state">
                    <Film className="empty-state-icon" size={64} />
                    <p className="empty-state-title">Nessun noleggio attivo</p>
                    <p className="empty-state-description">
                        I noleggi acquistati appariranno qui automaticamente
                    </p>
                </div>
            );
        }

        return (
            <div className="rentals-grid">
                {rentals.map((rental, index) => {
                    const expirationDate = new Date(rental.expirationDate);
                    const rentalDate = new Date(rental.rentalDate || rental.createdAt);
                    const now = new Date();
                    const hoursRemaining = Math.floor((expirationDate - now) / (1000 * 60 * 60));
                    
                    let statusText, statusIcon, statusClass;
                    
                    if (hoursRemaining <= 0) {
                        statusText = 'Scaduto';
                        statusIcon = <AlertTriangle size={16} />;
                        statusClass = 'expired';
                    } else if (hoursRemaining <= 24) {
                        statusText = `Scade in ${hoursRemaining}h`;
                        statusIcon = <Clock size={16} />;
                        statusClass = 'warning';
                    } else {
                        const daysRemaining = Math.floor(hoursRemaining / 24);
                        statusText = `Scade in ${daysRemaining} giorni`;
                        statusIcon = <CheckCircle size={16} />;
                        statusClass = 'active';
                    }
                    
                    return (
                        <div key={rental.id || `rental-${index}`} className="rental-card">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="rental-title">
                                    {rental.movieTitle || rental.title || 'Film senza titolo'}
                                </h3>
                                <span className={`rental-status ${statusClass}`}>
                                    {statusIcon}
                                    {statusText}
                                </span>
                            </div>
                            
                            <div className="rental-details">
                                <div className="rental-detail">
                                    <Calendar size={16} />
                                    <span>Acquistato: {rentalDate.toLocaleDateString('it-IT')}</span>
                                </div>
                                <div className="rental-detail">
                                    <Clock size={16} />
                                    <span>Scade: {expirationDate.toLocaleDateString('it-IT')}</span>
                                </div>
                                {rental.price && (
                                    <div className="rental-detail">
                                        <span className="text-green-600 font-semibold">
                                            Prezzo: €{rental.price.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const getBalanceClass = () => {
        if (balance === null) return 'balance-neutral';
        return balance >= 0 ? 'balance-positive' : 'balance-negative';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="text-center">
                    <RefreshCw className="loading-spinner" size={48} />
                    <p className="text-xl text-gray-700 font-semibold mt-4">Caricamento profilo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="back-button">
                    &larr; Torna alla Dashboard
                </button>
                <button onClick={handleRefresh} className="refresh-button">
                    <RefreshCw size={16} />
                    Aggiorna Dati
                </button>
            </div>
            
            <h1 className="profile-header">Dettagli del Tuo Account</h1>

            {error && (
                <div className="error-message">
                    <strong>Attenzione:</strong> {error}
                </div>
            )}

            {profile && (
                <div className="profile-content">
                    <div className="profile-card">
                        <h2 className="profile-card-title">Profilo Utente</h2>
                        <div className="detail-row">
                            <span className="detail-label">Nome Utente:</span>
                            <span className="detail-value">{profile.username}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{profile.email}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">ID Utente:</span>
                            <span className="detail-value">{profile.userId}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Saldo Conto:</span>
                            <span className={`detail-value balance-text ${getBalanceClass()}`}>
                                € {balance?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    </div>

                    <div className="profile-card">
                        <h2 className="profile-card-title">
                            <Film size={24} />
                            I Miei Noleggi Attivi ({rentals.length})
                        </h2>
                        {renderRentals()}
                    </div>

                    <div className="profile-card">
                        <h2 className="profile-card-title">Statistiche Account</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="stat-card">
                                <h3 className="stat-title">Noleggi Attivi</h3>
                                <p className="stat-value">{rentals.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3 className="stat-title">Saldo Attuale</h3>
                                <p className="stat-value">€ {balance?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="stat-card">
                                <h3 className="stat-title">Stato Account</h3>
                                <p className="stat-value text-green-600">Attivo</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfileSection;