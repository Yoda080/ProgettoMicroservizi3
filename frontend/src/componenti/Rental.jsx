import React, { useState, useEffect } from 'react';
import { Film, ShoppingCart, LogOut, Home, ArrowRight, Loader, AlertTriangle } from 'lucide-react';
import './Dashboard.css'; // ✅ Importa il CSS esterno

const MOVIE_CATALOG_API_URL = 'http://localhost:5002/api/movies'; 

const Rental = ({ onBack, onNavigate }) => {
    const CART_STORAGE_KEY = 'movieCart';
    
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [cartCount, setCartCount] = useState(0);

    const navigateTo = (view) => {
        if (onNavigate) {
            onNavigate(view);
        }
    };

    const handleBackToDashboard = () => {
        if (onBack) {
            onBack();
        } else {
            navigateTo('dashboard');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigateTo('login');
    };

    useEffect(() => {
        const loadFilms = async () => {
            setLoading(true);
            setError(null);
            
            const authToken = localStorage.getItem('authToken');
            
            if (!authToken) {
                setError("Non autorizzato. Token di accesso mancante.");
                setLoading(false);
                navigateTo('login');
                return;
            }

            try {
                const response = await fetch(MOVIE_CATALOG_API_URL, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        setError("Sessione scaduta o non valida. Effettua nuovamente il login.");
                        localStorage.removeItem('authToken');
                        navigateTo('login');
                        return;
                    }
                    throw new Error(`Errore HTTP: ${response.status}`);
                }
                
                const fetchedFilms = await response.json();
                
                if (!Array.isArray(fetchedFilms)) {
                    throw new Error("Formato dati non valido");
                }
                
                const processedFilms = fetchedFilms.map(movie => ({
                    ...movie,
                    available: typeof movie.available === 'boolean' ? movie.available : true,
                    id: movie.id || movie.title,
                }));

                setFilms(processedFilms);
            } catch (err) {
                setError(`Errore di comunicazione: ${err.message}`);
                setFilms([]); 
            } finally {
                setLoading(false);
            }
        };
        loadFilms();
    }, [onNavigate]);

    const updateCartCount = () => {
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            const items = storedCart ? JSON.parse(storedCart) : [];
            setCartCount(items.length);
        } catch (e) {
            setCartCount(0);
        }
    };

    useEffect(() => {
        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        return () => {
            window.removeEventListener('storage', updateCartCount);
        };
    }, []);

    const handleAddToCart = (movie) => {
        if (!movie.available) {
            return;
        }
        
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            let cart = storedCart ? JSON.parse(storedCart) : [];

            const isAlreadyInCart = cart.some(item => item.id === movie.id);

            if (!isAlreadyInCart) {
                cart.push(movie); 
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
                updateCartCount();
            }
        } catch (e) {
            console.error("Errore nell'aggiunta al carrello:", e);
        }
    };
    
    const goToCart = () => {
        navigateTo('cart');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="text-center">
                    <Loader className="loading-spinner" />
                    <p className="loading-text">Caricamento catalogo film...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <AlertTriangle className="error-icon" />
                    <h2 className="error-title">Errore di Caricamento</h2>
                    <p className="error-message">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rental-container">
            {/* Header e Barra di Navigazione */}
            <header className="rental-header">
                <h1 className="rental-title">
                    <Film className="rental-icon" />
                    Gestione Noleggi
                </h1>
                <div className="rental-nav-buttons">
                    <button 
                        onClick={goToCart} 
                        className="cart-button"
                        title="Vai al Carrello"
                    >
                        <ShoppingCart className="cart-icon" />
                        {cartCount > 0 && (
                            <span className="cart-badge">{cartCount}</span>
                        )}
                    </button>

                    <button 
                        onClick={handleBackToDashboard} 
                        className="nav-button"
                        title="Dashboard"
                    >
                        <Home className="nav-icon" />
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="logout-button"
                        title="Logout"
                    >
                        <LogOut className="nav-icon" />
                    </button>
                </div>
            </header>

            {/* Contenuto Principale */}
            <main className="rental-main">
                <h2 className="catalog-title">Catalogo Film Disponibili ({films.length} titoli)</h2>

                <div className="movies-grid">
                    {films.map(movie => (
                        <div key={movie.id || movie.title} className="movie-card">
                            <div className="movie-content">
                                <h3 className="movie-title">{movie.title}</h3>
                                <p className="movie-duration">Durata: {movie.duration || 'N/A'} min</p>
                            </div>
                            
                            <div className="movie-footer">
                                <p className="movie-price">€ {movie.price?.toFixed(2) || 'N/A'}</p>
                                
                                {movie.available ? (
                                    <button
                                        onClick={() => handleAddToCart(movie)}
                                        className="add-to-cart-button"
                                    >
                                        Aggiungi 
                                        <ArrowRight className="button-icon" />
                                    </button>
                                ) : (
                                    <span className="not-available-text">Non disponibile</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                {films.length === 0 && !loading && !error && (
                    <p className="no-movies-text">Nessun film trovato nel catalogo.</p>
                )}
            </main>
        </div>
    );
};

export default Rental;