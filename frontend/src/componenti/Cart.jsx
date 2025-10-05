import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, Trash2, CheckCircle, Film, DollarSign, Loader, AlertTriangle, Wallet } from 'lucide-react';
import { useWallet } from './useWallet';

const Cart = ({ onBack, onNavigate }) => {
    const { 
        balance, 
        isLoading: isWalletLoading, 
        walletError, 
        debitWallet,
        fetchBalance 
    } = useWallet(); 
    
    const CART_STORAGE_KEY = 'movieCart';
    const RENTALS_STORAGE_KEY = 'userRentals';
    
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

    const navigateTo = (view) => {
        console.log('🛒 Navigazione a:', view);
        if (onNavigate) {
            onNavigate(view);
        }
    };

    const handleBack = () => {
        console.log('🛒 Torno indietro');
        if (onBack) {
            onBack();
        }
    };

    const displayMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    // Carica il carrello dal localStorage
    useEffect(() => {
        const loadCart = () => {
            try {
                const storedCart = localStorage.getItem(CART_STORAGE_KEY);
                if (storedCart) {
                    setCartItems(JSON.parse(storedCart));
                }
            } catch (error) {
                console.error("Errore nel caricamento del carrello:", error);
                displayMessage("Errore nel caricamento del carrello", 'error');
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
        setCartItems(newCart);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
        displayMessage(`"${itemToRemove.title}" rimosso dal carrello`, 'info');
    };

    // Calcola il prezzo del film
    const getMoviePrice = (movie) => movie.price || 3.99;

    // Calcola il totale
    const totalCost = cartItems.reduce((sum, item) => sum + getMoviePrice(item), 0).toFixed(2);
    const totalCostNum = parseFloat(totalCost);
    
    // Verifica condizioni per il checkout
    const isSufficientFunds = balance !== null && totalCostNum <= balance;
    const canCheckout = cartItems.length > 0 && isSufficientFunds && !isProcessing && !isWalletLoading;

    // ✅ FUNZIONE PER SALVARE I NOLEGGI NEL LOCALSTORAGE
    const saveRentalsToLocalStorage = (rentals) => {
        try {
            const existingRentals = JSON.parse(localStorage.getItem(RENTALS_STORAGE_KEY) || '[]');
            const updatedRentals = [...existingRentals, ...rentals];
            localStorage.setItem(RENTALS_STORAGE_KEY, JSON.stringify(updatedRentals));
            console.log('✅ Noleggi salvati nel localStorage:', rentals.length);
            return true;
        } catch (error) {
            console.error('❌ Errore nel salvataggio dei noleggi:', error);
            return false;
        }
    };

    // ✅ CHECKOUT SEMPLIFICATO - SOLO PAGAMENTO E LOCALSTORAGE
    const handleCheckout = async () => {
        if (!canCheckout) {
            if (cartItems.length === 0) {
                displayMessage("Il carrello è vuoto!", 'error');
            } else if (!isSufficientFunds) {
                displayMessage("Fondi insufficienti nel portafoglio!", 'error');
            }
            return;
        }

        setIsProcessing(true);
        setMessage('');

        try {
            displayMessage("Elaborazione pagamento...", 'info');
            
            // ✅ FASE 1: SOLO PAGAMENTO (salta completamente il servizio rentals)
            const newBalance = await debitWallet(totalCostNum);
            
            // ✅ FASE 2: SALVA I NOLEGGI NEL LOCALSTORAGE
            const purchasedRentals = cartItems.map(item => ({
                id: `rental-${Date.now()}-${item.id}-${Math.random().toString(36).substr(2, 9)}`,
                movieId: item.id,
                movieTitle: item.title,
                rentalDate: new Date().toISOString(),
                expirationDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 ore
                price: getMoviePrice(item)
            }));

            const saveSuccess = saveRentalsToLocalStorage(purchasedRentals);
            
            // ✅ FASE 3: SUCCESSO - Svuota carrello
            setCartItems([]);
            localStorage.removeItem(CART_STORAGE_KEY);
            
            displayMessage(
                `✅ Acquisto completato! ${purchasedRentals.length} film noleggiati. Nuovo saldo: € ${newBalance.toFixed(2)}`, 
                'success'
            );

            console.log('🎬 Noleggi creati:', purchasedRentals);

            setTimeout(() => {
                navigateTo('rentals');
            }, 3000);

        } catch (error) {
            console.error("❌ Errore durante il checkout:", error);
            displayMessage(`Checkout fallito: ${error.message}`, 'error');
            
            // Ricarica il saldo in caso di errore
            fetchBalance();
        } finally {
            setIsProcessing(false);
        }
    };

    // Componente per i messaggi
    const MessageDisplay = () => {
        if (!message && !walletError) return null;
        
        const currentMessage = walletError || message;
        const currentType = walletError ? 'error' : messageType;
        
        const colors = {
            error: 'bg-red-100 border-red-500 text-red-700',
            success: 'bg-green-100 border-green-500 text-green-700',
            info: 'bg-blue-100 border-blue-500 text-blue-700',
        };
        
        const Icon = currentType === 'error' ? AlertTriangle : 
                    currentType === 'success' ? CheckCircle : 
                    (isProcessing ? Loader : ShoppingCart);
        
        return (
            <div className={`p-4 mb-6 rounded-xl border-l-4 ${colors[currentType]} shadow-lg flex items-center transition duration-300`}>
                <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isProcessing && currentType === 'info' ? 'animate-spin' : ''}`} />
                <p className="font-medium">{currentMessage}</p>
            </div>
        );
    };

    // Schermata di caricamento
    if (loading || isWalletLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-green-600 mb-4 mx-auto" />
                    <p className="text-xl text-gray-700 font-semibold">
                        {isWalletLoading ? "Caricamento portafoglio..." : "Caricamento carrello..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-green-600 text-white rounded-xl p-6 mb-8 shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        <h1 className="text-3xl sm:text-4xl font-bold flex items-center mb-4 sm:mb-0">
                            <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 mr-4" />
                            Il Tuo Carrello
                        </h1>
                        <button
                            onClick={handleBack}
                            className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center transition-colors shadow-md"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Torna ai Noleggi
                        </button>
                    </div>
                </div>

                <MessageDisplay />

                {/* Contenuto principale */}
                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border-2 border-dashed border-gray-300">
                        <ShoppingCart className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                        <h2 className="text-2xl font-semibold text-gray-600 mb-3">Il carrello è vuoto</h2>
                        <p className="text-gray-500 mb-6">Aggiungi alcuni film dalla sezione noleggi!</p>
                        <button
                            onClick={() => navigateTo('rentals')}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md"
                        >
                            Esplora Film
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lista film nel carrello */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                            <Film className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {item.duration ? `${item.duration} min` : 'Durata non disponibile'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-green-700 text-lg">
                                            € {getMoviePrice(item).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            disabled={isProcessing}
                                            title="Rimuovi dal carrello"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Riepilogo ordine e checkout */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-green-500 sticky top-6">
                                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Riepilogo Ordine</h2>
                                
                                {/* Saldo wallet */}
                                <div className={`flex justify-between items-center text-lg font-semibold p-4 mb-6 rounded-lg ${
                                    isSufficientFunds ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                }`}>
                                    <span className="flex items-center">
                                        <Wallet className="w-5 h-5 mr-2" />
                                        Saldo:
                                    </span>
                                    <span>€ {balance !== null ? balance.toFixed(2) : '0.00'}</span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Film nel carrello:</span>
                                        <span className="font-medium">{cartItems.length}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold pt-4 border-t border-gray-200">
                                        <span>Totale:</span>
                                        <span className="text-green-700 text-xl">€ {totalCost}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={!canCheckout}
                                    className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                                        canCheckout 
                                            ? 'bg-green-600 hover:bg-green-700 hover:shadow-xl transform hover:scale-105' 
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader className="w-5 h-5 mr-3 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <DollarSign className="w-5 h-5 mr-2" />
                                            Checkout (€ {totalCost})
                                        </>
                                    )}
                                </button>

                                {!isSufficientFunds && balance !== null && (
                                    <p className="text-red-600 text-sm mt-3 text-center font-medium">
                                        ❌ Fondi insufficienti per completare l'acquisto
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;