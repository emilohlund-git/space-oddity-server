import request from 'supertest';

import { server as app, gameScheduler } from '../src/application/app';

describe('app', () => {
  afterAll(() => {
    gameScheduler.unref();
  });

  it('responds with a not found message', (done) => {
    request(app)
      .get('/what-is-this-even')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404, done);
  });
});

describe('GET /', () => {
  afterAll(() => {
    gameScheduler.unref();
  });

  it('responds with a json message', (done) => {
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
      }, done);
  });
});
