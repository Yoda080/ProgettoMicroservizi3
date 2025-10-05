import React, { useState } from 'react';
import './Dashboard.css';

const Registrazione = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confermaPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.nome || !formData.cognome || !formData.email || !formData.password || !formData.confermaPassword) {
      setError('Tutti i campi sono obbligatori');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confermaPassword) {
      setError('Le password non coincidono');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      setLoading(false);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setError('Inserisci un indirizzo email valido');
      setLoading(false);
      return;
    }

    const registrationData = {
      username: `${formData.nome.toLowerCase()}.${formData.cognome.toLowerCase()}`,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confermaPassword
    };

    try {
      const response = await fetch('http://localhost:5001/api/Auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      const responseData = await response.json();

      if (response.ok) {
        if (responseData.token) {
          localStorage.setItem('authToken', responseData.token);
          localStorage.setItem('userId', responseData.userId || responseData.id || 'unknown');
          localStorage.setItem('username', responseData.username || formData.email);
          
          setSuccess('Registrazione avvenuta con successo! Reindirizzamento...');
          
          setFormData({
            nome: '',
            cognome: '',
            email: '',
            password: '',
            confermaPassword: ''
          });
          
          setTimeout(() => {
            if (onRegisterSuccess) {
              onRegisterSuccess(responseData);
            }
          }, 2000);
          
        } else {
          setError('Token non ricevuto dal server. La registrazione potrebbe non essere completa.');
        }
        
      } else {
        if (response.status === 409) {
          setError('Email o username già in uso. Prova ad accedere o usa un altro indirizzo.');
        } else if (response.status === 400) {
          setError(responseData.message || 'Dati non validi. Controlla i campi inseriti.');
        } else if (response.status === 500) {
          setError('Errore interno del server. Riprova più tardi.');
        } else {
          setError(responseData.message || `Errore durante la registrazione. Riprova più tardi.`);
        }
      }

    } catch (error) {
      setError('Impossibile connettersi al server. Verifica la connessione e riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registrazione-container">
      <div className="registrazione-card">
        <h2>Crea il tuo account</h2>
        
        {error && (
          <div className="error-message">
            <strong>Errore:</strong> {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <strong>Successo!</strong> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Inserisci il tuo nome"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cognome">Cognome</label>
            <input
              type="text"
              id="cognome"
              name="cognome"
              value={formData.cognome}
              onChange={handleChange}
              placeholder="Inserisci il tuo cognome"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="esempio@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimo 6 caratteri"
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confermaPassword">Conferma Password</label>
            <input
              type="password"
              id="confermaPassword"
              name="confermaPassword"
              value={formData.confermaPassword}
              onChange={handleChange}
              placeholder="Ripeti la password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="registrazione-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Registrazione in corso...
              </>
            ) : (
              'Registrati'
            )}
          </button>
        </form>

        <div className="switch-auth">
          <p>Hai già un account? 
            <span 
              onClick={loading ? null : onSwitchToLogin} 
              className="switch-link"
              style={{ 
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              Accedi
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registrazione;