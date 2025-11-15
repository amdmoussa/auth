//
// server.ts
// 
// Created by Ahmed Moussa, 12/11/2025
//

const app = require('./app')
const http = require('http');
const { startTokenCleanupJob } = require('./jobs/token-cleanup.job');

const port = process.env.port || 3000;
const server = http.createServer(app);

startTokenCleanupJob();

server.listen(port, () => {
    console.info(`Auth API running on port ${port}`)
});