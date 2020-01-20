import http from 'http';
import { setupWebsocket } from './websocket';
import app from './app';

const server = http.Server(app);

setupWebsocket(server);

server.listen(3333);
