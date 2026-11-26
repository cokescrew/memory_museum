USE memory_museum;
CREATE TABLE IF NOT EXISTS wanted_posts (
 id INT AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(120) NOT NULL,
 description TEXT NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 status ENUM('active','deleted') NOT NULL DEFAULT 'active',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX(status,created_at)
);
CREATE TABLE IF NOT EXISTS wanted_comments (
 id INT AUTO_INCREMENT PRIMARY KEY,
 post_id INT NOT NULL,
 body TEXT NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 status ENUM('active','deleted') NOT NULL DEFAULT 'active',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(post_id) REFERENCES wanted_posts(id) ON DELETE CASCADE
);
