import React, { useState } from 'react';
import './Registrazione.css';

const Registrazione = ({ onRegisterSuccess, onSwitchToLogin }) => {  // ✅ Corretto il nome della prop
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

    // Validazioni
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

    // Validazione email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setError('Inserisci un indirizzo email valido');
      setLoading(false);
      return;
    }

    // ⚠️ STRUTTURA DATI PER IL BACKEND
    const registrationData = {
      username: `${formData.nome.toLowerCase()}.${formData.cognome.toLowerCase()}`,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confermaPassword
    };

    console.log('📨 Dati inviati al backend:', {
      ...registrationData,
      password: '***',
      confirmPassword: '***'
    });

    try {
      const response = await fetch('http://localhost:5001/api/Auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      console.log('📨 Status risposta:', response.status, response.statusText);

      const responseData = await response.json();
      console.log('📨 Dati risposta:', responseData);

      if (response.ok) {
        console.log('✅ Registrazione completata:', responseData);
        
        // ⚠️ VERIFICA SE IL TOKEN È PRESENTE
        if (responseData.token) {
          // Salva il token e i dati utente
          localStorage.setItem('authToken', responseData.token);
          localStorage.setItem('userId', responseData.userId || responseData.id || 'unknown');
          localStorage.setItem('username', responseData.username || formData.email);
          
          setSuccess('Registrazione avvenuta con successo! Reindirizzamento...');
          
          // Debug del token salvato
          try {
            const tokenPayload = JSON.parse(atob(responseData.token.split('.')[1]));
            console.log('🔐 Token salvato - Payload:', tokenPayload);
          } catch (tokenError) {
            console.error('❌ Errore parsing token:', tokenError);
          }
          
          // Reset form
          setFormData({
            nome: '',
            cognome: '',
            email: '',
            password: '',
            confermaPassword: ''
          });
          
          // ✅ CORRETTO: Usa la prop invece di window.location.href
          setTimeout(() => {
            if (onRegisterSuccess) {
              console.log('🔄 Chiamando onRegisterSuccess...');
              onRegisterSuccess(responseData);
            } else {
              console.error('❌ onRegisterSuccess non disponibile');
              // Fallback sicuro senza refresh
              window.location.reload();
            }
          }, 2000);
          
        } else {
          setError('Token non ricevuto dal server. La registrazione potrebbe non essere completa.');
          console.error('❌ Token mancante nella risposta:', responseData);
        }
        
      } else {
        // Gestione errori specifici
        if (response.status === 409) {
          setError('Email o username già in uso. Prova ad accedere o usa un altro indirizzo.');
        } else if (response.status === 400) {
          setError(responseData.message || 'Dati non validi. Controlla i campi inseriti.');
        } else if (response.status === 500) {
          setError('Errore interno del server. Riprova più tardi.');
        } else {
          setError(responseData.message || `Errore durante la registrazione (${response.status}). Riprova più tardi.`);
        }
        
        console.error('❌ Errore registrazione:', responseData);
      }

    } catch (error) {
      console.error('❌ Errore di rete:', error);
      setError('Impossibile connettersi al server. Verifica che: 1) Il backend .NET sia in esecuzione, 2) La porta 5001 sia libera, 3) Il endpoint /api/Auth/register esista.');
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

        {/* Debug info - Solo in sviluppo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info">
            <strong>Debug Info:</strong><br/>
            Backend: http://localhost:5001/api/Auth/register<br/>
            Dati inviati: {JSON.stringify({
              username: `${formData.nome.toLowerCase()}.${formData.cognome.toLowerCase()}`,
              email: formData.email,
              password: '***',
              confirmPassword: '***'
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Registrazione;