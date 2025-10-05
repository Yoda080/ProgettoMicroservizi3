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

    useEffect(() => {
        console.log('👤 useEffect - Caricamento dati profilo');
        
        if (!token) {
            console.log('❌ Token mancante');
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
                    console.log('✅ Balance loaded:', balanceData.balance);
                } else {
                    console.warn('⚠️ Servizio balance non disponibile');
                    setBalance(50.00);
                }
            } catch (balanceError) {
                console.warn('⚠️ Errore balance:', balanceError.message);
                setBalance(50.00);
            }

            // ✅ RENTALS - CARICA DAL LOCALSTORAGE
            try {
                console.log('📡 Caricamento rentals dal localStorage...');
                const storedRentals = JSON.parse(localStorage.getItem('userRentals') || '[]');
                console.log('📦 Dati RAW dal localStorage:', storedRentals);
                
                // Filtra solo i noleggi attivi (non scaduti)
                const activeRentals = storedRentals.filter(rental => {
                    if (!rental.expirationDate) return false;
                    
                    const expirationDate = new Date(rental.expirationDate);
                    const now = new Date();
                    const isActive = expirationDate > now;
                    
                    console.log(`🎬 Film: ${rental.movieTitle}, Scadenza: ${expirationDate}, Attivo: ${isActive}`);
                    return isActive;
                });
                
                console.log(`✅ ${activeRentals.length} noleggi attivi dal localStorage:`, activeRentals);
                setRentals(activeRentals);
                
            } catch (rentalsError) {
                console.warn('⚠️ Errore caricamento rentals dal localStorage:', rentalsError);
                setRentals([]);
            }

        } catch (err) {
            console.error("❌ Errore critico:", err);
            setError("Errore nel caricamento dei dati: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        console.log('👤 Refresh manuale');
        fetchUserData();
    };

    // ✅ RENDERIZZA I NOLEGGI DINAMICAMENTE
    const renderRentals = () => {
        console.log('🎬 Rendering rentals:', rentals);
        
        if (rentals.length === 0) {
            return (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Nessun noleggio attivo</p>
                    <p className="text-gray-400 text-sm mt-2">
                        I noleggi acquistati appariranno qui automaticamente
                    </p>
                </div>
            );
        }

        return (
            <div className="rentals-grid">
                {rentals.map((rental, index) => {
                    console.log('🎬 Rendering rental:', rental);
                    
                    const expirationDate = new Date(rental.expirationDate);
                    const rentalDate = new Date(rental.rentalDate || rental.createdAt);
                    const now = new Date();
                    const hoursRemaining = Math.floor((expirationDate - now) / (1000 * 60 * 60));
                    
                    let status, statusText, statusIcon, statusClass;
                    
                    if (hoursRemaining <= 0) {
                        status = 'expired';
                        statusText = 'Scaduto';
                        statusIcon = <AlertTriangle className="w-4 h-4 inline mr-1" />;
                        statusClass = 'expired';
                    } else if (hoursRemaining <= 24) {
                        status = 'warning';
                        statusText = `Scade in ${hoursRemaining}h`;
                        statusIcon = <Clock className="w-4 h-4 inline mr-1" />;
                        statusClass = 'warning';
                    } else {
                        status = 'active';
                        const daysRemaining = Math.floor(hoursRemaining / 24);
                        statusText = `Scade in ${daysRemaining} giorni`;
                        statusIcon = <CheckCircle className="w-4 h-4 inline mr-1" />;
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
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>Acquistato: {rentalDate.toLocaleDateString('it-IT')}</span>
                                </div>
                                <div className="rental-detail">
                                    <Clock className="w-4 h-4 text-gray-500" />
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