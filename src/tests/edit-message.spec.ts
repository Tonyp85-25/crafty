import { EmptyMessageError, MessageTooLongError } from "../domain/message";
import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./messaging.fixture";

describe("Feature: editing a message", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });

  describe("Rule: the edited message should not be superior to 280 characters", () => {
    test("Alice can edit her message to a text inferior to 280 characters", async () => {
      const aliceMessageBuilder = messageBuilder()
        .withId("message-1")
        .authoredBy("Alice")
        .withText("Hello Wrld");
      fixture.givenTheFollowingMessagesExist([aliceMessageBuilder.build()]);
      await fixture.whenUserEditsMessage({
        messageId: "message-1",
        text: "Hello World, how are you?",
      });

      await fixture.thenMessageShouldBe(
        aliceMessageBuilder.withText("Hello World, how are you?").build()
      );
    });
    test("Alice cannot edit her message to a text superior to 280 characters", async () => {
      const textWithLengthOf281 =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a ante quis enim iaculis scelerisque. Nulla interdum mauris id justo hendrerit, vitae vulputate justo sagittis. Integer posuere lacus finibus, aliquet diam sed, placerat sem. Curabitur gravida luctus tortor, ac nunc.";
      const originalAliceMessage = messageBuilder()
        .withId("message-1")
        .authoredBy("Alice")
        .withText("Hello World")
        .build();
      fixture.givenTheFollowingMessagesExist([originalAliceMessage]);

      await fixture.whenUserEditsMessage({
        messageId: "message-1",
        text: textWithLengthOf281,
      });
      await fixture.thenMessageShouldBe(originalAliceMessage);
      fixture.thenErrorShouldBe(MessageTooLongError);
    });
  });
  describe("Rule: a message cannot be empty", () => {
    test("Alice cannot edit her message to a text with only whitespaces", async () => {
      const aliceMessageBuilder = messageBuilder()
        .withId("message-id")
        .authoredBy("Alice")
        .withText("Hello World");
      fixture.givenTheFollowingMessagesExist([aliceMessageBuilder.build()]);
      await fixture.whenUserEditsMessage({
        messageId: "message-id",
        text: "   ",
      });
      fixture.thenErrorShouldBe(EmptyMessageError);
    });
  });
});
