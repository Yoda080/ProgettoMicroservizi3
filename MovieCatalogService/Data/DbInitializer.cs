using MovieCatalogService.Data;
using MovieCatalogService.Models;

public static class DbInitializer
{
    public static void SeedData(MovieDbContext context)
    {
        Console.WriteLine("Checking if database contains movies...");
        if (context.Movies.Any())
        {
            Console.WriteLine("Database already contains movies. Seeding skipped.");
            return;
        }

        Console.WriteLine("Database is empty. Seeding new movies...");

        var movies = new Movie[]
        {
            new Movie { Title = "Il Padrino", Description = "Un patriarca della mafia trasferisce il controllo del suo impero criminale al riluttante figlio.", Price = 9.99m, Duration = 175, Category = "Classico", Director = "Francis Ford Coppola", ReleaseYear = 1972 },
            new Movie { Title = "Forrest Gump", Description = "La vita di un uomo con un basso quoziente intellettivo che riesce a partecipare a eventi storici.", Price = 8.99m, Duration = 142, Category = "Dramma", Director = "Robert Zemeckis", ReleaseYear = 1994 },
            new Movie { Title = "Pulp Fiction", Description = "Le storie di due sicari, un pugile e una coppia di rapinatori si intrecciano a Los Angeles.", Price = 9.49m, Duration = 154, Category = "Cult", Director = "Quentin Tarantino", ReleaseYear = 1994 },
            new Movie { Title = "Il Signore degli Anelli: La Compagnia dell'Anello", Description = "Un hobbit deve distruggere un anello magico per salvare la Terra di Mezzo.", Price = 10.99m, Duration = 178, Category = "Fantasy", Director = "Peter Jackson", ReleaseYear = 2001 },
            new Movie { Title = "The Dark Knight", Description = "Batman deve affrontare il Joker, un criminale che semina il caos a Gotham City.", Price = 9.99m, Duration = 152, Category = "Supereroi", Director = "Christopher Nolan", ReleaseYear = 2008 },
            new Movie { Title = "Inception", Description = "Un ladro che ruba segreti attraverso i sogni viene incaricato di piantare un'idea.", Price = 10.49m, Duration = 148, Category = "Fantascienza", Director = "Christopher Nolan", ReleaseYear = 2010 },
            new Movie { Title = "Fight Club", Description = "Un uomo insonne e un produttore di sapone formano un club di lotta clandestino.", Price = 8.99m, Duration = 139, Category = "Cult", Director = "David Fincher", ReleaseYear = 1999 },
            new Movie { Title = "Matrix", Description = "Un hacker scopre la terribile verità sulla realtà in cui vive.", Price = 9.99m, Duration = 136, Category = "Fantascienza", Director = "Lana Wachowski, Lilly Wachowski", ReleaseYear = 1999 },
            new Movie { Title = "Goodfellas", Description = "La ascesa e caduta di Henry Hill nella mafia italo-americana.", Price = 8.99m, Duration = 146, Category = "Gangster", Director = "Martin Scorsese", ReleaseYear = 1990 },
            new Movie { Title = "Schindler's List", Description = "Un industriale tedesco salva la vita di oltre mille ebrei durante l'Olocausto.", Price = 9.99m, Duration = 195, Category = "Storico", Director = "Steven Spielberg", ReleaseYear = 1993 },
            new Movie { Title = "Il Buono, il Brutto, il Cattivo", Description = "Tre cacciatori di taglie cercano un tesoro nascosto durante la guerra civile americana.", Price = 8.49m, Duration = 161, Category = "Western", Director = "Sergio Leone", ReleaseYear = 1966 },
            new Movie { Title = "Shining", Description = "Una famiglia si trasferisce in un hotel isolato dove forze soprannaturali influenzano il padre.", Price = 9.29m, Duration = 146, Category = "Horror", Director = "Stanley Kubrick", ReleaseYear = 1980 },
            new Movie { Title = "Interstellar", Description = "Un gruppo di esploratori viaggia attraverso un wormhole nello spazio.", Price = 10.99m, Duration = 169, Category = "Fantascienza", Director = "Christopher Nolan", ReleaseYear = 2014 },
            new Movie { Title = "Parasite", Description = "Una povera famiglia si infiltra nella vita di una ricca famiglia.", Price = 9.99m, Duration = 132, Category = "Thriller", Director = "Bong Joon-ho", ReleaseYear = 2019 },
            new Movie { Title = "La Vita è Bella", Description = "Un padre ebreo protegge suo figlio dall'orrore di un campo di concentramento.", Price = 8.99m, Duration = 116, Category = "Dramma", Director = "Roberto Benigni", ReleaseYear = 1997 },
            new Movie { Title = "Il Labirinto del Fauno", Description = "Una bambina scopre un misterioso labirinto durante la guerra civile spagnola.", Price = 9.49m, Duration = 118, Category = "Fantasy", Director = "Guillermo del Toro", ReleaseYear = 2006 },
            new Movie { Title = "The Godfather: Part II", Description = "La continua storia della famiglia Corleone attraverso le generazioni.", Price = 9.99m, Duration = 202, Category = "Classico", Director = "Francis Ford Coppola", ReleaseYear = 1974 },
            new Movie { Title = "The Shawshank Redemption", Description = "Un banchiere condannato per omicidio stringe amicizia in prigione.", Price = 9.99m, Duration = 142, Category = "Dramma", Director = "Frank Darabont", ReleaseYear = 1994 },
            new Movie { Title = "C'era una volta in America", Description = "La vita di un gangster ebreo durante l'era del proibizionismo.", Price = 8.99m, Duration = 229, Category = "Gangster", Director = "Sergio Leone", ReleaseYear = 1984 },
            new Movie { Title = "Gladiator", Description = "Un generale romano diventa gladiatore per vendicare la sua famiglia.", Price = 9.49m, Duration = 155, Category = "Azione", Director = "Ridley Scott", ReleaseYear = 2000 },
            new Movie { Title = "Il Silenzio degli Innocenti", Description = "Una giovane agente dell'FBI consulta un pericoloso serial killer per catturarne un altro.", Price = 8.99m, Duration = 118, Category = "Thriller", Director = "Jonathan Demme", ReleaseYear = 1991 },
            new Movie { Title = "Sette", Description = "Due detective investigano su un serial killer che usa i sette peccati capitali.", Price = 9.29m, Duration = 127, Category = "Thriller", Director = "David Fincher", ReleaseYear = 1995 },
            new Movie { Title = "Il Favoloso mondo di Amélie", Description = "Una cameriera timida decide di cambiare la vita delle persone around her.", Price = 8.49m, Duration = 122, Category = "Commedia", Director = "Jean-Pierre Jeunet", ReleaseYear = 2001 },
            new Movie { Title = "La La Land", Description = "Un pianista jazz e un'aspirante attrice si innamorano a Los Angeles.", Price = 9.99m, Duration = 128, Category = "Musical", Director = "Damien Chazelle", ReleaseYear = 2016 },
            new Movie { Title = "Django Unchained", Description = "Uno schiavo liberato diventa un cacciatore di taglie per trovare sua moglie.", Price = 9.49m, Duration = 165, Category = "Western", Director = "Quentin Tarantino", ReleaseYear = 2012 },
            new Movie { Title = "The Departed", Description = "Un poliziotto sotto copertura e una talpa si infiltrano rispettivamente nella mafia e nella polizia.", Price = 9.29m, Duration = 151, Category = "Thriller", Director = "Martin Scorsese", ReleaseYear = 2006 },
            new Movie { Title = "Il Cavaliere Oscuro - Il Ritorno", Description = "Batman torna per salvare Gotham City dal terroristico Bane.", Price = 10.49m, Duration = 165, Category = "Supereroi", Director = "Christopher Nolan", ReleaseYear = 2012 },
            new Movie { Title = "Avengers: Endgame", Description = "Gli Avengers tentano di annullare il blip di Thanos.", Price = 12.99m, Duration = 181, Category = "Supereroi", Director = "Anthony Russo, Joe Russo", ReleaseYear = 2019 },
            new Movie { Title = "Titanic", Description = "Una ragazza dell'alta società si innamora di un artista povero sul Titanic.", Price = 9.99m, Duration = 194, Category = "Romantico", Director = "James Cameron", ReleaseYear = 1997 },
            new Movie { Title = "Jurassic Park", Description = "Uno scienziato crea un parco a tema con dinosauri clonati.", Price = 8.99m, Duration = 127, Category = "Avventura", Director = "Steven Spielberg", ReleaseYear = 1993 },
            new Movie { Title = "Star Wars: Episodio IV - Una nuova speranza", Description = "Luke Skywalker si unisce alla ribellione contro l'Impero Galattico.", Price = 9.99m, Duration = 121, Category = "Fantascienza", Director = "George Lucas", ReleaseYear = 1977 },
            new Movie { Title = "Indiana Jones e i predatori dell'arca perduta", Description = "L'archeologo Indiana Jones cerca l'Arca dell'Alleanza.", Price = 8.99m, Duration = 115, Category = "Avventura", Director = "Steven Spielberg", ReleaseYear = 1981 },
            new Movie { Title = "The Truman Show", Description = "Un uomo scopre che la sua vita è una reality show televisivo.", Price = 8.49m, Duration = 103, Category = "Dramma", Director = "Peter Weir", ReleaseYear = 1998 },
            new Movie { Title = "The Social Network", Description = "La storia della creazione di Facebook e delle successive cause legali.", Price = 9.29m, Duration = 120, Category = "Biografico", Director = "David Fincher", ReleaseYear = 2010 },
            new Movie { Title = "Il Signore degli Anelli: Le due torri", Description = "La compagnia si separa mentre Frodo e Sam continuano verso Mordor.", Price = 10.99m, Duration = 179, Category = "Fantasy", Director = "Peter Jackson", ReleaseYear = 2002 },
            new Movie { Title = "Il Signore degli Anelli: Il ritorno del re", Description = "Frodo raggiunge Mordor mentre Aragorn guida la battaglia finale.", Price = 11.99m, Duration = 201, Category = "Fantasy", Director = "Peter Jackson", ReleaseYear = 2003 },
            new Movie { Title = "The Wolf of Wall Street", Description = "La storia di Jordan Belfort, uno spregiudicato broker di Wall Street.", Price = 9.99m, Duration = 180, Category = "Biografico", Director = "Martin Scorsese", ReleaseYear = 2013 },
            new Movie { Title = "Il club del fight", Description = "Un uomo insonne e un produttore di sapone formano un club di lotta clandestino.", Price = 8.99m, Duration = 139, Category = "Cult", Director = "David Fincher", ReleaseYear = 1999 },
            new Movie { Title = "American Beauty", Description = "Un uomo di mezza età crisi esistenziale e si innamora della amica di sua figlia.", Price = 8.99m, Duration = 122, Category = "Dramma", Director = "Sam Mendes", ReleaseYear = 1999 },
            new Movie { Title = "The Prestige", Description = "Due maghi rivali si sfidano in una battaglia di illusioni.", Price = 9.49m, Duration = 130, Category = "Thriller", Director = "Christopher Nolan", ReleaseYear = 2006 },
            new Movie { Title = "Il sesto senso", Description = "Un bambino psicologicamente traumatizzato vede i morti.", Price = 8.99m, Duration = 107, Category = "Thriller", Director = "M. Night Shyamalan", ReleaseYear = 1999 },
            new Movie { Title = "Il discorso del re", Description = "Re Giorgio VI cerca di superare la balbuzie con l'aiuto di un logopedista.", Price = 8.99m, Duration = 118, Category = "Biografico", Director = "Tom Hooper", ReleaseYear = 2010 },
            new Movie { Title = "La migliore offerta", Description = "Un esperto d'arte solitario viene coinvolto in una misteriosa relazione.", Price = 9.29m, Duration = 131, Category = "Dramma", Director = "Giuseppe Tornatore", ReleaseYear = 2013 },
            new Movie { Title = "Drive", Description = "Uno stuntman di giorno e autista per criminali di notte si innamora della vicina.", Price = 8.99m, Duration = 100, Category = "Noir", Director = "Nicolas Winding Refn", ReleaseYear = 2011 },
            new Movie { Title = "Birdman", Description = "Un attore famoso per il ruolo di un supereroe cerca di riconquistare la credibilità.", Price = 9.49m, Duration = 119, Category = "Dramma", Director = "Alejandro González Iñárritu", ReleaseYear = 2014 },
            new Movie { Title = "Whiplash", Description = "Un giovane batterista jazz si scontra con un insegnante dispotico.", Price = 9.29m, Duration = 106, Category = "Musical", Director = "Damien Chazelle", ReleaseYear = 2014 },
            new Movie { Title = "Gravity", Description = "Due astronauti sono lasciati alla deriva nello spazio dopo che il loro shuttle viene distrutto.", Price = 9.99m, Duration = 91, Category = "Fantascienza", Director = "Alfonso Cuarón", ReleaseYear = 2013 },
            new Movie { Title = "Mad Max: Fury Road", Description = "In un mondo post-apocalittico, Max aiuta una fuggitiva a scappare da un tiranno.", Price = 10.49m, Duration = 120, Category = "Azione", Director = "George Miller", ReleaseYear = 2015 },
            new Movie { Title = "The Revenant", Description = "Un esploratore cerca vendetta dopo essere stato lasciato morto dai compagni.", Price = 9.99m, Duration = 156, Category = "Avventura", Director = "Alejandro González Iñárritu", ReleaseYear = 2015 },
            new Movie { Title = "Joker", Description = "Un comico fallito sprofonda nella follia e diventa un criminale psicopatico.", Price = 10.99m, Duration = 122, Category = "Thriller", Director = "Todd Phillips", ReleaseYear = 2019 }
        };
        
        foreach (Movie m in movies)
        {
            context.Movies.Add(m);
        }

        context.SaveChanges();
        Console.WriteLine("Movies seeded successfully!");
    }
}
