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
const { RESPONSE_MESSAGES, HTTP_STATUS } = require('./config/config');

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
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: {
                    message: RESPONSE_MESSAGES.DB_CONNECTION_FAILED
                }
            });
        });
    });

// MARK: Default route
app.get('/', (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        status: 'ok',
        message: 'Hillo!'
    });
});

// MARK: Error handling
app.use((req, res, next) => {
    const error: any = new Error('Not found');
    error.status = HTTP_STATUS.NOT_FOUND;
    next(error);
});

app.use((err: any, req, res, next) => {
    res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        error: {
            message: err.message
        }
    });
});

module.exports = app;