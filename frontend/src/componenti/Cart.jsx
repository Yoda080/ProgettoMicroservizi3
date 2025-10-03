import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, Trash2, CheckCircle, Film, DollarSign, Loader, AlertTriangle } from 'lucide-react';

// Mock per la navigazione (come in Rental.jsx)
const useNavigate = () => {
    // Funzione di simulazione che logga la navigazione
    const navigate = (newPath) => { console.log(`Simulazione navigazione a: ${newPath}`); };
    return navigate;
};

// Componente Cart
const Cart = () => {
    const navigate = useNavigate();
    const CART_STORAGE_KEY = 'movieCart';
    
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

    // Funzione per aggiornare il carrello in React e in localStorage
    const updateCartInStorage = (newCart, successText = '') => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
            setCartItems(newCart);
            if (successText) {
                setMessage(successText);
                setMessageType('info');
            }
        } catch (e) {
            console.error("Errore nel salvataggio del carrello in localStorage:", e);
            setMessage("Errore critico: impossibile salvare lo stato del carrello in locale.");
            setMessageType('error');
        }
    };

    // Funzione per caricare il carrello all'avvio
    useEffect(() => {
        const loadCart = () => {
            try {
                const storedCart = localStorage.getItem(CART_STORAGE_KEY);
                if (storedCart) {
                    setCartItems(JSON.parse(storedCart));
                }
            } catch (e) {
                console.error("Errore nel caricamento del carrello da localStorage:", e);
                setMessage("Errore nel caricamento iniziale del carrello.");
                setMessageType('error');
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        };
        
        loadCart();
    }, []);

    // Rimuove un elemento dal carrello
    const handleRemoveItem = (movieId) => {
        const itemToRemove = cartItems.find(item => item.id === movieId);
        if (!itemToRemove) return;

        const newCart = cartItems.filter(item => item.id !== movieId);
        updateCartInStorage(newCart, `Film "${itemToRemove.title}" rimosso dal carrello.`);
    };

    // Simula il checkout (noleggio multiplo)
    const handleCheckout = () => {
        if (cartItems.length === 0) {
            setMessage("Il carrello è vuoto! Aggiungi dei film prima di procedere.");
            setMessageType('error');
            return;
        }

        // In una vera applicazione, qui faresti una singola API POST /api/rentals/checkout 
        // inviando l'array di IDs dei film.
        
        console.log("Simulazione checkout per i seguenti film:", cartItems.map(i => i.title));
        
        // Svuota il carrello dopo il checkout simulato
        updateCartInStorage([], ""); // Non mostro il messaggio di successo qui, lo mostro dopo
        
        setMessage("🎉 Checkout completato con successo! I film sono stati noleggiati.");
        setMessageType('success');
    };
    
    // Calcola il costo totale simulato (assumendo un prezzo fisso se non specificato nell'oggetto film)
    const getMoviePrice = (movie) => movie.price || 3.99; 
    const totalCost = cartItems.reduce((sum, item) => sum + getMoviePrice(item), 0).toFixed(2);
    
    // Componente per mostrare un messaggio di stato
    const MessageDisplay = ({ type, text }) => {
        if (!text) return null;
        const colors = {
            error: 'bg-red-100 border-red-500 text-red-700',
            success: 'bg-green-100 border-green-500 text-green-700',
            info: 'bg-blue-100 border-blue-500 text-blue-700',
        };
        const Icon = type === 'error' ? AlertTriangle : (type === 'success' ? CheckCircle : ShoppingCart);

        return (
            <div className={`p-4 mb-6 rounded-xl border-l-4 ${colors[type]} shadow-lg flex items-center transition duration-300`}>
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <p className="font-medium">{text}</p>
            </div>
        );
    };

    // Stili CSS (per coerenza con Rental.jsx)
    const cssStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        .cart-container { 
            font-family: 'Inter', sans-serif; 
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); /* Sfondo più chiaro/verde */
            padding: 2rem;
            color: #333;
        }
        .cart-header { 
            background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%); 
            box-shadow: 0 6px 15px rgba(67, 160, 71, 0.3);
            color: white;
            border-radius: 1rem;
        }
        .cart-card {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .checkout-button {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); /* Smeraldo */
            transition: all 0.3s ease;
        }
        .checkout-button:hover:not(:disabled) {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            transform: scale(1.02);
            box-shadow: 0 4px 10px rgba(5, 150, 105, 0.4);
        }
        .checkout-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .remove-button {
            color: #ef4444; 
            transition: color 0.2s, transform 0.2s;
        }
        .remove-button:hover {
            color: #b91c1c;
            transform: scale(1.1);
        }
        .back-button {
            background: linear-gradient(135deg, #8a9a5b 0%, #6b8e23 100%);
            transition: all 0.3s ease;
        }
        .back-button:hover {
            transform: scale(1.05);
        }
        /* Responsività */
        @media (min-width: 1024px) {
            .h-fit { height: fit-content; }
        }
    `;


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <style>{cssStyles}</style>
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-green-600 mb-4" />
                    <p className="text-xl text-gray-700 font-semibold">Caricamento carrello...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="cart-container p-4 sm:p-8">
            <style>{cssStyles}</style>
            
            <div className="max-w-4xl mx-auto">
                <header className="cart-header flex flex-col sm:flex-row justify-between items-center py-6 mb-8 p-6">
                    <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center mb-4 sm:mb-0">
                        <ShoppingCart className="w-8 h-8 sm:w-9 sm:h-9 mr-4 text-white" />
                        Il Tuo Carrello
                    </h1>
                    <button
                        onClick={() => navigate('/rentals')}
                        className="back-button text-white font-semibold py-2 px-4 rounded-full shadow-lg flex items-center text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Torna ai Noleggi
                    </button>
                </header>

                <MessageDisplay type={messageType} text={message} />
                
                {cartItems.length === 0 && messageType !== 'success' ? (
                    <div className="cart-card p-10 rounded-xl text-center border-2 border-dashed border-gray-300 bg-gray-50">
                        <ShoppingCart className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                        <p className="text-xl text-gray-600 font-medium">Il carrello è vuoto.</p>
                        <p className="text-gray-500 mt-2">Aggiungi film dalla sezione "Gestione Noleggi"!</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Lista Articoli Carrello */}
                        <div className="lg:w-2/3 space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-card p-4 rounded-xl flex justify-between items-center transition duration-300 hover:shadow-md border border-gray-100">
                                    <div className="flex items-center">
                                        <Film className="w-6 h-6 mr-4 text-green-600 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.title}</p>
                                            <p className="text-sm text-gray-500">Durata: {item.duration || 'N/A'} min</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end sm:flex-row sm:items-center gap-2 sm:gap-4">
                                        <span className="font-bold text-lg text-green-700">€ {getMoviePrice(item).toFixed(2)}</span>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="remove-button p-2 rounded-full hover:bg-red-50"
                                            title="Rimuovi dal carrello"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Riepilogo e Checkout */}
                        <div className="lg:w-1/3 cart-card p-6 rounded-xl lg:sticky lg:top-8 h-fit border-t-4 border-green-500">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Riepilogo Ordine</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Articoli:</span>
                                    <span className="font-medium">{cartItems.length}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Costo Noleggio (Simulato):</span>
                                    <span className="font-medium">€ {totalCost}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl pt-2 border-t border-gray-200 text-gray-900">
                                    <span>Totale (Simulato):</span>
                                    <span>€ {totalCost}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0}
                                className="checkout-button w-full text-white font-bold py-3 rounded-lg flex items-center justify-center shadow-lg disabled:opacity-50"
                            >
                                <DollarSign className="w-5 h-5 mr-2" />
                                Procedi al Noleggio ({cartItems.length})
                            </button>
                            <p className="text-xs text-gray-500 mt-3 text-center italic">
                                *Questa è una simulazione di noleggio multiplo.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
