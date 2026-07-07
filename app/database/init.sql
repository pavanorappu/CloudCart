CREATE DATABASE IF NOT EXISTS cloudcart;

USE cloudcart;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL
);

INSERT INTO products (name, price, stock)
VALUES
('Laptop', 75000.00, 15),
('Mouse', 1200.00, 50),
('Keyboard', 2500.00, 30);
