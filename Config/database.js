const { Sequelize } = require("sequelize");

// Replace with your actual credentials

const sequelize = new Sequelize("qtech_db", "postgres", "Aabdo@1234", {
  host: "localhost", // e.g., 'localhost' or the IP address
  port: 5432, // Default PostgreSQL port
  dialect: "postgres",
  pool: {
    max: 10,
    min: 0,
    idle: 10000,
  },
  logging: false, // Set to true if you want to see SQL queries
});

module.exports = sequelize;
