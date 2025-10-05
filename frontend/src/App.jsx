import React, { useEffect, useState } from 'react';
import { WalletProvider } from './componenti/useWallet.jsx'; 
import Login from './componenti/Login.jsx';
import Registrazione from './componenti/Registrazione.jsx';
import Dashboard from './componenti/Dashboard.jsx'; 
import Rental from './componenti/Rental.jsx'; 
import FilmCatalog from './componenti/FilmCatalog.jsx';
import UserProfileSection from './componenti/UserProfileSection.jsx';
import BankDashboard from './componenti/BankDashboard.jsx'; 
import Cart from './componenti/Cart.jsx'; 

function App() {
    const [currentView, setCurrentView] = useState('login');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        console.log('🔐 Token al caricamento:', token);
        
        if (token) {
            console.log('✅ Utente autenticato, redirect a dashboard');
            setCurrentView('dashboard');
        } else {
            console.log('❌ Utente non autenticato, rimani su login');
            setCurrentView('login');
        }
    }, []);

    const navigateTo = (view) => {
        console.log('🔄 NAVIGAZIONE: Cambio view da', currentView, 'a', view);
        setCurrentView(view);
    };

    const renderView = () => {
        console.log('🎯 RENDER: Visualizzando view:', currentView);
        
        switch (currentView) {
            case 'login':
                return <Login 
                    onLoginSuccess={() => navigateTo('dashboard')} 
                    onSwitchToRegister={() => navigateTo('registrazione')}
                />;
            case 'registrazione':
                return <Registrazione 
                    onRegisterSuccess={() => navigateTo('dashboard')} 
                    onSwitchToLogin={() => navigateTo('login')}
                />;
            case 'dashboard':
                return <Dashboard onNavigate={navigateTo} />;
            case 'filmCatalog':
                return <FilmCatalog 
                    onBack={() => navigateTo('dashboard')} 
                    onNavigate={navigateTo} 
                />;
            case 'rentals':
                return <Rental 
                    onBack={() => navigateTo('dashboard')} 
                    onNavigate={navigateTo} 
                />;
            case 'profile':
                return <UserProfileSection 
                    onBack={() => navigateTo('dashboard')} 
                    onNavigate={navigateTo} 
                />;
            case 'bank':
                return <BankDashboard 
                    onBack={() => navigateTo('dashboard')} 
                    onNavigate={navigateTo} 
                />;
            case 'cart':
                return <Cart 
                    onBack={() => navigateTo('dashboard')} 
                    onNavigate={navigateTo} 
                />;
            default:
                return <Login onLoginSuccess={() => navigateTo('dashboard')} />;
        }
    };

    return (
        <WalletProvider>
            <div className="app">
                {renderView()}
            </div>
        </WalletProvider>
    );
}

export default App;