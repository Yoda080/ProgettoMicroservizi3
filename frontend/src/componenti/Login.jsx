import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './Login.css';

// Componente Dashboard
const Dashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/');
  };

  const goToFilmCatalog = () => {
    navigate('/filmCatalog');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>
      <div className="dashboard-content">
        <h2>Benvenuto, {localStorage.getItem('username') || 'Utente'}!</h2>
        <p>Hai effettuato l'accesso con successo.</p>
        <div className="dashboard-cards">
          <div className="card">
            <h3>Profilo Utente</h3>
            <p>Gestisci le tue informazioni personali</p>
          </div>
          <div className="card">
            <h3>Impostazioni</h3>
            <p>Modifica le tue preferenze</p>
          </div>
          <div className="card">
            <h3>Catalogo Film</h3>
            <p>Esplora la nostra collezione di film</p>
            <button onClick={goToFilmCatalog} className="btn">
              Vai al Catalogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente FilmCatalog
const FilmCatalog = () => {
  const navigate = useNavigate();
  
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="film-catalog">
      <h1>Catalogo Film</h1>
      <p>Qui verrà visualizzato l'elenco dei film...</p>
      <button onClick={goToDashboard} className="btn">
        Torna alla Dashboard
      </button>
    </div>
  );
};

// Componente Login
const Login = () => {
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState("http://localhost:5001/api/Auth");
  const [message, setMessage] = useState({ text: '', type: '', show: false });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    loginEmail: '',
    loginPassword: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState({ register: false, login: false });
  const [apiStatus, setApiStatus] = useState({ connected: false, text: 'Controllo connessione in corso...' });
  const navigate = useNavigate();

  // Inizializzazione
  useEffect(() => {
    const savedApiUrl = localStorage.getItem('apiUrl');
    if (savedApiUrl) {
      setApiBaseUrl(savedApiUrl);
    }
    checkAPIStatus();
    
    // Se l'utente è già loggato, reindirizza alla dashboard
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [apiBaseUrl, navigate]);

  // Funzione per aggiornare l'URL dell'API
  const updateApiUrl = () => {
    const newUrl = document.getElementById('apiUrl').value;
    if (newUrl) {
      setApiBaseUrl(newUrl);
      localStorage.setItem('apiUrl', newUrl);
      showMessage('URL API aggiornato', 'success');
      checkAPIStatus();
    }
  };

  // Funzione per mostrare i messaggi
  const showMessage = (text, type) => {
    setMessage({ text, type, show: true });
    setTimeout(() => {
      setMessage({ text: '', type: '', show: false });
    }, 5000);
  };

  // Gestione cambiamenti nei campi del form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset errori quando l'utente inizia a digitare
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Funzione per mostrare/nascondere la password
  const togglePassword = (inputId) => {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  };

  // Funzione per passare tra login e registrazione
  const switchForm = () => {
    setIsLoginForm(!isLoginForm);
  };

  // Controlla lo stato dell'API
  const checkAPIStatus = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setApiStatus({ connected: true, text: 'Connesso al backend .NET' });
      } else {
        // Prova anche l'endpoint /health
        try {
          const healthResponse = await fetch(`${apiBaseUrl.replace('/api/Auth', '')}/health`);
          if (healthResponse.ok) {
            setApiStatus({ connected: true, text: 'Connesso al backend .NET (via health)' });
          } else {
            setApiStatus({ connected: false, text: 'Backend non raggiungibile' });
          }
        } catch {
          setApiStatus({ connected: false, text: 'Backend non raggiungibile' });
        }
      }
    } catch (error) {
      console.error('Errore nel controllo API:', error);
      setApiStatus({ connected: false, text: 'Errore di connessione al backend' });
      
      // Suggerimenti per risolvere il problema
      if (apiBaseUrl.includes('https://')) {
        showMessage('Prova a usare http invece di HTTPS', 'error');
      }
    }
  };

  // Gestione dell'invio del form di registrazione
  const handleRegistration = async (e) => {
    e.preventDefault();
    
    // Reset errori
    setErrors({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    
    // Validazioni lato client
    let hasErrors = false;
    const newErrors = {};
    
    if (formData.username.length < 3) {
      newErrors.username = 'Lo username deve avere almeno 3 caratteri';
      hasErrors = true;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      newErrors.email = 'Formato email non valido';
      hasErrors = true;
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'La password deve avere almeno 6 caratteri';
      hasErrors = true;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(prev => ({ ...prev, register: true }));
    
    try {
    const response = await fetch(`${apiBaseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      showMessage('Registrazione completata con successo!', 'success');
      
      // MODIFICA QUESTA PARTE
      localStorage.setItem('authToken', data.token || 'default-token');
      localStorage.setItem('userId', data.userId || data.id || 'unknown');
      localStorage.setItem('username', data.username || formData.username);
      
      setFormData(prev => ({
        ...prev,
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }));
      navigate('/dashboard');
    } else {
      const errorData = await response.json();
      showMessage(errorData.message || 'Errore durante la registrazione', 'error');
    }
  } catch (error) {
    
  

      console.error('Errore durante la registrazione:', error);
      showMessage('Impossibile connettersi al server. Verifica che il backend .NET sia in esecuzione.', 'error');
    } finally {
      setLoading(prev => ({ ...prev, register: false }));
    }
  };

  // Gestione dell'invio del form di login
 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(prev => ({ ...prev, login: true }));
  
  try {
    const response = await fetch(`${apiBaseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: formData.loginEmail,
        password: formData.loginPassword
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      showMessage('Accesso effettuato con successo!', 'success');
      
      // MODIFICA QUESTA PARTE - Gestisci dati mancanti
      localStorage.setItem('authToken', data.token || 'default-token');
      localStorage.setItem('userId', data.userId || data.id || 'unknown');
      
      // Usa l'email se username non è disponibile
      const username = data.username || formData.loginEmail.split('@')[0];
      localStorage.setItem('username', username);
      
      setFormData(prev => ({
        ...prev,
        loginEmail: '',
        loginPassword: ''
      }));
      navigate('/dashboard');
    } else {
      const errorData = await response.json();
      showMessage(errorData.message || 'Email o password non validi', 'error');
    }
  } catch (error) {
    console.error('Errore durante il login:', error);
    showMessage('Impossibile connettersi al server', 'error');
  } finally {
    setLoading(prev => ({ ...prev, login: false }));
  }
};

  return (
    <div className="auth-container">
      <div className="container">
        <div className="header">
          <h2 id="formTitle">{isLoginForm ? 'Accedi al tuo account' : 'Crea il tuo account'}</h2>
        </div>
        
        <div className="form-container">
          {message.show && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          
         
          
          <div className="auth-forms">
            {/* Form di Registrazione */}
            {!isLoginForm && (
              <form id="registrationForm" onSubmit={handleRegistration}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.username && <div className="validation-error">{errors.username}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.email && <div className="validation-error">{errors.email}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <i className="fas fa-eye password-toggle" onClick={() => togglePassword('password')}></i>
                  {errors.password && <div className="validation-error">{errors.password}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Conferma Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <i className="fas fa-eye password-toggle" onClick={() => togglePassword('confirmPassword')}></i>
                  {errors.confirmPassword && <div className="validation-error">{errors.confirmPassword}</div>}
                </div>
                
                <button type="submit" className="btn" disabled={loading.register}>
                  {loading.register ? (
                    <>
                      <span className="spinner"></span> Registrazione in corso
                    </>
                  ) : (
                    'Registrati'
                  )}
                </button>
              </form>
            )}
            
            {/* Form di Login */}
            {isLoginForm && (
              <form id="loginForm" onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="loginEmail">Email</label>
                  <input
                    type="email"
                    id="loginEmail"
                    name="loginEmail"
                    value={formData.loginEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="loginPassword">Password</label>
                  <input
                    type="password"
                    id="loginPassword"
                    name="loginPassword"
                    value={formData.loginPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <i className="fas fa-eye password-toggle" onClick={() => togglePassword('loginPassword')}></i>
                </div>
                
                
                
                <button type="submit" className="btn" disabled={loading.login}>
                  {loading.login ? (
                    <>
                      <span className="spinner"></span> Accesso in corso
                    </>
                  ) : (
                    'Accedi'
                  )}
                </button>
              </form>
            )}
          </div>
          
          <div className="switch">
            <span>{isLoginForm ? 'Non hai un account?' : 'Hai già un account?'}</span> 
            <a onClick={switchForm} style={{cursor: 'pointer'}}>
              {isLoginForm ? 'Registrati' : 'Accedi'}
            </a>
          </div>
          
         
            <div className="api-status">
              <div className={`status-indicator ${apiStatus.connected ? 'connected' : 'disconnected'}`}></div>
              <span>{apiStatus.text}</span>
            </div>
            
            
              
            </div>
          </div>
        </div>
      
  
  );
};


export default Login;
