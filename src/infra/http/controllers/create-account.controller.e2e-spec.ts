import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma.service'

describe('Create account (E2E)', () => {
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

  it('should create a new account', async () => {
    const email = `alice-${Date.now()}@example.com`
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'Alice',
      email,
      password: '123456',
    })

    expect(response.status).toBe(201)
    await expect(
      prisma.user.findUnique({ where: { email } }),
    ).resolves.toMatchObject({
      email,
      name: 'Alice',
    })
  })
})
