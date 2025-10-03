# ----------------------------------------------------
# 1. STAGE: Build e Pubblicazione
# ----------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia l'intera cartella del microservizio ShoppingCartService dal contesto di build
# Assumo che il contesto della build sia la ROOT del tuo progetto
COPY ShoppingCartService/ ./ShoppingCartService/ 

# Vai nella directory del progetto all'interno del container
WORKDIR /src/ShoppingCartService

# Consolidiamo: Eseguiamo 'dotnet publish' che includerà implicitamente il restore.
# Questo risolve l'errore NETSDK1064 perché il restore è forzato.
RUN dotnet publish "ShoppingCartService.csproj" -c Release -o /app/publish

# ----------------------------------------------------
# 2. STAGE: Runtime (Immagine più leggera)
# ----------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copia i file compilati dallo stage 'build'
COPY --from=build /app/publish .

# Espone la porta del servizio
EXPOSE 5005

# Definisci il punto di ingresso
ENTRYPOINT ["dotnet", "ShoppingCartService.dll"]
