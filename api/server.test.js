const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig');

const Harry = { username: 'Harry', password: 'WartsHog' }
const Albus = { username: 'Albus', password: 'SherbertLemon' }

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate()
})

afterAll(async () => {
  await db.destroy()
})

describe('Endpoints', () => {
  it('sanity', () => {
    expect(true).toBe(true)
  })
  describe('[POST] /register', () => {
    it('cannot register user if username already exists', async () => {
      let response = await request(server).post('/api/auth/register').send(Harry)
      expect(response.body.username).toBe('Harry')
      response = await request(server).post('/api/auth/register').send(Harry)
      expect(response.body.username).not.toBe('Harry')
      expect(response.status).toBe(500)
    })
    it('username required', async () => {
      let response = await request(server).post('/api/auth/register').send({ password: 'WartsHog' })
      expect(response.status).toBe(401)
    })
  })
  describe('[POST] /login', () => {
    it('username required', async () => {
      let response = await request(server).post('/api/auth/login').send({ password: 'WartsHog' })
      expect(response.status).toBe(401)
    })
    it('responds with a token', async () => {
      let response = await request(server).post('/api/auth/register').send(Harry)
      expect(response.body.username).toBe('Harry')
      response = await request(server).post('/api/auth/login').send(Harry)
      expect(response.body).toHaveProperty('token')
    })
  })
  describe('[GET] /jokes', () => {
    it('does not respond with joke data without token', async () => {
      let response = await request(server).get('/api/jokes')
      expect(response.body).toMatch('token required')
    })
    it('responds with joke data with token', async () => {
      await request(server).post('/api/auth/register').send(Harry)
      let response = await request(server).post('/api/auth/login').send(Harry)
      response = await request(server).get('/api/jokes').send(response.body.token)
      console.log(response.body)
      expect(response.body).toHaveLength(3)
    })
  })
})