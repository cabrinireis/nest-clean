import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { Env } from '@/infra/env'
import { AuthController } from '../http/controllers/auth.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService<Env, true>) {
        const privateKey = Buffer.from(
          config.get('JWT_PRIVATE_KEY', { infer: true }),
          'base64',
        ).toString('utf8')
        const publicKey = Buffer.from(
          config.get('JWT_PUBLIC_KEY', { infer: true }),
          'base64',
        ).toString('utf8')

        return {
          privateKey,
          publicKey,
          signOptions: {
            algorithm: 'RS256',
          },
        }
      },
    }),
  ],
  providers: [JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
