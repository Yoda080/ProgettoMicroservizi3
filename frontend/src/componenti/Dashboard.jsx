import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // ✅ Importa il file CSS

const Dashboard = () => {
    const navigate = useNavigate();

    const username = localStorage.getItem('username') || 'Utente';
    const token = localStorage.getItem('authToken');

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        navigate('/');
    };

    const handleFilmCatalog = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            navigate('/');
            return;
        }
        navigate('/filmCatalog');
    };

    const handleRentals = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            navigate('/');
            return;
        }
        navigate('/rentals');
    };

    // 🚨 NUOVO HANDLER: Naviga alla sezione Profilo Utente
    const handleUserProfile = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            navigate('/');
            return;
        }
        // Assumi che l'URL per il profilo sia '/profile'
        navigate('/profile');
    };

    // 🚨 NUOVO HANDLER: Naviga alla sezione Banca/Gestione Credito
    const handleBank = () => {
        if (!token) {
            alert('Devi effettuare il login prima');
            navigate('/');
            return;
        }
        // Assumi che l'URL per il servizio Banca sia '/bank'
        navigate('/bank'); 
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-title">Dashboard</h1>
                <div className="user-section">
                    <span className="welcome-message">Ciao, {username}!</span>
                    
                    {/* 🚨 NUOVO PULSANTE: Profilo Utente */}
                    <button
                        onClick={handleUserProfile}
                        className="card-button profile" // Aggiungi la classe CSS
                        style={{ marginRight: '10px' }} // Stile temporaneo in attesa del CSS
                    >
                        Vedi Profilo Utente
                    </button>
                    
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-sections">
                {/* 1. Card Catalogo Film */}
                <div className="dashboard-card">
                    <h3>Catalogo Film</h3>
                    <p>Esplora e gestisci il catalogo dei film</p>
                    <button
                        onClick={handleFilmCatalog}
                        className="card-button primary"
                    >
                        Vai al Catalogo
                    </button>
                </div>

                {/* 2. Card I miei Noleggi */}
                <div className="dashboard-card">
                    <h3>I miei Noleggi</h3>
                    <p>Visualizza lo storico dei tuoi noleggi</p>
                    <button
                        onClick={handleRentals}
                        className="card-button rentals"
                    >
                        Vai ai Noleggi
                    </button>
                </div>

                {/* 🚨 3. NUOVA CARD: Servizio Banca/Credito */}
                <div className="dashboard-card bank-card">
                    <h3>Gestione Credito</h3>
                    <p>Controlla il tuo saldo e deposita fondi</p>
                    <button
                        onClick={handleBank}
                        className="card-button-bank" // Aggiungi la classe CSS 'bank'
                    >
                        Vai al Conto Banca
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;