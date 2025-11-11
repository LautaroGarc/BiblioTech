INSERT INTO users (accepted, type, name, lastName, img, email, pass, forumMod, lvl, xp, warning) VALUES
(TRUE, 'admin', 'Ana', 'García', 'ana_profile.jpg', 'ana.garcia@bibliotech.com', '$2y$10$exampleHash123', TRUE, 5, 1250, 0),
(TRUE, 'user', 'Carlos', 'Martínez', 'carlos_profile.jpg', 'carlos.martinez@email.com', '$2y$10$exampleHash456', FALSE, 3, 450, 0),
(TRUE, 'user', 'María', 'López', 'maria_profile.jpg', 'maria.lopez@email.com', '$2y$10$exampleHash789', TRUE, 4, 890, 1),
(FALSE, 'user', 'Juan', 'Rodríguez', NULL, 'juan.rodriguez@email.com', '$2y$10$exampleHash012', FALSE, 1, 50, 0),
(TRUE, 'user', 'Laura', 'Hernández', 'laura_profile.jpg', 'laura.hernandez@email.com', '$2y$10$exampleHash345', FALSE, 2, 210, 0),
(TRUE, 'admin', 'Pedro', 'Sánchez', 'pedro_profile.jpg', 'pedro.sanchez@bibliotech.com', '$2y$10$exampleHash678', TRUE, 6, 1800, 0),
(TRUE, 'user', 'Sofía', 'Ramírez', 'sofia_profile.jpg', 'sofia.ramirez@email.com', '$2y$10$exampleHash901', FALSE, 3, 520, 2),
(TRUE, 'user', 'Diego', 'Fernández', NULL, 'diego.fernandez@email.com', '$2y$10$exampleHash234', FALSE, 1, 80, 0),
(FALSE, 'user', 'Elena', 'Torres', 'elena_profile.jpg', 'elena.torres@email.com', '$2y$10$exampleHash567', FALSE, 2, 190, 0),
(TRUE, 'user', 'Miguel', 'Díaz', 'miguel_profile.jpg', 'miguel.diaz@email.com', '$2y$10$exampleHash890', FALSE, 4, 720, 1);

use BiblioTech;

INSERT INTO medals (img, tag) VALUES
('medal_lector_bronce.png', 'Lector Bronce'),
('medal_lector_plata.png', 'Lector Plata'),
('medal_lector_oro.png', 'Lector Oro'),
('medal_foro_activo.png', 'Foro Activo'),
('medal_coleccionista.png', 'Coleccionista'),
('medal_reseñador.png', 'Reseñador Experto'),
('medal_velocista.png', 'Lector Veloz'),
('medal_bibliotecario.png', 'Ayudante Biblioteca');


