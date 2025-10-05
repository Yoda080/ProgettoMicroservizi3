import React, { useState, useEffect } from 'react';
import { Film, ShoppingCart, LogOut, Home, ArrowRight, Loader, AlertTriangle } from 'lucide-react';

// 🛑 URL REALE DEL MICROSERVIZIO MOVIECATALOG
const MOVIE_CATALOG_API_URL = 'http://localhost:5002/api/movies'; 

const Rental = ({ onBack, onNavigate }) => {  // ✅ Ricevi le props invece di useNavigate
    const CART_STORAGE_KEY = 'movieCart';
    
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [cartCount, setCartCount] = useState(0);

    // ✅ FUNZIONE PER NAVIGARE
    const navigateTo = (view) => {
        if (onNavigate) {
            onNavigate(view);
        } else {
            // Fallback
            window.location.href = `/#/${view}`;
        }
    };

    // ✅ FUNZIONE PER TORNARE ALLA DASHBOARD
    const handleBackToDashboard = () => {
        if (onBack) {
            onBack();
        } else {
            navigateTo('dashboard');
        }
    };

    // ✅ FUNZIONE PER LOGOUT
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigateTo('login');
    };

    // Stili CSS (invariati, ma cruciali per l'estetica)
    const cssStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        .rental-container { 
            font-family: 'Inter', sans-serif; 
            min-height: 100vh;
            background: #f0f4f8; 
            color: #333;
        }
        .rental-header { 
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%); 
            color: white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .card {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        }
        .add-to-cart-button {
            background-color: #3b82f6; 
            transition: background-color 0.2s;
        }
        .add-to-cart-button:hover {
            background-color: #2563eb;
        }
        .cart-button {
            transition: all 0.3s ease;
            position: relative;
        }
        .cart-button:hover {
            background-color: #374151;
            transform: scale(1.05);
        }
        .cart-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #ef4444; 
            color: white;
            font-size: 0.75rem;
            padding: 2px 6px;
            border-radius: 9999px;
            min-width: 20px;
            text-align: center;
        }
    `;

    // 1. Logica di caricamento Film dal Microservizio Reale
    useEffect(() => {
        const loadFilms = async () => {
            setLoading(true);
            setError(null);
            
            // Recupera il token di autenticazione da localStorage
            const authToken = localStorage.getItem('authToken');
            
            if (!authToken) {
                setError("Non autorizzato. Token di accesso mancante.");
                setLoading(false);
                // ✅ Usa la funzione di navigazione invece di useNavigate
                navigateTo('login');
                return;
            }

            try {
                // CHIAMATA FETCH AL MICROSERVIZIO REALE
                const response = await fetch(MOVIE_CATALOG_API_URL, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    // Gestione di errori HTTP (400, 401, 404, 500 ecc.)
                    const errorText = await response.text();
                    if (response.status === 401) {
                         // Token scaduto o non valido
                        setError("Sessione scaduta o non valida. Effettua nuovamente il login.");
                        localStorage.removeItem('authToken');
                        navigateTo('login');
                        return;
                    }
                    throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}. Dettagli: ${errorText.substring(0, 100)}...`);
                }
                
                const fetchedFilms = await response.json();
                
                if (!Array.isArray(fetchedFilms)) {
                    throw new Error("Il servizio ha restituito un formato dati inatteso (non un array).");
                }
                
                // 🚀 NUOVA LOGICA: Forza la disponibilità a TRUE se il campo è mancante/errato.
                // Questo è cruciale per aggirare problemi di formato API e rendere i film acquistabili.
                const processedFilms = fetchedFilms.map(movie => ({
                    ...movie,
                    // Se movie.available non è un booleano (o è undefined/null), lo forziamo a true
                    available: typeof movie.available === 'boolean' ? movie.available : true, 
                    // Assicuriamoci che l'ID esista per la chiave React
                    id: movie.id || movie.title, 
                }));

                setFilms(processedFilms);
            } catch (err) {
                console.error("Errore nel recupero dei film dal catalogo:", err.message);
                // Gestione errori di rete o parsing
                setError(`Errore di comunicazione: ${err.message}`);
                setFilms([]); 
            } finally {
                setLoading(false);
            }
        };
        loadFilms();
    }, [onNavigate]); // ✅ Cambia navigate con onNavigate

    // 2. Logica Carrello (Badge e aggiornamento)
    const updateCartCount = () => {
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            const items = storedCart ? JSON.parse(storedCart) : [];
            setCartCount(items.length);
        } catch (e) {
            console.error("Errore nel caricamento del carrello per il badge:", e);
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

    // 3. Aggiunge un film al carrello
    const handleAddToCart = (movie) => {
        // La disponibilità è garantita TRUE dalla logica in useEffect se il microservizio è ambiguo.
        if (!movie.available) {
            console.warn(`Film "${movie.title}" non disponibile per l'aggiunta.`);
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
                console.log(`Film "${movie.title}" aggiunto al carrello.`);
            } else {
                console.log(`Film "${movie.title}" è già nel carrello.`);
            }
        } catch (e) {
            console.error("Errore nell'aggiunta del carrello in localStorage:", e);
        }
    };
    
    // 4. Funzione per navigare al carrello
    const goToCart = () => {
        navigateTo('cart'); // ✅ Usa la funzione helper
    };

    // Gestione dello stato di Caricamento
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <style>{cssStyles}</style>
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                    <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4 mx-auto" />
                    <p className="text-xl text-gray-700 font-semibold">Caricamento catalogo dal microservizio...</p>
                    <p className="text-sm text-gray-500 mt-2">Tentativo di connessione a: {MOVIE_CATALOG_API_URL}</p>
                </div>
            </div>
        );
    }
    
    // Gestione dello stato di Errore
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <style>{cssStyles}</style>
                <div className="text-center p-8 bg-white rounded-xl shadow-2xl border-l-4 border-red-500 max-w-lg mx-4">
                    <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 mr-2" />
                        Errore di Caricamento
                    </h2>
                    <p className="text-gray-700 mb-4">Impossibile recuperare il catalogo film. Dettagli:</p>
                    <p className="font-mono text-sm p-3 bg-red-100 rounded-md text-left text-red-800 break-words">{error}</p>
                    <p className="text-xs text-gray-500 mt-4">Verifica che l'URL API sia corretto e che il servizio sia attivo e raggiungibile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rental-container">
            <style>{cssStyles}</style>

            {/* Header e Barra di Navigazione */}
            <header className="rental-header p-4 flex justify-between items-center sticky top-0 z-10">
                <h1 className="text-2xl font-bold flex items-center">
                    <Film className="w-6 h-6 mr-2 text-blue-300" />
                    Gestione Noleggi
                </h1>
                <div className="flex space-x-4">
                    
                    {/* Pulsante Carrello */}
                    <button 
                        onClick={goToCart} 
                        className="cart-button bg-gray-700 text-white p-2 rounded-full shadow-md flex items-center"
                        title="Vai al Carrello"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="cart-badge">{cartCount}</span>
                        )}
                    </button>

                    {/* Altri Pulsanti di Navigazione */}
                    <button 
                        onClick={handleBackToDashboard} 
                        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-md transition"
                        title="Dashboard"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-md transition"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Contenuto Principale */}
            <main className="p-4 sm:p-8 max-w-6xl mx-auto">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Catalogo Film Disponibili ({films.length} titoli)</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {films.map(movie => (
                        // Usiamo l'ID o il titolo come fallback per la chiave
                        <div key={movie.id || movie.title} className="card p-5 border border-gray-200 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{movie.title}</h3>
                                {/* Assumiamo che il microservizio restituisca duration in minuti */}
                                <p className="text-sm text-gray-500 mb-1">Durata: {movie.duration || 'N/A'} min</p> 
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <p className="text-lg font-bold text-green-600">€ {movie.price?.toFixed(2) || 'N/A'}</p> 
                                
                                {movie.available ? (
                                    <button
                                        onClick={() => handleAddToCart(movie)}
                                        className="add-to-cart-button text-white font-medium py-2 px-4 rounded-full shadow-lg flex items-center text-sm hover:shadow-xl"
                                    >
                                        Aggiungi 
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </button>
                                ) : (
                                    <span className="text-red-500 font-medium text-sm">Non disponibile</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                {films.length === 0 && !loading && !error && (
                    <p className="text-center text-gray-500 mt-10">Nessun film trovato nel catalogo. Il microservizio ha restituito un elenco vuoto.</p>
                )}
            </main>
        </div>
    );
};

export default Rental;