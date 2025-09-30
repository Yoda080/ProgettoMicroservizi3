import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// URL corretto - usa /me invece di /profile
const USER_SERVICE_URL = 'http://localhost:5001/api/Auth';

const UserProfileSection = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const cachedUsername = localStorage.getItem('username');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                // USA L'ENDPOINT CORRETTO: /me invece di /profile
                const response = await axios.get(`${USER_SERVICE_URL}/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setProfile(response.data);
            } catch (err) {
                console.error("Errore nel recupero del profilo:", err.response || err);
                
                if (err.response?.status === 404) {
                    setError("Endpoint non trovato. Assicurati che il backend abbia l'endpoint /api/auth/me");
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

        fetchProfile();
    }, [token, navigate]);

    return (
        <div style={styles.container}>
            <button 
                onClick={() => navigate('/dashboard')} 
                style={styles.backButton}>
                &larr; Torna alla Dashboard
            </button>
            <h1 style={styles.header}>Dettagli del Tuo Account</h1>
            
            {loading && <p style={{textAlign: 'center', color: '#374151'}}>Caricamento dati...</p>}
            {error && <div style={styles.errorMessage}>{error}</div>}

            {profile && (
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Profilo Utente</h2>
                    <div style={styles.detailRow}>
                        <span style={styles.label}>Nome Utente:</span>
                        <span style={styles.value}>{profile.username || cachedUsername || 'Non Specificato'}</span>
                    </div>
                    <div style={styles.detailRow}>
                        <span style={styles.label}>Email:</span>
                        <span style={styles.value}>{profile.email || 'N/A'}</span>
                    </div>
                    <div style={styles.detailRow}>
                        <span style={styles.label}>ID Utente:</span>
                        <span style={styles.value}>{profile.userId || profile.id || 'N/A'}</span>
                    </div>
                    <div style={styles.detailRow}>
                        <span style={styles.label}>Registrato il:</span>
                        <span style={styles.value}>
                            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('it-IT') : 'N/A'}
                        </span>
                    </div>
                </div>
            )}
            
            <p style={styles.infoText}>
                Questi dati sono gestiti e forniti dal microservizio utente.
            </p>
        </div>
    );
};

// I tuoi stili rimangono uguali...
const styles = {
    container: {
        padding: '20px',
        maxWidth: '600px',
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
    },
    cardTitle: {
        fontSize: '1.5em',
        color: '#374151',
        marginBottom: '15px',
        borderBottom: '1px dashed #e5e7eb',
        paddingBottom: '10px'
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #f3f4f6'
    },
    label: {
        fontWeight: '600',
        color: '#6b7280'
    },
    value: {
        color: '#1f2937',
        wordBreak: 'break-all'
    },
    errorMessage: {
        backgroundColor: '#fecaca',
        color: '#ef4444',
        padding: '10px',
        borderRadius: '6px',
        marginBottom: '15px',
        fontWeight: '500'
    },
    infoText: {
        fontSize: '0.875em',
        color: '#9ca3af',
        textAlign: 'center'
    }
};

export default UserProfileSection;