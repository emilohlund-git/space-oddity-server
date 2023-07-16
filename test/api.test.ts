import request from 'supertest';

import { server as app, gameScheduler } from '../src/application/app';

describe('GET /api/v1', () => {
  afterAll(() => {
    gameScheduler.unref();
  });

  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - 👋🌎🌍🌏',
      }, done);
  });
});

describe('GET /api/v1/emojis', () => {
  afterAll(() => {
    gameScheduler.unref();
  });

  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/emojis')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, ['😀', '😳', '🙄'], done);
  });
});
