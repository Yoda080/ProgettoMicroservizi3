import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Rental.css';

const Rental = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authError, setAuthError] = useState(false);
    const navigate = useNavigate();

    const [movies, setMovies] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState('');
    const [renting, setRenting] = useState(false);

    const RENTALS_API_URL = "http://localhost:5003/api/Rentals";
    const MOVIES_API_URL = "http://localhost:5002/api/movies";

    const getToken = () => {
        const token = localStorage.getItem('authToken');
        return token;
    };

    const handleReturnMovie = async (rentalId) => {
        try {
            const token = getToken();
            if (!token) {
                setAuthError(true);
                setError("Autenticazione necessaria.");
                return;
            }

            const response = await fetch(`${RENTALS_API_URL}/return/${rentalId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    setAuthError(true);
                    setError("Sessione scaduta. Effettua nuovamente il login.");
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Errore HTTP: ${response.status}`);
            }

            setRentals(prevRentals =>
                prevRentals.map(rental =>
                    rental.id === rentalId ? { ...rental, returnedAt: new Date().toISOString() } : rental
                )
            );
            alert("Film restituito con successo!");
        } catch (err) {
            setError(err.message);
            console.error("Errore restituzione film:", err.message);
        }
    };

    const fetchRentals = async (token) => {
        try {
            const rentalsResponse = await fetch(RENTALS_API_URL, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!rentalsResponse.ok) {
                if (rentalsResponse.status === 401) {
                    throw new Error('Token non valido o scaduto');
                }
                throw new Error(`Errore HTTP: ${rentalsResponse.status}`);
            }

            const rentalsData = await rentalsResponse.json();
            setRentals(rentalsData);
        } catch (err) {
            console.error('Errore in fetchRentals:', err);
            throw err;
        }
    };

    const fetchMovies = async () => {
        try {
            const moviesResponse = await fetch(MOVIES_API_URL);

            if (!moviesResponse.ok) {
                throw new Error(`Errore HTTP: ${moviesResponse.status}`);
            }

            const moviesData = await moviesResponse.json();
            setMovies(moviesData);
        } catch (err) {
            console.error("Errore fetch movies:", err);
            setError("Impossibile caricare i film disponibili");
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const handleRentMovie = async (e) => {
        e.preventDefault();
        setRenting(true);
        setError(null);

        if (!selectedMovieId) {
            setError("Seleziona un film.");
            setRenting(false);
            return;
        }

        try {
            const token = getToken();
            if (!token) {
                setAuthError(true);
                setError("Token non trovato. Effettua il login.");
                setRenting(false);
                return;
            }

            const response = await fetch(RENTALS_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ movieId: parseInt(selectedMovieId) })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    setAuthError(true);
                    setError("Sessione scaduta. Effettua nuovamente il login.");
                    setRenting(false);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Errore HTTP: ${response.status}`);
            }

            const newToken = getToken();
            if (newToken) {
                await fetchRentals(newToken);
            }
            alert("Film noleggiato con successo!");
            setSelectedMovieId('');
        } catch (err) {
            setError(err.message);
            console.error("Errore noleggio film:", err.message);
        } finally {
            setRenting(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                setAuthError(false);

                const token = getToken();

                if (!token) {
                    setAuthError(true);
                    setError("Token non trovato nel localStorage. Effettua il login.");
                    setLoading(false);
                    return;
                }

                await Promise.all([
                    fetchMovies(),
                    fetchRentals(token)
                ]);

            } catch (err) {
                setError("Errore nel caricamento dei dati: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, []); // Array di dipendenze vuoto: la funzione viene eseguita solo al mount

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'authToken') {
                if (e.newValue === null) {
                    setAuthError(true);
                    setError("Sessione scaduta. Effettua nuovamente il login.");
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    if (loading) {
        return <div className="rental-container">Caricamento noleggi...</div>;
    }

    if (authError) {
        return (
            <div className="rental-container">
                <div className="auth-error">
                    <h2>Accesso richiesto</h2>
                    <p>{error}</p>
                    <button onClick={handleLoginRedirect} className="login-button">
                        Vai al Login
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="back-button">
                        Torna alla Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rental-container">
            <header className="rental-header">
                <h1>I miei Noleggi</h1>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="back-button"
                >
                    Torna alla Dashboard
                </button>
            </header>

            {error && !authError && <div className="error-message">{error}</div>}

            <div className="rental-form">
                <h2>Noleggia un nuovo film</h2>
                <form onSubmit={handleRentMovie}>
                    <div>
                        <label htmlFor="movie-select">Scegli un film:</label>
                        <select
                            id="movie-select"
                            value={selectedMovieId}
                            onChange={(e) => setSelectedMovieId(e.target.value)}
                            required
                        >
                            <option value="">-- Seleziona un film --</option>
                            {movies.map(movie => (
                                <option key={movie.id} value={movie.id}>
                                    {movie.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" disabled={renting}>
                        {renting ? 'Noleggio in corso...' : 'Noleggia'}
                    </button>
                </form>
            </div>

            <div className="rental-content">
                <h2>I tuoi film noleggiati</h2>
                {rentals.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Film</th>
                                <th>Data Noleggio</th>
                                <th>Data Scadenza</th>
                                <th>Stato</th>
                                <th>Prezzo Totale</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rentals.map((rental) => {
                                const movie = movies.find(m => m.id === rental.movieId);
                                return (
                                    <tr key={rental.id}>
                                        <td>{movie ? movie.title : `Film ID: ${rental.movieId}`}</td>
                                        <td>{new Date(rental.rentedAt).toLocaleDateString()}</td>
                                        <td>{new Date(rental.dueDate).toLocaleDateString()}</td>
                                        <td>
                                            {rental.returnedAt
                                                ? 'Restituito il ' + new Date(rental.returnedAt).toLocaleDateString()
                                                : 'Da restituire'
                                            }
                                        </td>
                                        <td>€ {rental.totalPrice?.toFixed(2) || '0.00'}</td>
                                        <td>
                                            {!rental.returnedAt && (
                                                <button
                                                    onClick={() => handleReturnMovie(rental.id)}
                                                    className="return-button"
                                                >
                                                    Restituisci
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p>Non hai ancora noleggiato film.</p>
                )}
            </div>
        </div>
    );
};

export default Rental;