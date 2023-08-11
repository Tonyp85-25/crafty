import { Message } from "../message";
import { ViewTimelineUseCase } from "../view-timeline.usecase";
import { InMemoryMessageRepository } from "../message-repository.inmemory";
import { Timeline } from "../timeline";

describe("Feature: view timeline", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
  });
  describe("Rule: Messages are shown in reverse chronological order", () => {
    test("Alice can view the 2 messages she published in her timeline", async () => {
      fixture.givenTheFollowingMessagesExist([
        {
          author: "Alice",
          text: "My first message",
          id: "message-1",
          publishedAt: new Date("2023-02-17T17:00:00.000Z"),
        },
        {
          author: "Bob",
          text: "Hi it's Bob",
          id: "message-2",
          publishedAt: new Date("2023-02-17T17:01:00.000Z"),
        },
        {
          author: "Alice",
          text: "How are you",
          id: "message-3",
          publishedAt: new Date("2023-02-17T17:02:00.000Z"),
        },
      ]);
      fixture.givenNowIs(new Date("2023-02-17T17:03:00.000Z"));

      await fixture.whenUserSeesTimelineOf("Alice");
      fixture.thenUserShouldSee([
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

const createFixture = () => {
  let timeline: Timeline;
  const messageRepository = new InMemoryMessageRepository();
  const viewTimelineUseCase = new ViewTimelineUseCase(messageRepository);
  return {
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    givenNowIs(now: Date) {},
    async whenUserSeesTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
    },
    thenUserShouldSee(_timeline: Timeline) {
      expect(timeline).toEqual(_timeline);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
