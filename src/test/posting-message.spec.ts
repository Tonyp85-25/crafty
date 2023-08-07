import {
  DateProvider,
  Message,
  MessageRepository,
  MessageTooLongError,
  PostMessageUseCase,
} from "../post-message.usecase";

describe("Feature: posting a message", () => {
  describe("Rule: a message can contain a maximum of 280 characters", () => {
    test("Alice can post a message on her timeline", () => {
      givenNowIs(new Date("2023-01-19T19:00:00.000Z"));
      whenUserPostsAMessage({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
      });
      thenPostedMessageShouldBe({
        id: "message-id",
        text: "Hello World",
        author: "Alice",
        publishedAt: new Date("2023-01-19T19:00:00.000Z"),
      });
    });
    test("Too long message generates error", () => {
      let textOf281 =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a ante quis enim iaculis scelerisque. Nulla interdum mauris id justo hendrerit, vitae vulputate justo sagittis. Integer posuere lacus finibus, aliquet diam sed, placerat sem. Curabitur gravida luctus tortor, ac nunc.";
      givenNowIs(new Date("2023-01-19T19:00:00.000Z"));
      whenUserPostsAMessage({
        id: "message-id",
        text: textOf281,
        author: "Alice",
      });

      thenErrorShouldBe(MessageTooLongError);
    });
  });
});

let message: Message;
let thrownError: Error;

class InMemoryMessageRepository implements MessageRepository {
  save(msg: Message): void {
    message = msg;
  }
}

class StubDateProvider implements DateProvider {
  now: Date;
  getNow(): Date {
    return this.now;
  }
}

const messageRepository = new InMemoryMessageRepository();
const dateProvider = new StubDateProvider();

const postMessageUseCase = new PostMessageUseCase(
  messageRepository,
  dateProvider
);

function givenNowIs(_now: Date) {
  dateProvider.now = _now;
}

function whenUserPostsAMessage(postMessageCommand: {
  id: string;
  text: string;
  author: string;
}) {
  try {
    postMessageUseCase.handle(postMessageCommand);
  } catch (err) {
    thrownError = err;
  }
}

function thenPostedMessageShouldBe(expectedMessage: {
  id: string;
  text: string;
  author: string;
  publishedAt: Date;
}) {
  expect(expectedMessage).toEqual(message);
}

function thenErrorShouldBe(expectedErrorClass: new () => Error) {
  expect(thrownError).toBeInstanceOf(expectedErrorClass);
}