INSERT INTO books (name, img, review, barCode, quant, timesReaded, borrowed, sinopsis, author, editorial, gender, readLevel, length, theme) VALUES
('Cien años de soledad', 'cien_anos_soledad.jpg', 4.8, '9788437604947', 5, 23, TRUE, 'La saga de la familia Buendía en el pueblo mágico de Macondo.', 'Gabriel García Márquez', 'Alfaguara', 'Realismo Mágico', 3, 432, 'Ficción'),
('1984', '1984_cover.jpg', 4.6, '9788499890944', 3, 18, FALSE, 'Una distopía sobre un régimen totalitario y el control absoluto.', 'George Orwell', 'Debolsillo', 'Ciencia Ficción', 4, 328, 'Política'),
('El principito', 'principito_cover.jpg', 4.9, '9788478887194', 8, 45, TRUE, 'Un niño viaja por planetas aprendiendo sobre la vida y el amor.', 'Antoine de Saint-Exupéry', 'Salamandra', 'Fábula', 1, 96, 'Filosofía'),
('Don Quijote de la Mancha', 'quijote_cover.jpg', 4.5, '9788467031250', 4, 12, TRUE, 'Las aventuras de un hidalgo que cree ser caballero andante.', 'Miguel de Cervantes', 'Real Academia Española', 'Clásico', 5, 863, 'Aventura'),
('Harry Potter y la piedra filosofal', 'harry_potter_1.jpg', 4.7, '9788478884452', 6, 67, FALSE, 'Un niño descubre que es mago y asiste a la escuela Hogwarts.', 'J.K. Rowling', 'Salamandra', 'Fantasía', 2, 256, 'Magia'),
('Orgullo y prejuicio', 'orgullo_prejuicio.jpg', 4.4, '9788491052455', 3, 28, TRUE, 'La historia de Elizabeth Bennet y el señor Darcy en la Inglaterra del siglo XIX.', 'Jane Austen', 'Alma', 'Romance', 3, 432, 'Sociedad'),
('Crónica del pájaro que da cuerda al mundo', 'cronica_pajaro.jpg', 4.3, '9788483466189', 2, 9, FALSE, 'Un hombre busca a su esposa desaparecida en un viaje surrealista.', 'Haruki Murakami', 'Tusquets', 'Realismo Mágico', 4, 688, 'Búsqueda'),
('Los juegos del hambre', 'juegos_hambre_1.jpg', 4.2, '9788427202122', 5, 34, TRUE, 'Katniss se ofrece como tributo en unos juegos mortales televisados.', 'Suzanne Collins', 'Molino', 'Distopía', 2, 374, 'Supervivencia'),
('El nombre del viento', 'nombre_viento.jpg', 4.8, '9788401337208', 3, 15, FALSE, 'La historia de Kvothe, un hombre de leyenda contada en primera persona.', 'Patrick Rothfuss', 'Plaza & Janés', 'Fantasía', 4, 880, 'Magia'),
('It', 'it_king.jpg', 4.1, '9788497593794', 2, 11, TRUE, 'Un payaso demoníaco aterroriza a un grupo de niños en un pueblo de Maine.', 'Stephen King', 'Debolsillo', 'Terror', 4, 1504, 'Miedo');

INSERT INTO supplies (name, img, barCode, borrowed, total_quantity) VALUES
('Notebook Conectar Igualdad', 'Notebook.jpg', 'SUP880123456789', 1, 5),
('Tablero de dibujo tecnico', 'tablero.jpg', 'SUP880123456790', 0, 3),
('Auriculares', 'auriculares.jpg', 'SUP880123456791', 2, 8),
('Calculadora Científica Casio', 'calculadoraCasio.jpg', 'SUP880123456792', 1, 4),
('Regla Escuadra', 'reglaescuedra.jpg', 'SUP880123456793', 0, 2),
('Cable HDMI', 'HDMI.jpg', 'SUP880123456794', 1, 3),
('Compas', 'compas.jpg', 'SUP880123456795', 0, 2),
('Regla comun', 'regla.jpg', 'SUP880123456796', 1, 4),
('Cargador Notebook', 'cargador.jpg', 'SUP880123456797', 3, 10),
('Hojas dibujo tecnico', 'Hojas.jpg', 'SUP880123459797', '4','12'),
('Teletransportador', 'teletransportador.jpg', 'SUP880123456798', 2, 6);


INSERT INTO forum (name, description) VALUES
('Club de Lectura', 'Espacio para discutir libros y compartir recomendaciones'),
('Tecnología y Educación', 'Foro sobre herramientas tecnológicas para el aprendizaje'),
('Escritores Noveles', 'Comunidad para quienes están empezando a escribir'),
('Literatura Clásica', 'Discusión sobre obras y autores clásicos'),
('Ayuda Técnica', 'Soporte para problemas con la plataforma y préstamos');

INSERT INTO forumChat (userId, forumId, reply, replyId, text) VALUES
(2, 1, FALSE, NULL, '¿Alguien ha leído el último libro de Murakami? ¡Me encantó!'),
(3, 1, TRUE, 1, 'Sí, lo terminé la semana pasada. La narrativa es increíble'),
(5, 1, TRUE, 1, 'Todavía no lo he leído, ¿vale la pena?'),
(2, 2, FALSE, NULL, '¿Recomiendan alguna app para tomar notas de lectura?'),
(6, 2, TRUE, 4, 'Yo uso Notion y me funciona muy bien para organizar mis lecturas'),
(7, 3, FALSE, NULL, 'Estoy escribiendo mi primera novela, ¿algún consejo?'),
(3, 3, TRUE, 6, 'Lo más importante es ser constante. Escribe todos los días'),
(8, 4, FALSE, NULL, '¿Cuál es su obra clásica favorita y por qué?'),
(2, 4, TRUE, 8, 'Sin duda "Crimen y Castigo". La profundidad psicológica es asombrosa'),
(9, 5, FALSE, NULL, 'No puedo renovar mi préstamo, me sale error');

