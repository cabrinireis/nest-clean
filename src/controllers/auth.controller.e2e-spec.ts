import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { hash } from 'bcryptjs'
import type { Server } from 'node:http'
import { randomUUID } from 'node:crypto'

describe('Auth (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    await app.init()
  })

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "questions", "users" RESTART IDENTITY CASCADE',
    )
  })

  afterAll(async () => {
    await app.close()
  })

  it('should create new account', async () => {
    const email = `alice-${randomUUID()}@example.com`

    await prisma.user.create({
      data: {
        name: 'Alice',
        email,
        password: await hash('12345678', 8),
      },
    })
    const httpServer = app.getHttpServer() as unknown as Server

    const response = await request(httpServer).post('/auth/login').send({
      email,
      password: '12345678',
    })

    expect(response.status).toBe(201)

    const body = response.body as unknown as {
      access_token?: unknown
    }

    expect(body).toHaveProperty('access_token')
    expect(typeof body.access_token).toBe('string')
  })
})
