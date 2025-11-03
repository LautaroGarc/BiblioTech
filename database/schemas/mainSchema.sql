CREATE DATABASE IF NOT EXISTS BiblioTech;
USE BiblioTech;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
<<<<<<< HEAD
	img VARCHAR(50),
    tag VARCHAR(30)
);  

CREATE TABLE supplies (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(150),
    img VARCHAR(50) NOT NULL, 
    barCode VARCHAR(20),
    borrowed INT UNSIGNED NOT NULL
=======
    accepted BOOLEAN DEFAULT FALSE,
    type ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    name VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    img VARCHAR(255),
    email VARCHAR(100) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL,
    forumMod BOOLEAN DEFAULT FALSE,
    medals JSON DEFAULT (JSON_ARRAY()),
    lvl INT UNSIGNED DEFAULT 1,
    xp INT UNSIGNED DEFAULT 0,
    warning INT DEFAULT 0,
    likes JSON DEFAULT (JSON_ARRAY()),
    readHistory JSON DEFAULT (JSON_ARRAY()),
    preferences JSON DEFAULT (JSON_OBJECT()),
    blacklist JSON DEFAULT (JSON_OBJECT()),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_type (type)
>>>>>>> bdc6d1a4888862105e37316368239f70f57a2fcf
);

CREATE TABLE IF NOT EXISTS medals (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    img VARCHAR(255) NOT NULL,
    tag VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS supplies (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(150) NOT NULL,
    img VARCHAR(255) NOT NULL,
    barCode VARCHAR(255) UNIQUE,
    borrowed INT UNSIGNED DEFAULT 0,
    total_quantity INT UNSIGNED DEFAULT 1,
    INDEX idx_barcode (barCode)
);

CREATE TABLE IF NOT EXISTS books (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    img VARCHAR(255) NOT NULL,
    review DECIMAL(1,2) DEFAULT 0.00,
    barCode VARCHAR(255) UNIQUE,
    quant INT NOT NULL,
    likes JSON DEFAULT (JSON_ARRAY()),
    timesReaded INT UNSIGNED DEFAULT 0,
    borrowed BOOLEAN DEFAULT FALSE,
    sinopsis TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    editorial VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    readLevel INT UNSIGNED NOT NULL,
<<<<<<< HEAD
    length INT NOT NULL,
    theme VARCHAR(50) NOT NULL
=======
    length INT UNSIGNED NOT NULL,
    theme VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_author (author),
    INDEX idx_gender (gender),
    INDEX idx_barcode (barCode)
>>>>>>> bdc6d1a4888862105e37316368239f70f57a2fcf
);

CREATE TABLE IF NOT EXISTS usersBlacklist (
    userId INT NOT NULL,
    blacklistedUserId INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, blacklistedUserId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blacklistedUserId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forum (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forumChat (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    userId INT NOT NULL,
    forumId INT NOT NULL,
    reply BOOLEAN DEFAULT FALSE,
    replyId INT DEFAULT NULL,
    text VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (forumId) REFERENCES forum(id) ON DELETE CASCADE,
    FOREIGN KEY (replyId) REFERENCES forumChat(id) ON DELETE CASCADE,
    INDEX idx_forum_date (forumId, created_at),
    CONSTRAINT chk_reply_logic CHECK (
        (reply = TRUE AND replyId IS NOT NULL) OR 
        (reply = FALSE AND replyId IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS bookLoans (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    userId INT NOT NULL,
    bookId INT NOT NULL,
    state ENUM('en prestamo','devuelto','atrasado') NOT NULL DEFAULT 'en prestamo',
    dateIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateOut DATE NOT NULL,
    returned_at TIMESTAMP NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_user_loans (userId, state),
    INDEX idx_due_date (dateOut)
);

CREATE TABLE IF NOT EXISTS suppLoans (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    userId INT NOT NULL,
    itemId INT NOT NULL,
    state ENUM('en prestamo','devuelto','atrasado') NOT NULL DEFAULT 'en prestamo',
    dateIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateOut DATE NOT NULL,
    returned_at TIMESTAMP NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES supplies(id) ON DELETE CASCADE,
    INDEX idx_user_supplies (userId, state),
    INDEX idx_due_date (dateOut)
);