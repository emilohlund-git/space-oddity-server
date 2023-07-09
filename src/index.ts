import app from './application/app';
import { logger } from './configurations/logger.config';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info(`⚡ Listening: http://localhost:${port}`);
});
