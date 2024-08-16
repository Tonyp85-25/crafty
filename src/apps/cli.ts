#!/usr/bin/env node

import { PrismaClient } from "@prisma/client";
import { Command } from "commander";
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
import { TimelineDefaultPresenter } from "./timeline.default.presenter";

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

class CliPresenter implements TimelinePresenter {
  constructor(private readonly defaultPresenter: TimelineDefaultPresenter) {}
  show(timeline: Timeline): void {
    console.table(this.defaultPresenter.show(timeline));
  }
}

const timelinePresenter = new CliPresenter(
  new TimelineDefaultPresenter(dateProvider)
);
const program = new Command();

program
  .version("1.0.0")
  .description("Crafty social network")
  .addCommand(
    new Command("post")
      .argument("<user>", "the current user")
      .argument("<message>", "the message to post")
      .action(async (user, message) => {
        const postMessageCommand: PostMessageCommand = {
          id: randomUUID(),
          author: user,
          text: message,
        };

        try {
          await postMessageUseCase.handle(postMessageCommand);
          console.log("✔️  message posté!");
        } catch (error) {
          console.error("⚠️ ", error);
        }
      })
  )
  .addCommand(
    new Command("view")
      .argument("<user>", "the user to view the timeline")
      .action(async (user) => {
        try {
          await viewTimelineUseCase.handle({ user }, timelinePresenter);

          process.exit(0);
        } catch (err) {
          console.error(err);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command("edit")
      .argument("<message-id>", "the id of the message to be updated")
      .argument("<message>", "the text of the message")
      .action(async (messageId, message) => {
        const editMessageCommand: EditMessageCommand = {
          messageId,
          text: message,
        };

        try {
          await editMessageUseCase.handle(editMessageCommand);
          console.log("✔️  message modifié!");
          process.exit(0);
          // console.table([messageRepository.message]);
        } catch (error) {
          console.error("⚠️ ", error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command("follow")
      .argument("<user>", "the current user")
      .argument("<user-to-follow>", "the user to follow")
      .action(async (user, userToFollow) => {
        try {
          await followUserUseCase.handle({ user, userToFollow });
          console.log(`✔️  You follow ${userToFollow}!`);
          process.exit(0);
        } catch (error) {}
      })
  );

async function main() {
  await prismaClient.$connect();
  await program.parseAsync();
  await prismaClient.$disconnect();
}

main();
