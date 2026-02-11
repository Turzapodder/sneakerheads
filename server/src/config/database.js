import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Extract the actual database URL from the psql command format
const dbUrlMatch = process.env.DB_URL.match(/postgresql:\/\/[^\s']+/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[0] : process.env.DB_URL;

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

export default { sequelize, testConnection };
