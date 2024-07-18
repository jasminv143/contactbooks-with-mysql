const mysql = require('mysql');
const dotenv = require('dotenv');
// Create a connection pool for initial database creation
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || 'node_contactBook'
});

const setupConnection = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
});

// Connect to MySQL server and create database if not exists
setupConnection.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }

    console.log('Database connection successful.');

    connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
        if (err) {
            console.error('Failed to create database:', err);
            connection.release(); // Release the connection on error
            return;
        }

        console.log(`Database ${process.env.DB_NAME} created or already exists.`);

        // Switch to 'node_contactBook' database
        connection.query(`USE ${process.env.DB_NAME}`, (err) => {
            if (err) {
                console.error('Failed to switch to database:', err);
                connection.release(); // Release the connection on error
                return;
            }

            console.log(`Switched to database ${process.env.DB_NAME}.`);

            // Create 'users' table if not exists
            const createUserTable = `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE
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
const deleteRecord = (tableName, conditions) => {
    return new Promise((resolve, reject) => {
        if (!tableName || typeof conditions !== 'object' || Object.keys(conditions).length === 0) {
            reject(new Error('Invalid arguments provided.'));
            return;
        }

        const keys = Object.keys(conditions);
        const values = Object.values(conditions);

        // Construct the WHERE clause dynamically
        const whereClause = keys.map(key => {
            if (Array.isArray(conditions[key])) {
                // Handle array values for IN clause
                return `${key} IN (${conditions[key].map(() => '?').join(', ')})`;
            } else {
                // Handle single value for equality check
                return `${key} = ?`;
            }
        }).join(' AND ');

        const query = `DELETE FROM ${tableName} WHERE ${whereClause}`;

        // Flatten the values array if conditions[key] is an array
        const flattenedValues = keys.reduce((acc, key) => {
            if (Array.isArray(conditions[key])) {
                return [...acc, ...conditions[key]];
            } else {
                return [...acc, conditions[key]];
            }
        }, []);

        pool.query(query, flattenedValues, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};
module.exports = { pool,insertRecord,deleteRecord };
