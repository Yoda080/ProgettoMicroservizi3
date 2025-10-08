import React, { useState, useEffect } from 'react';


const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [isLoginForm, setIsLoginForm] = useState(true);
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
    const [loading, setLoading] = useState({ register: false, login: false });
    const [apiStatus, setApiStatus] = useState({ connected: false, text: 'Controllo connessione in corso...' });

    useEffect(() => {
        const savedApiUrl = localStorage.getItem('apiUrl');
        if (savedApiUrl) {
            setApiBaseUrl(savedApiUrl);
        }
        checkAPIStatus();
    }, [apiBaseUrl]);

    const showMessage = (text, type) => {
        setMessage({ text, type, show: true });
        setTimeout(() => {
            setMessage({ text: '', type: '', show: false });
        }, 5000);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const switchToRegister = () => {
        if (onSwitchToRegister) {
            onSwitchToRegister();
        } else {
            setIsLoginForm(false);
        }
    };

    const switchToLogin = () => {
        setIsLoginForm(true);
    };

    const checkAPIStatus = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/status`);
            if (response.ok) {
                setApiStatus({ connected: true, text: 'Connesso al backend' });
            } else {
                setApiStatus({ connected: false, text: 'Backend non raggiungibile' });
            }
        } catch (error) {
            setApiStatus({ connected: false, text: 'Errore di connessione al backend' });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, login: true }));
        
        try {
            const loginData = {
                email: formData.loginEmail,
                password: formData.loginPassword
            };

            const response = await fetch(`${apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if (response.ok) {
                const data = await response.json();
                showMessage('Accesso effettuato con successo!', 'success');
                
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userId', data.userId || data.id);
                    localStorage.setItem('username', data.username || formData.loginEmail.split('@')[0]);
                    
                    if (onLoginSuccess) {
                        onLoginSuccess();
                    }
                } else {
                    showMessage('Token non ricevuto dal server', 'error');
                }
                
            } else {
                const errorData = await response.json();
                showMessage(errorData.message || 'Email o password non validi', 'error');
            }
        } catch (error) {
            showMessage('Impossibile connettersi al server. Verifica che il backend sia attivo.', 'error');
        } finally {
            setLoading(prev => ({ ...prev, login: false }));
        }
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            showMessage('Tutti i campi sono obbligatori', 'error');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showMessage('Le password non coincidono', 'error');
            return;
        }

        if (formData.password.length < 6) {
            showMessage('La password deve essere di almeno 6 caratteri', 'error');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
            showMessage('Inserisci un indirizzo email valido', 'error');
            return;
        }

        setLoading(prev => ({ ...prev, register: true }));
        
        try {
            const registrationData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            };

            const response = await fetch(`${apiBaseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            if (response.ok) {
                const data = await response.json();
                showMessage('Registrazione completata con successo!', 'success');
                
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userId', data.userId || data.id);
                    localStorage.setItem('username', data.username || formData.username);
                    
                    if (onLoginSuccess) {
                        onLoginSuccess();
                    }
                } else {
                    showMessage('Token non ricevuto dal server', 'error');
                }
                
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    loginEmail: '',
                    loginPassword: ''
                });
            } else {
                const errorData = await response.json();
                
                if (response.status === 409) {
                    showMessage('Email o username già in uso', 'error');
                } else {
                    showMessage(errorData.message || 'Errore durante la registrazione', 'error');
                }
            }
        } catch (error) {
            showMessage('Impossibile connettersi al server. Verifica che il backend sia attivo.', 'error');
        } finally {
            setLoading(prev => ({ ...prev, register: false }));
        }
    };

    return (
        <div className="auth-container">
            <div className="container">
                <div className="header">
                    <h2>{isLoginForm ? 'Accedi al tuo account' : 'Crea il tuo account'}</h2>
                </div>
                
                <div className="form-container">
                    {message.show && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <div className="auth-forms">
                        {isLoginForm ? (
                            <form onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label htmlFor="loginEmail">Email</label>
                                    <input
                                        type="email"
                                        id="loginEmail"
                                        name="loginEmail"
                                        value={formData.loginEmail}
                                        onChange={handleInputChange}
                                        placeholder="La tua email"
                                        required
                                        disabled={loading.login}
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
                                        placeholder="La tua password"
                                        required
                                        disabled={loading.login}
                                    />
                                </div>
                                
                                <button type="submit" className="btn" disabled={loading.login}>
                                    {loading.login ? 'Accesso in corso...' : 'Accedi'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegistration}>
                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Scegli uno username"
                                        required
                                        disabled={loading.register}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="La tua email"
                                        required
                                        disabled={loading.register}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Crea una password (min. 6 caratteri)"
                                        required
                                        disabled={loading.register}
                                        minLength="6"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Conferma Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Ripeti la password"
                                        required
                                        disabled={loading.register}
                                    />
                                </div>
                                
                                <button type="submit" className="btn" disabled={loading.register}>
                                    {loading.register ? 'Registrazione in corso...' : 'Registrati'}
                                </button>
                            </form>
                        )}
                    </div>
                    
                    <div className="switch">
                        <span>{isLoginForm ? 'Non hai un account?' : 'Hai già un account?'}</span> 
                        {isLoginForm ? (
                            <a onClick={switchToRegister} className="switch-link">
                                Registrati
                            </a>
                        ) : (
                            <a onClick={switchToLogin} className="switch-link">
                                Accedi
                            </a>
                        )}
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