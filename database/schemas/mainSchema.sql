CREATE DATABASE IF NOT EXISTS BiblioTech;
USE BiblioTech;

CREATE TABLE users (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    accepted BOOLEAN DEFAULT FALSE,
    name VARCHAR(50),
    token INT,
    lastName VARCHAR(50),
    img VARCHAR(50),
    email VARCHAR(100),
    pass VARCHAR(20),
    forumMod BOOL,
    medals JSON, 
    lvl INT UNSIGNED,
    xp INT UNSIGNED,
    warning INT,
    likes JSON,
    readHistory JSON,
    preferences JSON,
    blacklist JSON
);

CREATE TABLE medals (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
	img VARCHAR(50),
    tag VARCHAR(30)
);  

CREATE TABLE supplies (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(150),
    img VARCHAR(50) NOT NULL, 
    barCode VARCHAR,
    borrowed INT UNSIGNED NOT NULL
);

CREATE TABLE books (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    img VARCHAR(255) NOT NULL,
    review INT NOT NULL,
    barCode VARCHAR(255),
    likes JSON,
    timesReaded INT UNSIGNED,
    borrowed BOOLEAN,
    sinopsis VARCHAR(1000) NOT NULL,
    author VARCHAR(255) NOT NULL,
    editorial VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    readLevel INT UNSIGNED NOT NULL,
    length INT NOT NULL,
    theme VARCHAR(50) NOT NULL,
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
    reply BOOLEAN DEFAULT FALSE,
    replyId INT DEFAULT NULL,
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