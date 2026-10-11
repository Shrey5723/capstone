import http from 'http';
import app, { proxy } from "./src/app.js";

const server = http.createServer(app);

server.on('upgrade', proxy.upgrade);

server.listen(3000, () => {
    console.log('router is running on port 3000');
});