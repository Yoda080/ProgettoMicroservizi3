import React, { useState } from 'react';
import './Registrazione.css';

const Registrazione = ({ onRegister, onSwitchToLogin }) => {
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

    // Struttura dei dati per l'API di registrazione del backend
    const registrationData = {
      username: formData.email, // Il tuo backend usa 'username' per l'email
      password: formData.password,
      firstName: formData.nome,
      lastName: formData.cognome
    };

    try {
      const response = await fetch('http://localhost:5001/api/Auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      if (response.ok) {
        setSuccess('Registrazione avvenuta con successo! Puoi ora accedere.');
        setFormData({
          nome: '',
          cognome: '',
          email: '',
          password: '',
          confermaPassword: ''
        });
        // onRegister(await response.json());
      } else if (response.status === 409) {
        setError('Email già in uso. Prova ad accedere o usa un altro indirizzo.');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Errore durante la registrazione. Riprova più tardi.');
      }

    } catch (error) {
      console.error('Errore di rete:', error);
      setError('Impossibile connettersi al server. Verifica la tua connessione.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registrazione-container">
      <div className="registrazione-card">
        <h2>Crea il tuo account</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Campi del modulo */}
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
              placeholder="Inserisci la tua email"
              required
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
              placeholder="Crea una password (min. 6 caratteri)"
              required
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
              placeholder="Conferma la tua password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="registrazione-button"
            disabled={loading}
          >
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
        </form>

        <div className="switch-auth">
          <p>Hai già un account? <span onClick={onSwitchToLogin}>Accedi</span></p>
        </div>
      </div>
    </div>
  );
};

export default Registrazione;