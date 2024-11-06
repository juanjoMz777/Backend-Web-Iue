CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50),
    clave  VARCHAR(50)
);

INSERT INTO usuarios (usuario, clave) VALUES ('Juan Perez', 'pepepicapapas');
