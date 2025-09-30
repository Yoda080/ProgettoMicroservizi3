# -----------------------------------------------------------
# FASE 1: BUILD (Compilazione dell'applicazione React)
# -----------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Copia i file di dipendenza per sfruttare la cache di npm
COPY package.json .
COPY package-lock.json .

# Installa le dipendenze
# Se stai usando yarn, usa RUN yarn install
RUN npm install

# Copia i sorgenti
COPY . .

# Esegui la compilazione (build) dell'applicazione React
# 'npm run build' crea la cartella 'build' con i file statici
RUN npm run build

# -----------------------------------------------------------
# FASE 2: FINALIZZAZIONE (Server Nginx Leggero)
# -----------------------------------------------------------
FROM nginx:alpine AS final

# Copia la configurazione di Nginx personalizzata
# (Questo è opzionale, ma necessario se vuoi gestire il routing React o le chiamate API)
# Se non hai un file nginx.conf, puoi saltare questo passaggio
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia i file statici compilati da React nella directory di Nginx
COPY --from=build /app/build /usr/share/nginx/html

# La porta predefinita di Nginx è 80, la esporremo
EXPOSE 80

# Avvia Nginx
CMD ["nginx", "-g", "daemon off;"]