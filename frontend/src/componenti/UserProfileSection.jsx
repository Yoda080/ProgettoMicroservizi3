import React, { useState, useEffect } from 'react';
import { Film, Calendar, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import './Dashboard.css';

const UserProfileSection = ({ onBack, onNavigate }) => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    const [profile, setProfile] = useState(null);
    const [balance, setBalance] = useState(null);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ RIMUOVI dataLoaded e usa un approccio più semplice

    useEffect(() => {
        console.log('👤 useEffect - Caricamento dati profilo');
        
        if (!token) {
            console.log('❌ Token mancante');
            setError("Token di autenticazione mancante.");
            setLoading(false);
            return;
        }

        fetchUserData();
    }, [token]); // ✅ Solo token come dipendenza

    const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // ✅ PROFILO BASE
            const baseProfile = {
                userId: userId || 'ID-non-disponibile',
                username: username || 'Utente',
                email: 'email@example.com',
                createdAt: new Date().toISOString()
            };
            
            setProfile(baseProfile);

            // ✅ BALANCE
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
            } catch (balanceError) {
                setBalance(50.00);
            }

            // ✅ RENTALS - APPROCCIO SEMPLICE
            try {
                const rentalsResponse = await fetch('http://localhost:5003/api/rentals/my-rentals', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (rentalsResponse.ok) {
                    const rentalsData = await rentalsResponse.json();
                    console.log('✅ Dati rentals ricevuti:', rentalsData);
                    
                    // Gestisci diverse strutture di risposta
                    if (rentalsData.rentals && Array.isArray(rentalsData.rentals)) {
                        setRentals(rentalsData.rentals);
                    } else if (Array.isArray(rentalsData)) {
                        setRentals(rentalsData);
                    } else if (rentalsData.success && rentalsData.data) {
                        setRentals(rentalsData.data);
                    } else {
                        setRentals([]);
                    }
                } else {
                    setRentals([]);
                }
            } catch (rentalsError) {
                console.error('Errore rentals:', rentalsError);
                setRentals([]);
            }

        } catch (err) {
            console.error("Errore critico:", err);
            setError("Errore nel caricamento dei dati: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        console.log('👤 Refresh manuale');
        fetchUserData(); // ✅ Ricarica semplice
    };

    // ✅ RENDERIZZA I NOLEGGI DINAMICAMENTE
    const renderRentals = () => {
        if (rentals.length === 0) {
            return (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nessun noleggio attivo</p>
                </div>
            );
        }

        return (
            <div className="rentals-grid">
                {rentals.map((rental, index) => {
                    const expirationDate = rental.expirationDate || rental.expiresAt;
                    const rentalDate = rental.rentalDate || rental.createdAt;
                    
                    return (
                        <div key={rental._id || rental.movieId || index} className="rental-card">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="rental-title">
                                    {rental.movieTitle || rental.title || 'Film senza titolo'}
                                </h3>
                                <span className="rental-status active">
                                    <CheckCircle className="w-4 h-4 inline mr-1" />
                                    Attivo
                                </span>
                            </div>
                            
                            <div className="rental-details">
                                <div className="rental-detail">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>Iniziato: {new Date(rentalDate).toLocaleDateString()}</span>
                                </div>
                                {expirationDate && (
                                    <div className="rental-detail">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span>Scade: {new Date(expirationDate).toLocaleDateString()}</span>
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mb-4 mx-auto" />
                    <p className="text-xl text-gray-700 font-semibold">Caricamento profilo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={onBack}
                    className="back-button"
                >
                    &larr; Torna alla Dashboard
                </button>
                <button
                    onClick={handleRefresh}
                    className="refresh-button flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
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

                    {/* ✅ SEZIONE NOLEGGI AGGIORNATA */}
                    <div className="profile-card">
                        <h2 className="profile-card-title flex items-center">
                            <Film className="w-6 h-6 mr-2 text-blue-600" />
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