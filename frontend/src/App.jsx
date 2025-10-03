import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Correzione: Si assume che useWallet.jsx sia nella stessa directory di App.jsx
import { WalletProvider } from './componenti/useWallet.jsx'; 

// 🛑 Correzione: Si assume che tutti i componenti siano nella stessa directory (root)
import Login from './componenti/Login.jsx';
import Dashboard from './componenti/Dashboard.jsx'; 
import Rental from './componenti/Rental.jsx'; 
import FilmCatalog from './componenti/FilmCatalog.jsx';
import UserProfileSection from './componenti/UserProfileSection.jsx'; 
import BankDashboard from './componenti/BankDashboard.jsx'; 
import Cart from './componenti/Cart.jsx'; 

// Componente per la rotta protetta
const PrivateRoute = ({ children }) => {
    // Nota: Il localStorage non è persistente tra gli ambienti, 
    // ma manteniamo questo per il mock di autenticazione.
    const isAuthenticated = localStorage.getItem('authToken');
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        // Avvolgiamo l'intera applicazione con il Provider
        <Router>
            <WalletProvider> {/* Provider per lo stato del portafoglio */}
                <Routes>
                    {/* Rotte pubbliche */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                    
                    {/* Tutte le rotte protette hanno ora accesso al WalletContext */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/rentals"
                        element={
                            <PrivateRoute>
                                <Rental />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/filmCatalog"
                        element={
                            <PrivateRoute>
                                <FilmCatalog />
                            </PrivateRoute>
                        }
                    />

                    {/* Rotta Carrello che usa useWallet */}
                    <Route
                        path="/cart"
                        element={
                            <PrivateRoute>
                                <Cart /> {/* Il componente Cart ora ha accesso al Provider */}
                            </PrivateRoute>
                        }
                    />
                    
                    {/* ROTTE PROTETTE PER I MICROSERVIZI */}
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <UserProfileSection />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/bank"
                        element={
                            <PrivateRoute>
                                <BankDashboard />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </WalletProvider>
        </Router>
    );
}

export default App;
