import React, { useState, useEffect } from 'react';
import './FilmCatalog.css';

const FilmCatalog = ({ onBack }) => {
  const [films, setFilms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);

  const API_BASE = 'http://localhost:5002/api/movies';
  const placeholderPoster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiMyMTI1MjkiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4Ij7imYLiiJjimYDvuI88L3RleHQ+PC9zdmc+';

  const fetchFilms = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        let filmsArray = data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          filmsArray = data.movies || data.items || data.data || [];
        }
        
        if (Array.isArray(filmsArray)) {
          const filmsWithMappedFields = filmsArray.map(film => ({
            title: film.title || 'Titolo sconosciuto',
            genre: film.category || 'Genere non disponibile',
            year: film.releaseYear || 'N/D',
            director: film.director || 'Regista non disponibile',
            description: film.description || 'Descrizione non disponibile',
            price: film.price || 0.00,
            duration: film.duration || 'N/D',
            category: film.category || 'Unknown',
            releaseYear: film.releaseYear || 'N/D',
            id: film.id || Math.random().toString(36).substr(2, 9),
            poster: placeholderPoster,
            rating: (Math.random() * 1 + 4).toFixed(1) // Rating simulato
          }));
          
          setFilms(filmsWithMappedFields);
        } else {
          setFilms([]);
          setError('Formato dati non supportato dal server');
        }
      } else {
        setError(`Errore dal server: ${response.status}`);
      }
    } catch (error) {
      setError('Impossibile connettersi al server. Verifica che il backend sia avviato sulla porta 5002');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  // Estrai generi unici dai film
  const genres = ['All', ...new Set(films.map(film => film.genre).filter(Boolean))];

  const toggleGenre = (genre) => {
    if (genre === 'All') {
      setSelectedGenres([]);
    } else {
      setSelectedGenres(prev => 
        prev.includes(genre) 
          ? prev.filter(g => g !== genre)
          : [...prev, genre]
      );
    }
  };

  const filteredFilms = films.filter(film => {
    const matchesSearch = film.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         film.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         film.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(film.genre);
    return matchesSearch && matchesGenre;
  });

  const getSafeValue = (value, defaultValue = 'N/D') => {
    if (!value || value === 'Unknown') return defaultValue;
    return value;
  };
  

  const handleViewDetails = (film) => {
    alert(`Dettagli: ${film.title}\nRegista: ${film.director}\nDescrizione: ${film.description}`);
  };

  return (
    <div className="beautiful-catalog">
      {/* Header */}
      <header className="catalog-hero">
        <div className="hero-content">
          <h1>🎬 Movie Universe</h1>
          <p>Scopri la nostra collezione di {films.length} film straordinari</p>
        </div>
        <button className="back-btn-glow" onClick={onBack}>
          ← Dashboard
        </button>
      </header>

      {error && (
        <div className="error-message-beautiful">
          <h4>❌ Errore di Connessione</h4>
          <p>{error}</p>
          <button onClick={fetchFilms} className="retry-btn-glow">
            🔄 Riprova
          </button>
        </div>
      )}

      {/* Search Section */}
      <div className="search-section-beautiful">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="🔍 Cerca film, regista o genere..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-beautiful"
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="filter-chips">
          {genres.map(genre => (
            <button
              key={genre}
              className={`genre-chip ${selectedGenres.includes(genre) || (genre === 'All' && selectedGenres.length === 0) ? 'active' : ''}`}
              onClick={() => toggleGenre(genre)}
            >
              {getSafeValue(genre)}
            </button>
          ))}
        </div>
      </div>

      {/* Films Grid */}
      {loading ? (
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-meta"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="movies-grid">
          {filteredFilms.map(film => (
            <div key={film.id} className="movie-card-beautiful">
              <div className="card-image-container">
                <img src={film.poster} alt={film.title} />
                <div className="card-overlay">
                  <button className="play-button">▶</button>
                  <div className="card-badge">€{getSafeValue(film.price)}</div>
                </div>
              </div>
              
              <div className="card-content">
                <div className="card-header">
                  <h3 className="card-title">{getSafeValue(film.title)}</h3>
                  <div className="rating">
                    ⭐ {film.rating}
                  </div>
                </div>
                
                <div className="card-meta">
                  <span>{getSafeValue(film.year)}</span>
                  <span>•</span>
                  <span>{getSafeValue(film.genre)}</span>
                  <span>•</span>
                  <span>{getSafeValue(film.duration)}min</span>
                </div>
                
                <p className="card-director">di {getSafeValue(film.director)}</p>
                
                <p className="card-description">
                  {getSafeValue(film.description)}
                </p>
                
               
                  <button 
                    className="btn-secondary"
                    onClick={() => handleViewDetails(film)}
                  >
                    Dettagli
                  </button>
                </div>
              </div>
            
          ))}
        </div>
      )}

      {!loading && filteredFilms.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🎭</div>
          <h3>Nessun film trovato</h3>
          <p>Prova a modificare i filtri di ricerca</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedGenres([]);
            }}
            className="clear-search-btn"
          >
            🔄 Pulisci filtri
          </button>
        </div>
      )}
    </div>
  );
};

export default FilmCatalog;