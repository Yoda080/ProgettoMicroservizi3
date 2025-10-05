import React from 'react';
import './Dashboard.css';

const Dashboard = ({ onNavigate }) => {
    const username = localStorage.getItem('username') || 'Utente';
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = '/';
    };

    const handleFilmCatalog = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            if (onNavigate) onNavigate('login');
            return;
        }
        if (onNavigate) {
            onNavigate('filmCatalog');
        }
    };

    const handleRentals = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            if (onNavigate) onNavigate('login');
            return;
        }
        if (onNavigate) {
            onNavigate('rentals');
        }
    };

    const handleUserProfile = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            if (onNavigate) onNavigate('login');
            return;
        }
        if (onNavigate) {
            onNavigate('profile');
        }
    };

    const handleBank = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            if (onNavigate) onNavigate('login');
            return;
        }
        if (onNavigate) {
            onNavigate('bank');
        }
    };

    if (!token) {
        if (onNavigate) {
            onNavigate('login');
        }
        return null;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Movie Rental Dashboard</h1>
                <div className="user-section">
                    <div className="user-info">
                        <span className="welcome-message">Ciao, <strong>{username}</strong>!</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="welcome-banner">
                    <h2>Benvenuto nella tua Dashboard</h2>
                    <p>Scegli una delle seguenti opzioni per iniziare</p>
                </div>

                <div className="dashboard-sections">
                    <div className="dashboard-card film-card">
                        <div className="card-icon">🎬</div>
                        <h3>Catalogo Film</h3>
                        <p>Esplora il nostro catalogo completo di film disponibili per il noleggio</p>
                        <button
                            onClick={handleFilmCatalog}
                            className="card-button primary"
                        >
                            Vai al Catalogo
                        </button>
                    </div>

                    <div className="dashboard-card rentals-card">
                        <div className="card-icon">📚</div>
                        <h3>I miei Noleggi</h3>
                        <p>Visualizza e gestisci i film che hai attualmente in noleggio</p>
                        <button
                            onClick={handleRentals}
                            className="card-button rentals"
                        >
                            Vai ai Noleggi
                        </button>
                    </div>

                    <div className="dashboard-card profile-card">
                        <div className="card-icon">👤</div>
                        <h3>Profilo Utente</h3>
                        <p>Gestisci il tuo profilo, visualizza statistiche e storico attività</p>
                        <button
                            onClick={handleUserProfile}
                            className="card-button profile"
                        >
                            Vedi Profilo
                        </button>
                    </div>

                    <div className="dashboard-card bank-card">
                        <div className="card-icon">💰</div>
                        <h3>Gestione Credito</h3>
                        <p>Controlla il tuo saldo, deposita fondi e visualizza le transazioni</p>
                        <button
                            onClick={handleBank}
                            className="card-button bank"
                        >
                            Vai al Conto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;