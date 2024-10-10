import mongoose from 'mongoose'
import request from 'supertest'
import httpServer from '../../src/app'

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017')
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('Authentication Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(httpServer).post('/api/v1/auth/signup').send({
      username: 'testuser@12',
      email: 'testuser22@gmail.com',
      password: 'password123',
    })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('data')
  })

  it('should login an existing user', async () => {
    const res = await request(httpServer).post('/api/v1/auth/login').send({
      email: 'testuser22@gmail.com',
      password: 'password123',
    })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('data')
  })
})
