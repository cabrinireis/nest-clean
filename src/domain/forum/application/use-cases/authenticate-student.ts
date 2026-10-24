import { Either, left, right } from '@/core/either'
import { StudentsRepository } from '../repositories/students-repository'
import { Injectable } from '@nestjs/common'
import { HashCompare } from '../cryptography/hash-compare'
import { Encrypter } from '../cryptography/encrypter'
import { WrongCredentialsError } from './erros/wrong-credentials-error'

interface AuthenticateUseCaseRequest {
  name: string
  email: string
  password: string
}

type AuthenticateUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string
  }
>
@Injectable()
export class AuthenticateUseCase {
  constructor(
    private studentsRepository: StudentsRepository,
    private hashCompare: HashCompare,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const student = await this.studentsRepository.findByEmail(email)

    if (!student) {
      return left(new WrongCredentialsError())
    }

    const isPasswordValid = await this.hashCompare.compare(
      password,
      student.password,
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: student.id.toString(),
    })

    return right({
      accessToken,
    })
  }
}
