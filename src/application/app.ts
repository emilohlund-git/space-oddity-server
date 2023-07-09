import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import morgan from 'morgan';
import { Server } from 'socket.io';
import MessageResponse from '../domain/interfaces/MessageResponse';
import { ClientEvents, ServerEvents } from '../domain/interfaces/command.interface';
import * as middlewares from '../domain/middlewares';
import api from '../infrastructure/api';
import { InMemoryLobbyRepository } from '../infrastructure/repositories/in-memory-lobby.repository';
import { InMemoryUserRepository } from '../infrastructure/repositories/in-memory-user.repository';
import SocketHandler from '../infrastructure/socket.handler';
import { LobbyService } from './services/lobby.service';
import { UserService } from './services/user.service';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server<ClientEvents, ServerEvents>(server, {
  cors: {
    origin: ['*', 'https://www.piesocket.com', 'http://'],
  },
  transports: ['websocket'],
});

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: ['*', 'https://www.piesocket.com'],
}));
app.use(express.json());

app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const userRepository = new InMemoryUserRepository();
const lobbyRepository = new InMemoryLobbyRepository();
const userService = new UserService(userRepository);
const lobbyService = new LobbyService(lobbyRepository);

const socketHandler = new SocketHandler(io, userService, lobbyService);

socketHandler.handleConnection();

export default server;
