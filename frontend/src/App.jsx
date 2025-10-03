import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './componenti/Login';
import Dashboard from './componenti/Dashboard'; 
import Rental from './componenti/Rental'; 
import FilmCatalog from './componenti/FilmCatalog';
// NUOVI IMPORT
import UserProfileSection from './componenti/UserProfileSection'; 
import BankDashboard from './componenti/BankDashboard'; 
import Cart from './componenti/Cart'; // <-- NUOVO IMPORT

// Componente per la rotta protetta
const PrivateRoute = ({ children }) => {
    // 🚨 CONSIGLIO: Valuta se usare un Context o Redux per lo stato globale di autenticazione 
    // invece di accedere direttamente a localStorage in ogni componente, ma per ora è OK.
    const isAuthenticated = localStorage.getItem('authToken');
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Rotte pubbliche */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" />} />
                
                {/* Rotte protette esistenti */}
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

                {/* NUOVA ROTTA PROTETTA PER IL CARRELLO */}
                <Route
                    path="/cart"
                    element={
                        <PrivateRoute>
                            <Cart /> {/* <-- NUOVO COMPONENTE */}
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
        </Router>
    );
}

export default App;
