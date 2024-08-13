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
    const res = await request(app).post('/api/v1/auth/signup').send({
      username: 'testduser@12',
      email: 'testuserd22@gmail.com',
      password: 'password123',
    })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('data')
  })
})

describe('login Endpoint', () => {
  // Test user login
  it('should login an existing user', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'testuserd22@gmail.com',
      password: 'password123',
    })
    console.log(res.status);
    
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('data')
  })
})
