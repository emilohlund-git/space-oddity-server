import { server } from './application/app';
import { logger } from './configurations/logger.config';

const port = process.env.PORT || 8080;
server.listen(port, () => {
  logger.info(`⚡ Listening: http://localhost:${port}`);
});
