USE BiblioTech;

INSERT INTO users (name, lastName, email, pass, lvl, cantLeidos, warning) VALUES
('Ana', 'García', 'ana.garcia@email.com', 'anaa123', 5, 12, 'nulo'),
('Carlos', 'Martínez', 'carlos.martinez@email.com', 'carlos1234', 3, 8, 'leve'),
('María', 'López', 'maria.lopez@email.com', 'mariaLopez123', 7, 25, 'nulo'),
('Pedro', 'Sánchez', 'pedro.sanchez@email.com', 'pedro123', 2, 3, 'medio'),
('Laura', 'Díaz', 'laura.diaz@email.com', 'laura2024', 6, 18, 'nulo'),
('Miguel', 'Rodríguez', 'miguel.rod@email.com', 'miguel17699', 4, 10, 'alta'),
('Elena', 'Fernández', 'elena.fernandez@email.com', 'elenaFernandez123', 8, 32, 'nulo');

INSERT INTO medals (img, tag, userId) VALUES
('medalla_oro.png', 'Lector Avanzado', 1),
('medalla_plata.png', 'Primer Préstamo', 2),
('medalla_bronce.png', '10 Libros Leídos', 3),
('medalla_oro.png', 'Coleccionista', 1),
('medalla_plata.png', 'Lector Constante', 5),
('medalla_bronce.png', 'Explorador Literario', 4);

INSERT INTO items (name, img, inStock, borrowed) VALUES
('computadora','computadora.jpg','25','1'),
('regla 30cm','regla.jpg','5','3'),
('tablero dibujo tecnico','tablero.jpg','10','3'),
('Calculadora Científica', 'calculadora.jpg', 10, 4);

INSERT INTO books (name, img, timesreaded)