INSERT INTO bookLoans (userId, bookId, state, dateIn, dateOut, returned_at) VALUES
(2, 1, 'en prestamo', '2024-01-15 10:30:00', '2024-02-15', NULL),
(3, 4, 'devuelto', '2024-01-10 14:20:00', '2024-02-10', '2024-02-08 16:45:00'),
(5, 6, 'en prestamo', '2024-01-20 09:15:00', '2024-02-20', NULL),
(7, 8, 'atrasado', '2024-01-05 11:00:00', '2024-02-05', NULL),
(2, 3, 'devuelto', '2024-01-08 16:40:00', '2024-02-08', '2024-02-07 10:20:00'),
(9, 1, 'en prestamo', '2024-01-25 13:10:00', '2024-02-25', NULL),
(3, 7, 'devuelto', '2024-01-12 15:30:00', '2024-02-12', '2024-02-10 14:15:00'),
(6, 2, 'en prestamo', '2024-01-18 08:45:00', '2024-02-18', NULL),
(8, 5, 'devuelto', '2024-01-22 12:20:00', '2024-02-22', '2024-02-20 09:30:00'),
(4, 9, 'en prestamo', '2024-01-28 10:00:00', '2024-02-28', NULL);

INSERT INTO suppLoans (userId, itemId, state, dateIn, dateOut, returned_at) VALUES
(2, 1, 'en prestamo', '2024-01-16 11:20:00', '2024-01-30', NULL),
(3, 4, 'devuelto', '2024-01-14 09:45:00', '2024-01-28', '2024-01-27 16:10:00'),
(6, 3, 'en prestamo', '2024-01-19 14:30:00', '2024-02-02', NULL),
(7, 9, 'atrasado', '2024-01-08 10:15:00', '2024-01-22', NULL),
(5, 6, 'devuelto', '2024-01-21 13:40:00', '2024-02-04', '2024-02-03 11:25:00'),
(9, 8, 'en prestamo', '2024-01-26 15:50:00', '2024-02-09', NULL),
(2, 3, 'devuelto', '2024-01-11 12:05:00', '2024-01-25', '2024-01-24 14:45:00'),
(8, 1, 'en prestamo', '2024-01-29 08:30:00', '2024-02-12', NULL),
(4, 7, 'devuelto', '2024-01-17 16:20:00', '2024-01-31', '2024-01-30 10:15:00'),
(3, 9, 'en prestamo', '2024-01-23 11:10:00', '2024-02-06', NULL);


INSERT INTO usersBlacklist (userId, blacklistedUserId) VALUES
(2, 4),
(3, 7),
(5, 8),
(7, 2),
(9, 5);


-- Actualizar algunos usuarios con medallas
UPDATE users SET medals = JSON_ARRAY('Lector Bronce', 'Foro Activo') WHERE id = 2;
UPDATE users SET medals = JSON_ARRAY('Lector Oro', 'Reseñador Experto') WHERE id = 3;
UPDATE users SET medals = JSON_ARRAY('Coleccionista') WHERE id = 6;

-- Actualizar libros con likes
UPDATE books SET likes = JSON_ARRAY(2, 3, 5, 7) WHERE id = 1;
UPDATE books SET likes = JSON_ARRAY(3, 6, 8) WHERE id = 3;
UPDATE books SET likes = JSON_ARRAY(2, 4, 5, 9) WHERE id = 5;

-- Actualizar historial de lectura de usuarios
UPDATE users SET readHistory = JSON_ARRAY(1, 3, 4) WHERE id = 2;
UPDATE users SET readHistory = JSON_ARRAY(2, 4, 6, 8) WHERE id = 3;
UPDATE users SET readHistory = JSON_ARRAY(5, 7) WHERE id = 5;


