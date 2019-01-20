-- Used to make sure database builds from scratch while coding this assignment
DROP DATABASE IF EXISTS bamazon_DB;

-- Creates the database bamazon_DB
CREATE DATABASE bamazon_DB;

-- Makes sure all data is input into bamazon_DB
USE bamazon_DB;

-- Creates a table called products which will hold the products available on Bamazon
CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT(100) NOT NULL,
    PRIMARY KEY (item_id)
);