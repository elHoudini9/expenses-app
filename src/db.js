const { Client } = require('pg')

// Loads .env file into process.env
require('dotenv').config()

const db = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
})

db.connect()

module.exports = db
