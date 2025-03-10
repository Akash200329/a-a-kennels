require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
        ca: fs.readFileSync(process.env.DATABASE_SSL_CA)
    }
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to Aiven MySQL:', err);
        return;
    }
    console.log('Connected to Aiven MySQL!');
});

module.exports = connection;