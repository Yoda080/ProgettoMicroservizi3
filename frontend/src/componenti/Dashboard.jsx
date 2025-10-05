import React from 'react';
import './Dashboard.css';

const Dashboard = ({ onNavigate }) => {  // ✅ Ricevi onNavigate come prop
    const username = localStorage.getItem('username') || 'Utente';
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    const handleLogout = () => {
        console.log('🚪 Logout in corso...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        // 🔥 Redirect completo per pulire lo stato
        window.location.href = '/';
    };

    const handleFilmCatalog = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            if (onNavigate) onNavigate('login');
            return;
        }
        console.log('🎬 Navigazione al catalogo film...');
        if (onNavigate) {
            onNavigate('filmCatalog');
        } else {
            window.location.href = '/#/filmCatalog';
        }
    };

    const handleRentals = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            if (onNavigate) onNavigate('login');
            return;
        }
        console.log('📚 Navigazione ai noleggi...');
        if (onNavigate) {
            onNavigate('rentals');
        } else {
            window.location.href = '/#/rentals';
        }
    };

    const handleUserProfile = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            if (onNavigate) onNavigate('login');
            return;
        }
        console.log('👤 Navigazione al profilo...');
        if (onNavigate) {
            onNavigate('profile');
        } else {
            window.location.href = '/#/profile';
        }
    };

    const handleBank = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            if (onNavigate) onNavigate('login');
            return;
        }
        console.log('💰 Navigazione alla banca...');
        if (onNavigate) {
            onNavigate('bank');
        } else {
            window.location.href = '/#/bank';
        }
    };

    // Se non c'è il token, redirect al login
    if (!token) {
        console.log('❌ Nessun token, redirect al login');
        if (onNavigate) {
            onNavigate('login');
        } else {
            window.location.href = '/#/login';
        }
        return null;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-title">🎬 Movie Rental Dashboard</h1>
                <div className="user-section">
                    <div className="user-info">
                        <span className="welcome-message">Ciao, <strong>{username}</strong>!</span>
                        <span className="user-id">ID: {userId}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        🚪 Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="welcome-banner">
                    <h2>Benvenuto nella tua Dashboard</h2>
                    <p>Scegli una delle seguenti opzioni per iniziare</p>
                </div>

                <div className="dashboard-sections">
                    {/* 1. Card Catalogo Film */}
                    <div className="dashboard-card film-card">
                        <div className="card-icon">🎬</div>
                        <h3>Catalogo Film</h3>
                        <p>Esplora il nostro catalogo completo di film disponibili per il noleggio</p>
                        <button
                            onClick={handleFilmCatalog}
                            className="card-button primary"
                        >
                            📋 Vai al Catalogo
                        </button>
                    </div>

                    {/* 2. Card I miei Noleggi */}
                    <div className="dashboard-card rentals-card">
                        <div className="card-icon">📚</div>
                        <h3>I miei Noleggi</h3>
                        <p>Visualizza e gestisci i film che hai attualmente in noleggio</p>
                        <button
                            onClick={handleRentals}
                            className="card-button rentals"
                        >
                            🕒 Vai ai Noleggi
                        </button>
                    </div>

                    {/* 3. Card Profilo Utente */}
                    <div className="dashboard-card profile-card">
                        <div className="card-icon">👤</div>
                        <h3>Profilo Utente</h3>
                        <p>Gestisci il tuo profilo, visualizza statistiche e storico attività</p>
                        <button
                            onClick={handleUserProfile}
                            className="card-button profile"
                        >
                            ⚙️ Vedi Profilo
                        </button>
                    </div>

                    {/* 4. Card Servizio Banca/Credito */}
                    <div className="dashboard-card bank-card">
                        <div className="card-icon">💰</div>
                        <h3>Gestione Credito</h3>
                        <p>Controlla il tuo saldo, deposita fondi e visualizza le transazioni</p>
                        <button
                            onClick={handleBank}
                            className="card-button bank"
                        >
                            💳 Vai al Conto
                        </button>
                    </div>
                </div>

                {/* Debug Info */}
                <div className="debug-section">
                    <h4>🔍 Informazioni Debug</h4>
                    <div className="debug-info">
                        <p><strong>Token:</strong> {token ? '✅ Presente' : '❌ Assente'}</p>
                        <p><strong>User ID:</strong> {userId || 'N/A'}</p>
                        <p><strong>Username:</strong> {username}</p>
                        <p><strong>Session:</strong> Attiva</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;