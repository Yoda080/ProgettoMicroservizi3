-- Creazione database
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

IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = N'payments_db')
BEGIN
    CREATE DATABASE [payments_db];
END;
GO

-- 🟢 AGGIUNGI: Inizializzazione tabella rentals_db con tutte le colonne
USE [rentals_db];
GO

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'rentals_db' AND TABLE_SCHEMA = 'dbo')
BEGIN
    CREATE TABLE [dbo].[rentals_db](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [user_id] [nvarchar](255) NOT NULL,
        [movie_id] [int] NOT NULL,
        [rented_at] [datetime2](7) NOT NULL,
        [due_date] [datetime2](7) NOT NULL,
        [returned_at] [datetime2](7) NULL,
        [total_price] [decimal](10, 2) NOT NULL,
        [status] [nvarchar](50) NOT NULL DEFAULT 'Active',
    CONSTRAINT [PK_rentals_db] PRIMARY KEY CLUSTERED 
    (
        [Id] ASC
    ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY];
    PRINT '✅ Tabella rentals_db creata';
END
ELSE
BEGIN
    -- Se la tabella esiste già, aggiungi la colonna status se manca
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'rentals_db' AND COLUMN_NAME = 'status')
    BEGIN
        ALTER TABLE [dbo].[rentals_db] ADD [status] NVARCHAR(50) NOT NULL DEFAULT 'Active';
        PRINT '✅ Colonna status aggiunta a rentals_db esistente';
    END
END
GO