IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = N'users_db')
BEGIN
    CREATE DATABASE [users_db];
END;

IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = N'movies_db')
BEGIN
    CREATE DATABASE [movies_db];
END;

IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = N'rentals_db')
BEGIN
    CREATE DATABASE [rentals_db];
END;
GO
