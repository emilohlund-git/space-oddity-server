// eslint-disable-next-line import/no-extraneous-dependencies
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'socket-handler' },
  handleExceptions: true,
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export { logger };

