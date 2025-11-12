//
// app.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const express = require('express');

const app = express();
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose')
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

require('dotenv').config()

// MARK: Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// MARK: DB
mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('Connected to the database successfully.');
    })
    .catch((err) => {
        console.error('Failed to connect to the database:', err.message);
        app.use((req, res) => {
            res.status(500).json({
                error: {
                    message: 'DB connection failed. Some features may not work as expected.'
                }
            });
        });
    });

// MARK: Default route
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Hillo!"
    });
});

// MARK: Error handling
app.use((next) => {
    const error = new Error("Not found");
    next(error);
});

app.use((error, res) => {
    res.status(error.status || 500).json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;