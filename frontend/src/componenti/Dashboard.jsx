import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { Doughnut } from 'react-chartjs-2';
import Shuffle from './Shuffle';
import Prism from './Prism'; // IMPORT AGGIUNTO
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './EnhancedDashboard.css';

// Registra i componenti di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const EnhancedDashboard = ({ onNavigate }) => {
  const username = localStorage.getItem('username') || 'Utente';
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Animazione per il container principale
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { duration: 600 }
  });

  useEffect(() => {
    if (token && userId) {
      loadUserData();
      loadNotifications();
      loadRecentActivity();
    }
  }, [token, userId]);

  const loadUserData = () => {
    const mockStats = {
      totalRentals: 15,
      activeRentals: 3,
      totalSpent: 45.50,
      favoriteGenre: 'Azione'
    };
    setUserStats(mockStats);
  };

  const loadNotifications = () => {
    const mockNotifications = [
      { id: 1, message: 'Film "Inception" in scadenza domani', read: false, type: 'warning' },
      { id: 2, message: 'Nuovo film "Dune" disponibile', read: false, type: 'info' },
    ];
    setNotifications(mockNotifications);
  };

  const loadRecentActivity = () => {
    const mockActivities = [
      { id: 1, action: 'noleggio', film: 'Inception', date: '2024-01-15', icon: '📥' },
      { id: 2, action: 'restituzione', film: 'The Matrix', date: '2024-01-14', icon: '📤' },
      { id: 3, action: 'ricarica', amount: 20.00, date: '2024-01-13', icon: '💰' },
    ];
    setRecentActivity(mockActivities);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = '/';
  };

  const handleNavigation = (section) => {
    if (!token) {
      alert('Devi effettuare il login prima');
      if (onNavigate) onNavigate('login');
      return;
    }
    if (onNavigate) {
      onNavigate(section);
    }
  };

  const handleQuickSearch = () => {
    if (searchQuery.trim()) {
      handleNavigation('filmCatalog');
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Dati per il grafico
  const rentalChartData = {
    labels: ['In Noleggio', 'Restituiti', 'In Scadenza'],
    datasets: [
      {
        data: [3, 12, 1],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    },
    cutout: '60%'
  };

  if (!token) {
    if (onNavigate) {
      onNavigate('login');
    }
    return null;
  }

  return (
    <animated.div style={fadeIn} className="dashboard-container">
      {/* BACKGROUND CON PRISM - AGGIUNTO */}
      <div className="prism-background">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.5}
          glow={1}
        />
      </div>
      
      {/* OVERLAY PER LEGGIBILITÀ - AGGIUNTO */}
      <div className="prism-overlay"></div>

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">
            🎬 Movie Rental Dashboard
          </h1>
         </div>
        
        <div className="header-right">
          <div className="notification-wrapper">
            <button className="notification-bell">
              🔔
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <span className="welcome-message">
                Ciao, <strong>{username}</strong>!
              </span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Banner di Benvenuto CON SHUFFLE */}
        <div className="welcome-banner">
          <Shuffle
            text={`Benvenuto nella tua Dashboard, ${username}!`}
            tag="h2"
            shuffleDirection="right"
            duration={0.6}
            stagger={0.02}
            ease="power3.out"
            animationMode="evenodd"
            triggerOnHover={true}
            triggerOnce={false}
            className="welcome-title"
            textAlign="center"
            onShuffleComplete={() => console.log('Titolo shuffle completato!')}
          />
          
          <Shuffle
            text="Gestisci i tuoi noleggi, esplora nuovi film e controlla il tuo account"
            tag="p"
            shuffleDirection="up"
            duration={0.5}
            stagger={0.01}
            ease="power2.out"
            animationMode="evenodd"
            triggerOnHover={true}
            triggerOnce={false}
            className="welcome-subtitle"
            textAlign="center"
            maxDelay={0.1}
          />
        </div>

        {/* Grid Principale */}
        <div className="dashboard-grid">
          {/* Sezione Cards Principali */}
          <div className="main-cards">
            <AnimatedCard delay={100}>
              <DashboardCard 
                icon="🎬"
                title="Catalogo Film"
                description="Esplora il nostro catalogo completo di film disponibili per il noleggio"
                buttonText="Vai al Catalogo"
                onButtonClick={() => handleNavigation('filmCatalog')}
                color="primary"
              />
            </AnimatedCard>

            <AnimatedCard delay={200}>
              <DashboardCard 
                icon="📚"
                title="I miei Noleggi"
                description="Visualizza e gestisci i film che hai attualmente in noleggio"
                buttonText="Vai ai Noleggi"
                onButtonClick={() => handleNavigation('rentals')}
                color="rentals"
              />
            </AnimatedCard>

            <AnimatedCard delay={300}>
              <DashboardCard 
                icon="👤"
                title="Profilo Utente"
                description="Gestisci il tuo profilo, visualizza statistiche e storico attività"
                buttonText="Vedi Profilo"
                onButtonClick={() => handleNavigation('profile')}
                color="profile"
              />
            </AnimatedCard>

            <AnimatedCard delay={400}>
              <DashboardCard 
                icon="💰"
                title="Gestione Credito"
                description="Controlla il tuo saldo, deposita fondi e visualizza le transazioni"
                buttonText="Vai al Conto"
                onButtonClick={() => handleNavigation('bank')}
                color="bank"
              />
            </AnimatedCard>
          </div>

          {/* Sidebar con Stats e Attività */}
          <div className="sidebar">
            {/* Statistiche Utente */}
            {userStats && (
              <div className="stats-widget">
                <div className="widget-header">
                  <Shuffle
                    text="📊 Le tue Statistiche"
                    tag="div"
                    shuffleDirection="left"
                    duration={0.4}
                    stagger={0.015}
                    triggerOnHover={true}
                    className="widget-title"
                  />
                </div>
                <div className="stats-content">
                  <div className="chart-container">
                    <Doughnut data={rentalChartData} options={chartOptions} />
                  </div>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Noleggi Totali:</span>
                      <span className="stat-value">{userStats.totalRentals}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Noleggi Attivi:</span>
                      <span className="stat-value">{userStats.activeRentals}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Spesa Totale:</span>
                      <span className="stat-value">€{userStats.totalSpent}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Genere Preferito:</span>
                      <span className="stat-value">{userStats.favoriteGenre}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attività Recente */}
            <div className="activity-widget">
              <div className="widget-header">
                <Shuffle
                  text="📜 Attività Recente"
                  tag="div"
                  shuffleDirection="right"
                  duration={0.4}
                  stagger={0.015}
                  triggerOnHover={true}
                  className="widget-title"
                />
              </div>
              <div className="activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <span className="activity-icon">{activity.icon}</span>
                    <div className="activity-info">
                      <p className="activity-text">
                        {activity.action === 'noleggio' && `Noleggiato: ${activity.film}`}
                        {activity.action === 'restituzione' && `Restituito: ${activity.film}`}
                        {activity.action === 'ricarica' && `Ricarica: €${activity.amount}`}
                      </p>
                      <small className="activity-date">
                        {new Date(activity.date).toLocaleDateString('it-IT')}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Azioni Rapide */}
            <div className="quick-actions-widget">
              <div className="widget-header">
                <Shuffle
                  text="Azioni Rapide"
                  tag="h3"
                  shuffleDirection="down"
                  duration={0.4}
                  stagger={0.01}
                  triggerOnHover={true}
                  className="widget-title"
                />
              </div>
              <div className="quick-actions">
                <button 
                  onClick={() => handleNavigation('filmCatalog')}
                  className="quick-action-btn"
                >
                  🎬 Nuova Ricerca
                </button>
                <button 
                  onClick={() => handleNavigation('rentals')}
                  className="quick-action-btn"
                >
                  📚 I miei Noleggi
                </button>
                <button 
                  onClick={() => handleNavigation('bank')}
                  className="quick-action-btn"
                >
                  💰 Ricarica Credito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </animated.div>
  );
};

// Componente Card Animato
const AnimatedCard = ({ children, delay = 0 }) => {
  const props = useSpring({
    from: { opacity: 0, transform: 'translateY(30px) scale(0.95)' },
    to: { opacity: 1, transform: 'translateY(0px) scale(1)' },
    delay: delay,
    config: { tension: 120, friction: 14 }
  });

  return <animated.div style={props} className="animated-card">{children}</animated.div>;
};

// Componente Card Riusabile
const DashboardCard = ({ icon, title, description, buttonText, onButtonClick, color }) => (
  <div className="dashboard-card">
    <div className="card-header">
      <div className="card-icon">{icon}</div>
    </div>
    <div className="card-body">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <div className="card-footer">
      <button onClick={onButtonClick} className={`card-button ${color}`}>
        {buttonText}
      </button>
    </div>
  </div>
);

export default EnhancedDashboard;