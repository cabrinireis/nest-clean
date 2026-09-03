import { Module } from "@nestjs/common";
import { ListQuestionsController } from "./controllers/list-questions.controller";
import { CreateQuestionController } from "./controllers/create-question.controller";
import { CreateAccountController } from './controllers/create-account.controller'
import { PrismaService } from "../prisma/prisma.service";

@Module({
    controllers: [
        CreateAccountController,
        CreateQuestionController,
        ListQuestionsController,
    ],
    providers: [PrismaService]
})
export class HttpModule {

}
