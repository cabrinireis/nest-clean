import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'

describe('Create question (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

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

  it('should create a new question', async () => {
    const email = `alice-${Date.now()}@example.com`
    const user = await prisma.user.create({
      data: {
        name: 'Alice',
        email,
        password: '12345678',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test e2e title',
        content: 'Test e2e content',
      })

    expect(response.status).toBe(201)
    const questionOnDataBase = await prisma.question.findFirst({
      where: {
        title: 'Test e2e title',
      },
    })

    expect(questionOnDataBase).toBeTruthy()
  })
})
