import { Message } from "../message";
import { InMemoryMessageRepository } from "../message-repository.inmemory";
import {
  EmptyMessageError,
  MessageTooLongError,
  PostMessageCommand,
  PostMessageUseCase,
} from "../post-message.usecase";
import { StubDateProvider } from "../stub-date-provider";
import { MessagingFixture, createMessagingFixture } from "./messaging.fixture";

describe("Feature: posting a message", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: a message can contain a maximum of 280 characters", () => {
    test("Alice can post a message on her timeline", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));
      await fixture.whenUserPostsAMessage({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
      });
      fixture.thenMessageShouldBe({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
        publishedAt: new Date("2023-01-19T19:00:00.000Z"),
      });
    });
    test("Too long message generates error", async () => {
      let textOf281 =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a ante quis enim iaculis scelerisque. Nulla interdum mauris id justo hendrerit, vitae vulputate justo sagittis. Integer posuere lacus finibus, aliquet diam sed, placerat sem. Curabitur gravida luctus tortor, ac nunc.";
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));
      await fixture.whenUserPostsAMessage({
        id: "message-id",
        text: textOf281,
        author: "Alice",
      });

      fixture.thenErrorShouldBe(MessageTooLongError);
    });
  });
  describe("Rule: a message cannot be empty", () => {
    test("Alice cannot post an empty message", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));
      await fixture.whenUserPostsAMessage({
        id: "message-id",
        text: "",
        author: "Alice",
      });
      fixture.thenErrorShouldBe(EmptyMessageError);
    });
    test("Alice cannot post message with only whitespaces", async () => {
      fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));
      await fixture.whenUserPostsAMessage({
        id: "message-id",
        text: "   ",
        author: "Alice",
      });
      fixture.thenErrorShouldBe(EmptyMessageError);
    });
  });
});
