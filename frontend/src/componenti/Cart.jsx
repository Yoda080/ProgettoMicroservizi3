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
        if (onNavigate) {
            onNavigate(view);
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        }
    };

    const displayMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    useEffect(() => {
        const loadCart = () => {
            try {
                const storedCart = localStorage.getItem(CART_STORAGE_KEY);
                if (storedCart) {
                    setCartItems(JSON.parse(storedCart));
                }
            } catch (error) {
                displayMessage("Errore nel caricamento del carrello", 'error');
            } finally {
                setLoading(false);
            }
        };
        loadCart();
    }, []);

    const handleRemoveItem = (movieId) => {
        const itemToRemove = cartItems.find(item => item.id === movieId);
        if (!itemToRemove) return;

        const newCart = cartItems.filter(item => item.id !== movieId);
        setCartItems(newCart);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
        displayMessage(`"${itemToRemove.title}" rimosso dal carrello`, 'info');
    };

    const getMoviePrice = (movie) => movie.price || 3.99;

    const totalCost = cartItems.reduce((sum, item) => sum + getMoviePrice(item), 0).toFixed(2);
    const totalCostNum = parseFloat(totalCost);
    
    const isSufficientFunds = balance !== null && totalCostNum <= balance;
    const canCheckout = cartItems.length > 0 && isSufficientFunds && !isProcessing && !isWalletLoading;

    const saveRentalsToLocalStorage = (rentals) => {
        try {
            const existingRentals = JSON.parse(localStorage.getItem(RENTALS_STORAGE_KEY) || '[]');
            const updatedRentals = [...existingRentals, ...rentals];
            localStorage.setItem(RENTALS_STORAGE_KEY, JSON.stringify(updatedRentals));
            return true;
        } catch (error) {
            return false;
        }
    };

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
            
            const newBalance = await debitWallet(totalCostNum);
            
            const purchasedRentals = cartItems.map(item => ({
                id: `rental-${Date.now()}-${item.id}-${Math.random().toString(36).substr(2, 9)}`,
                movieId: item.id,
                movieTitle: item.title,
                rentalDate: new Date().toISOString(),
                expirationDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
                price: getMoviePrice(item)
            }));

            saveRentalsToLocalStorage(purchasedRentals);
            
            setCartItems([]);
            localStorage.removeItem(CART_STORAGE_KEY);
            
            displayMessage(
                `Acquisto completato! ${purchasedRentals.length} film noleggiati. Nuovo saldo: € ${newBalance.toFixed(2)}`, 
                'success'
            );

            setTimeout(() => {
                navigateTo('rentals');
            }, 3000);

        } catch (error) {
            displayMessage(`Checkout fallito: ${error.message}`, 'error');
            fetchBalance();
        } finally {
            setIsProcessing(false);
        }
    };

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
            <div className={`message-container ${colors[currentType]}`}>
                <Icon className={`message-icon ${isProcessing && currentType === 'info' ? 'animate-spin' : ''}`} />
                <p className="message-text">{currentMessage}</p>
            </div>
        );
    };

    if (loading || isWalletLoading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <Loader className="loading-spinner" />
                    <p className="loading-text">
                        {isWalletLoading ? "Caricamento portafoglio..." : "Caricamento carrello..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="cart-content">
                {/* Header */}
                <div className="cart-header">
                    <div className="header-content">
                        <h1 className="cart-title">
                            <ShoppingCart className="cart-icon" />
                            Il Tuo Carrello
                        </h1>
                        <button
                            onClick={handleBack}
                            className="back-button"
                        >
                            <ArrowLeft className="button-icon" />
                            Torna ai Noleggi
                        </button>
                    </div>
                </div>

                <MessageDisplay />

                {/* Contenuto principale */}
                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <ShoppingCart className="empty-cart-icon" />
                        <h2 className="empty-cart-title">Il carrello è vuoto</h2>
                        <p className="empty-cart-text">Aggiungi alcuni film dalla sezione noleggi!</p>
                        <button
                            onClick={() => navigateTo('rentals')}
                            className="explore-button"
                        >
                            Esplora Film
                        </button>
                    </div>
                ) : (
                    <div className="cart-layout">
                        {/* Lista film nel carrello */}
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-info">
                                        <div className="item-icon">
                                            <Film className="film-icon" />
                                        </div>
                                        <div className="item-details">
                                            <h3 className="item-title">{item.title}</h3>
                                            <p className="item-duration">
                                                {item.duration ? `${item.duration} min` : 'Durata non disponibile'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <span className="item-price">
                                            € {getMoviePrice(item).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="remove-button"
                                            disabled={isProcessing}
                                            title="Rimuovi dal carrello"
                                        >
                                            <Trash2 className="trash-icon" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Riepilogo ordine e checkout */}
                        <div className="order-summary">
                            <div className="summary-card">
                                <h2 className="summary-title">Riepilogo Ordine</h2>
                                
                                {/* Saldo wallet */}
                                <div className={`balance-display ${isSufficientFunds ? 'sufficient-funds' : 'insufficient-funds'}`}>
                                    <span className="balance-label">
                                        <Wallet className="wallet-icon" />
                                        Saldo:
                                    </span>
                                    <span className="balance-amount">€ {balance !== null ? balance.toFixed(2) : '0.00'}</span>
                                </div>

                                <div className="summary-details">
                                    <div className="detail-row">
                                        <span>Film nel carrello:</span>
                                        <span className="detail-value">{cartItems.length}</span>
                                    </div>
                                    <div className="total-row">
                                        <span>Totale:</span>
                                        <span className="total-amount">€ {totalCost}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={!canCheckout}
                                    className={`checkout-button ${canCheckout ? 'enabled' : 'disabled'}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader className="button-spinner" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <DollarSign className="dollar-icon" />
                                            Checkout (€ {totalCost})
                                        </>
                                    )}
                                </button>

                                {!isSufficientFunds && balance !== null && (
                                    <p className="insufficient-funds-message">
                                        Fondi insufficienti per completare l'acquisto
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