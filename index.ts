#!/usr/bin/env node

import { Command } from "commander";
import { randomUUID } from "crypto";
import type { DateProvider } from "./src/application/date-provider";
import {
  EditMessageUseCase,
  type EditMessageCommand,
} from "./src/application/usecases/edit-message.usecase";
import { FollowUserUseCase } from "./src/application/usecases/follow-user.usecase";
import {
  PostMessageUseCase,
  type PostMessageCommand,
} from "./src/application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "./src/application/usecases/view-timeline.usecase";
import { FileSystemFolloweeRepository } from "./src/infra/followee.fs.repository";
import { FileSystemMessageRepository } from "./src/infra/message-repository.fs";

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}

const messageRepository = new FileSystemMessageRepository();
const followeeRepository = new FileSystemFolloweeRepository();
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
          const timeline = await viewTimelineUseCase.handle({ user });
          console.table(timeline);
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
  await program.parseAsync();
}

main();
