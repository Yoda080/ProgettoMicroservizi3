# -----------------------------------------------------------
# FASE 1: BUILD (Compilazione e installazione tool)
# -----------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Installa lo strumento dotnet-ef globalmente in questa fase
RUN dotnet tool install --global dotnet-ef --version 8.0.0

# Copia l'intera cartella del microservizio
COPY UserService/ ./UserService/ 

# Vai nella directory del progetto all'interno del container
WORKDIR /src/UserService

# Esegui 'dotnet publish' (che include il restore)
RUN dotnet publish "UserService.csproj" -c Release -o /app/publish

# -----------------------------------------------------------
# FASE 2: FINALIZZAZIONE (Immagine di Runtime leggera)
# -----------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# [CRUCIALE] Copia l'eseguibile dotnet-ef dalla fase di build
# La directory di installazione per gli strumenti globali è /root/.dotnet/tools/
COPY --from=build /root/.dotnet/tools/dotnet-ef /usr/local/bin/
COPY --from=build /root/.dotnet/tools/ /root/.dotnet/tools/

# Copia i file compilati
COPY --from=build /app/publish .

# Espone la porta corretta: 5001 per UserService
EXPOSE 5001

# Comando di avvio
ENTRYPOINT ["dotnet", "UserService.dll"]