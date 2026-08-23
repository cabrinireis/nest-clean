import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { Env } from 'src/env'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService<Env, true>) {
        const privateKey = Buffer.from(
          config.get('JWT_PRIVATE_KEY_BASE64', { infer: true }),
          'base64',
        ).toString('utf8')
        const publicKey = Buffer.from(
          config.get('JWT_PUBLIC_KEY_BASE64', { infer: true }),
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
})
export class AuthModule {}
