-- Insertar foros de prueba si no existen
INSERT IGNORE INTO forum (name, description) VALUES
('📚 General', 'Discusiones generales sobre libros y lecturas'),
('🎓 Estudiantes', 'Espacio para estudiantes de BiblioTech'),
('💡 Recomendaciones', 'Comparte tus recomendaciones de libros'),
('🔧 Soporte Técnico', 'Ayuda con la plataforma y problemas técnicos'),
('📝 Sugerencias', 'Comparte tus ideas para mejorar BiblioTech');
