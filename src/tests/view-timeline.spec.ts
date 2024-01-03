import { messageBuilder } from "./message.builder";
import { MessagingFixture, createMessagingFixture } from "./messaging.fixture";

describe("Feature: view timeline", () => {
  let fixture: MessagingFixture;

  beforeEach(() => {
    fixture = createMessagingFixture();
  });
  describe("Rule: Messages are shown in reverse chronological order", () => {
    test("Alice can view the 3 messages she published in her timeline", async () => {
      const aliceMessageBuilder = messageBuilder().authoredBy("Alice");
      fixture.givenTheFollowingMessagesExist([
        aliceMessageBuilder
          .withId("message-1")
          .withText("My first message")
          .publishedAt(new Date("2023-02-17T17:00:00.000Z"))
          .build(),
        messageBuilder()
          .authoredBy("Bob")
          .withId("message-2")
          .withText("Hi it's Bob")
          .publishedAt(new Date("2023-02-17T17:01:00.000Z"))
          .build(),
        aliceMessageBuilder
          .withId("message-3")
          .withText("How are you")
          .publishedAt(new Date("2023-02-17T17:02:00.000Z"))
          .build(),
        aliceMessageBuilder
          .withId("message-4")
          .withText("Hey!")
          .publishedAt(new Date("2023-02-17T17:02:30.000Z"))
          .build(),
      ]);
      fixture.givenNowIs(new Date("2023-02-17T17:03:00.000Z"));

      await fixture.whenUserSeesTimelineOf("Alice");
      fixture.thenUserShouldSee([
        {
          author: "Alice",
          text: "Hey!",
          publicationTime: "Less than a minute ago",
        },
        {
          author: "Alice",
          text: "How are you",
          publicationTime: "1 minute ago",
        },
        {
          author: "Alice",
          text: "My first message",
          publicationTime: "3 minutes ago",
        },
      ]);
    });
  });
});
