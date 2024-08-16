#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import Fastify, { type FastifyInstance, FastifyReply } from "fastify";
import * as httpErrors from "http-errors";

import { randomUUID } from "node:crypto";
import type { DateProvider } from "../application/date-provider";
import { TimelinePresenter } from "../application/timeline.presenter";
import {
  type EditMessageCommand,
  EditMessageUseCase,
} from "../application/usecases/edit-message.usecase";
import { FollowUserUseCase } from "../application/usecases/follow-user.usecase";
import {
  type PostMessageCommand,
  PostMessageUseCase,
} from "../application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "../application/usecases/view-timeline.usecase";
import { Timeline } from "../domain/timeline";
import { PrismaFoloweeRepository } from "../infra/followee.prisma.repository";
import { PrismaMessageRepository } from "../infra/message.prisma.repository";

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}
const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followeeRepository = new PrismaFoloweeRepository(prismaClient);
const dateProvider = new RealDateProvider();
const postMessageUseCase = new PostMessageUseCase(
  messageRepository,
  dateProvider
);
const viewTimelineUseCase = new ViewTimelineUseCase(
  messageRepository,
  dateProvider
);
const editMessageUseCase = new EditMessageUseCase(messageRepository);

const followUserUseCase = new FollowUserUseCase(followeeRepository);

const fastify = Fastify({
  logger: true,
});

class ApiTimelinePresenter implements TimelinePresenter {
  constructor(private readonly reply: FastifyReply) {}
  show(timeline: Timeline): void {
    this.reply.status(200);
    this.reply.send(timeline.data);
  }
}

const routes = async (fastifyInstance: FastifyInstance) => {
  fastifyInstance.post<{ Body: { user: string; message: string } }>(
    "/post",
    {},
    async (request, reply) => {
      const postMessageCommand: PostMessageCommand = {
        id: randomUUID(),
        author: request.body.user,
        text: request.body.message,
      };

      try {
        await postMessageUseCase.handle(postMessageCommand);
        reply.status(201);
        // reply.send("✔️  message posté!");
      } catch (error) {
        reply.send(httpErrors[500](error));
      }
    }
  );
  fastifyInstance.post<{ Body: { messageId: string; text: string } }>(
    "/edit",
    {},
    async (request, reply) => {
      const editMessageCommand: EditMessageCommand = {
        messageId: request.body.messageId,
        text: request.body.text,
      };

      try {
        await editMessageUseCase.handle(editMessageCommand);
        reply.status(200);
        // console.table([messageRepository.message]);
      } catch (error) {
        reply.send(httpErrors[500](error));
      }
    }
  );
  fastifyInstance.get<{
    Querystring: { user: string };
    Reply:
      | { author: string; text: string; publicationTime: string }[]
      | httpErrors.HttpError<500>;
  }>("/view", {}, async (request, reply) => {
    try {
      const timelinePresenter = new ApiTimelinePresenter(reply);
      await viewTimelineUseCase.handle(
        {
          user: request.query.user,
        },
        timelinePresenter
      );
    } catch (err) {
      reply.send(httpErrors[500](err));
    }
  });
};

fastify.register(routes);
fastify.addHook("onClose", async () => {
  await prismaClient.$disconnect();
});
async function main() {
  try {
    await prismaClient.$connect();
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
