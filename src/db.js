const mysql = require('mysql');

// Create a connection pool for initial database creation
const pool = mysql.createPool({
    host: 'localhost',
    user: 'jasmin',
    password: 'Jasmin@123'
});

// Connect to MySQL server and create database if not exists
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }

    console.log('Database connection successful.');

    connection.query('CREATE DATABASE IF NOT EXISTS node_contactBook', (err) => {
        if (err) {
            console.error('Failed to create database:', err);
            connection.release(); // Release the connection on error
            return;
        }

        console.log('Database node_contactBook created or already exists.');

        // Switch to 'node_contactBook' database
        connection.query('USE node_contactBook', (err) => {
            if (err) {
                console.error('Failed to switch to database:', err);
                connection.release(); // Release the connection on error
                return;
            }

            console.log('Switched to database node_contactBook.');

            // Create 'users' table if not exists
            const createUserTable = `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL
            )`;
            
            connection.query(createUserTable, (err) => {
                if (err) {
                    console.error('Failed to create users table:', err);
                    connection.release(); // Release the connection on error
                    return;
                }

                console.log('Users table created or already exists.');

                // Create 'contacts' table if not exists
                const createContactsTable = `CREATE TABLE IF NOT EXISTS contacts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    uid INT,
                    firstname VARCHAR(100) NOT NULL,
                    lastname VARCHAR(100) NOT NULL,
                    gender ENUM('Male', 'Female', 'Other'),
                    phone_no VARCHAR(20),
                    email VARCHAR(100),
                    city VARCHAR(100),
                    FOREIGN KEY (uid) REFERENCES users(id)
                )`;
                
                connection.query(createContactsTable, (err) => {
                    if (err) {
                        console.error('Failed to create contacts table:', err);
                    } else {
                        console.log('Contacts table created or already exists.');
                    }

                    connection.release(); // Release the connection
                });
            });
        });
    });
});

const insertRecord = (tableName, insertData) => {
    return new Promise((resolve, reject) => {
        const keys = Object.keys(insertData);
        const values = Object.values(insertData);

        const placeholders = keys.map(() => '?').join(',');
        const query = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${placeholders})`;
        pool.query(query, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = { pool,insertRecord };
