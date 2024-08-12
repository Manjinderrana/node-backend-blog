import request from 'supertest'
import app from '../../src/app'
import mongoose from 'mongoose'

beforeEach(async () => {
  await mongoose.connect('mongodb://localhost:27017')
})

afterEach(async () => {
  await mongoose.connection.close()
})

describe('Authentication Endpoints', () => {
  // Test user registration
  it('should register a new user', async () => {
    const res = await request(app).post('/api/v1/signup').send({
      username: 'testuser12',
      email: 'testuser22@example.com',
      password: 'password123',
    })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('data')
  })

  // Test user login
  it('should login an existing user', async () => {
    const res = await request(app).post('/api/v1/login').send({
      email: 'testuser2@example.com',
      password: 'password123',
    })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('data')
  })
})
