import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const FilmCatalog = ({ onBack }) => {
  const [films, setFilms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFilm, setEditingFilm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newFilm, setNewFilm] = useState({
    title: '',
    genre: '',
    year: '',
    director: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    releaseYear: ''
  });

  const API_BASE = 'http://localhost:5002/api/movies';

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
          const filmsWithMappedFields = filmsArray.map(film => {
            return {
              title: film.title || 'Titolo sconosciuto',
              genre: film.category || 'Genere non disponibile',
              year: film.releaseYear || 'N/D',
              director: film.director || 'Regista non disponibile',
              description: film.description || 'Descrizione non disponibile',
              price: film.price || 0.00,
              duration: film.duration || 'N/D',
              category: film.category || 'Unknown',
              releaseYear: film.releaseYear || 'N/D',
              id: film.id || Math.random().toString(36).substr(2, 9)
            };
          });
          
          setFilms(filmsWithMappedFields);
        } else {
          setFilms([]);
          setError('Formato dati non supportato dal server');
        }
      } else {
        setError(`Errore dal server: ${response.status} ${response.statusText}`);
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

  const filteredFilms = films.filter(film =>
    film.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    film.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    film.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    film.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSafeValue = (value, defaultValue = 'N/D') => {
    if (value === null || value === undefined || value === '' || value === 'N/D' || value === 'Unknown') {
      return defaultValue;
    }
    return value;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingFilm) {
      setEditingFilm({ ...editingFilm, [name]: value });
    } else {
      setNewFilm({ ...newFilm, [name]: value });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const filmToUpdate = {
        title: editingFilm.title,
        description: editingFilm.description,
        director: editingFilm.director,
        duration: parseInt(editingFilm.duration || 0),
        price: parseFloat(editingFilm.price || 0.00),
        category: editingFilm.genre,
        releaseYear: parseInt(editingFilm.releaseYear || editingFilm.year || 0),
        id: editingFilm.id
      };

      const response = await fetch(`${API_BASE}/${editingFilm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(filmToUpdate)
      });

      if (response.ok) {
        const updatedFilm = await response.json();
        const filmForDisplay = {
          ...updatedFilm,
          director: editingFilm.director,
          genre: editingFilm.genre,
          year: editingFilm.year
        };
        setFilms(prev => prev.map(film => film.id === editingFilm.id ? filmForDisplay : film));
        setEditingFilm(null);
      }
    } catch (error) {
      console.error('Errore nella modifica del film:', error);
    }
  };

  const handleDeleteFilm = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo film?')) {
      try {
        const response = await fetch(`${API_BASE}/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setFilms(prev => prev.filter(film => film.id !== id));
        }
      } catch (error) {
        console.error('Errore nell\'eliminazione del film:', error);
      }
    }
  };

  const handleBackToDashboard = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="film-catalog">
      <header className="catalog-header">
        <h1>Catalogo Film</h1>
        <div>
          <button className="back-btn" onClick={handleBackToDashboard}>
            Torna alla Dashboard
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <h4>Errore di Connessione</h4>
          <p>{error}</p>
          <button onClick={fetchFilms} className="retry-btn">
            Riprova
          </button>
        </div>
      )}

      <div className="catalog-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Cerca titolo, regista, genere o categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {editingFilm && (
        <div className="film-form">
          <h3>Modifica Film</h3>
          <div className="form-grid">
            <input
              type="text"
              name="title"
              placeholder="Titolo *"
              value={editingFilm.title}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="director"
              placeholder="Regista"
              value={editingFilm.director}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="genre"
              placeholder="Genere *"
              value={editingFilm.genre}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="year"
              placeholder="Anno *"
              value={editingFilm.year}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="duration"
              placeholder="Durata (minuti) *"
              value={editingFilm.duration}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Prezzo *"
              step="0.01"
              value={editingFilm.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <textarea
            name="description"
            placeholder="Descrizione *"
            value={editingFilm.description}
            onChange={handleInputChange}
            required
          />
          <div className="form-actions">
            <button className="save-btn" onClick={handleSaveEdit}>Salva Modifiche</button>
            <button className="cancel-btn" onClick={() => setEditingFilm(null)}>Annulla</button>
          </div>
        </div>
      )}

      <div className="films-grid">
        {loading ? (
          <div className="loading">Caricamento in corso...</div>
        ) : filteredFilms.length > 0 ? (
          filteredFilms.map(film => (
            <div key={film.id} className="film-card">
              <div className="film-header">
                <h3>{getSafeValue(film.title, 'Titolo non disponibile')}</h3>
                <div className="film-price">€{getSafeValue(film.price, 'N/D')}</div>
              </div>
              <div className="film-details">
                <p><strong>Regista:</strong> {getSafeValue(film.director, 'Non disponibile')}</p>
                <p><strong>Anno:</strong> {getSafeValue(film.year, 'N/D')}</p>
                <p><strong>Genere:</strong> {getSafeValue(film.genre, 'Non specificato')}</p>
                <p><strong>Durata:</strong> {getSafeValue(film.duration, 'N/D')} minuti</p>
                <p><strong>Uscita:</strong> {getSafeValue(film.releaseYear, 'N/D')}</p>
              </div>
              <p className="film-description">{getSafeValue(film.description, 'Nessuna descrizione disponibile')}</p>
              <div className="film-actions">
                <button className="edit-btn" onClick={() => setEditingFilm(film)}>
                  Modifica
                </button>
                <button className="delete-btn" onClick={() => handleDeleteFilm(film.id)}>
                  Elimina
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-films">
            <p>{searchTerm ? 'Nessun film trovato' : 'Nessun film nel catalogo'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilmCatalog;