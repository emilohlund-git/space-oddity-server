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
import { InMemoryCardRepository } from '../infrastructure/repositories/in-memory-card.repository';
import { InMemoryDeckRepository } from '../infrastructure/repositories/in-memory-deck.repository';
import { InMemoryLobbyRepository } from '../infrastructure/repositories/in-memory-lobby.repository';
import { InMemoryTableRepository } from '../infrastructure/repositories/in-memory-table.repository';
import { InMemoryUserRepository } from '../infrastructure/repositories/in-memory-user.repository';
import SocketHandler from '../infrastructure/socket.handler';
import { CardService } from './services/card.service';
import { DeckService } from './services/deck.service';
import GameService from './services/game.service';
import { LobbyService } from './services/lobby.service';
import { TableService } from './services/table.service';
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

const tableRepository = new InMemoryTableRepository();
const cardRepository = new InMemoryCardRepository();
const userRepository = new InMemoryUserRepository();
const lobbyRepository = new InMemoryLobbyRepository();
const deckRepository = new InMemoryDeckRepository();
const deckService = new DeckService(deckRepository);
const tableService = new TableService(tableRepository);
const cardService = new CardService(cardRepository);
const userService = new UserService(userRepository);
const lobbyService = new LobbyService(lobbyRepository);
const gameService = new GameService(
  userService,
  cardService,
  tableService,
  deckService,
  lobbyService,
);

const socketHandler = new SocketHandler(io, gameService);

socketHandler.handleConnection();

export default server;
