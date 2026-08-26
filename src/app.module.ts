import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CreateAccountController } from './controllers/create-account.controller'
import { envSchema } from './env'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { CreateQuestionController } from './controllers/create-question.controller'
import { ListQuestionsController } from './controllers/list-questions.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [
    CreateAccountController,
    CreateQuestionController,
    ListQuestionsController,
  ],
})
export class AppModule {}
