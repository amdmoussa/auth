//
// server.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const app = require('./app.ts')
const http = require('http');

require('dotenv').config()

const port = process.env.port || 3000;
const server = http.createServer(app);

server.listen(port, () => {
    console.info(`Auth API running on port ${port}`)
});