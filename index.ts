#!/usr/bin/env node

import { Command } from "commander";
import {
  DateProvider,
  PostMessageCommand,
  PostMessageUseCase,
} from "./src/post-message.usecase";
import { InMemoryMessageRepository } from "./src/message-repository.inmemory";
import { log } from "console";

class RealDateProvider implements DateProvider {
  getNow(): Date {
    return new Date();
  }
}

const messageRepository = new InMemoryMessageRepository();
const dateProvider = new RealDateProvider();
const postMessageUseCase = new PostMessageUseCase(
  messageRepository,
  dateProvider
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
          id: "some-message-id",
          author: user,
          text: message,
        };

        try {
          await postMessageUseCase.handle(postMessageCommand);
          console.log("✔️  message posté!");
          console.table([messageRepository.message]);
        } catch (error) {
          console.error("⚠️ ", error);
        }
      })
  );

async function main() {
  await program.parseAsync();
}

main();
