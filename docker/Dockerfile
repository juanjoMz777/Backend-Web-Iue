# Usa la imagen oficial de MySQL como base
FROM mysql:8.0

# Configura el entorno de MySQL
ENV MYSQL_DATABASE=mysql_web
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=root
ENV MYSQL_ROOT_PASSWORD=root

# Exponemos el puerto MySQL por defecto
EXPOSE 3306

# Copia el archivo de inicialización SQL al directorio de MySQL
COPY ./init.sql /docker-entrypoint-initdb.d/

# Comando de entrada para iniciar el contenedor
CMD ["mysqld"]
