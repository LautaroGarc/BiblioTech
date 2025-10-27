CREATE DATABASE IF NOT EXISTS BiblioTech;
USE BiblioTech;

CREATE TABLE users (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    img VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    pass VARCHAR(15) NOT NULL,
    forumMod BOOL NOT NULL,
    medals JSON NOT NULL,
    lvl INT UNSIGNED NOT NULL,
    nReads INT UNSIGNED NOT NULL,
    type ENUM('alumno','docente'),
    warning ENUM('nulo','leve','medio','alta','lista negra')
);

CREATE TABLE medals (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
	img VARCHAR(50) NOT NULL,
    tag VARCHAR(30) NOT NULL
);  

CREATE TABLE supplies (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(150),
    img VARCHAR(50) NOT NULL, 
    borrowed INT UNSIGNED NOT NULL
);

CREATE TABLE books (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(50) NOT NULL,
    img VARCHAR(50) NOT NULL,
    timesReaded INT UNSIGNED NOT NULL,
    borrowed BOOLEAN NOT NULL,
    sinopsis VARCHAR(1000) NOT NULL,
    author VARCHAR(80) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    review INT NOT NULL,
    editorial VARCHAR(60) NOT NULL,
    barCode VARCHAR(100) NOT NULL,
    subGender VARCHAR(50) NOT NULL,
    ageRangeMin INT UNSIGNED NOT NULL,
    ageRangeMax INT UNSIGNED NOT NULL,
    readLevel INT UNSIGNED NOT NULL,
    rhythm VARCHAR(50) NOT NULL,
    tone VARCHAR(50) NOT NULL,
    narrativeStyle VARCHAR(50) NOT NULL,
    length INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    theme VARCHAR(50) NOT NULL,
    final VARCHAR(50) NOT NULL,
    similar JSON NOT NULL
);

CREATE TABLE forum (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE usersBlacklist (
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE forumChat (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    userId INT NOT NULL,
    forumId INT NOT NULL,
    reply BOOLEAN NOT NULL,
    replyId INT,
    text VARCHAR(150) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (forumId) REFERENCES forum(id),
    FOREIGN KEY (replyId) REFERENCES forumChat(id),
    CONSTRAINT chk_reply_logic CHECK (
        (reply = TRUE AND replyId IS NOT NULL) OR 
        (reply = FALSE AND replyId IS NULL)
    )
);

CREATE TABLE IA (
	userId INT NOT NULL,
    sender ENUM('user','ia') NOT NULL,
    text VARCHAR(1500) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE bookLoans (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    userId INT NOT NULL,
    bookId INT NOT NULL,
    state ENUM('en prestamo','devuelto','atrasado') NOT NULL,
    dateIn DATE NOT NULL,
    dateOut DATE NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (bookId) REFERENCES books(id)
);

CREATE TABLE suppLoans (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    userId INT NOT NULL,
    itemId INT NOT NULL,
    state ENUM('en prestamo','devuelto','atrasado') NOT NULL,
    dateIn DATE NOT NULL,
    dateOut DATE NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (itemId) REFERENCES supplies(id)
);