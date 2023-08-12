import { Message } from "../message";
import { ViewTimelineUseCase } from "../view-timeline.usecase";
import { InMemoryMessageRepository } from "../message-repository.inmemory";
import { Timeline } from "../timeline";
import { StubDateProvider } from "../stub-date-provider";

describe("Feature: view timeline", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = createFixture();
  });
  describe("Rule: Messages are shown in reverse chronological order", () => {
    test("Alice can view the 3 messages she published in her timeline", async () => {
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
        {
          author: "Alice",
          text: "Hey!",
          id: "message-4",
          publishedAt: new Date("2023-02-17T17:02:30.000Z"),
        },
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
  // tests will be deleted after usage
  // describe("publicationTime", () => {
  //   it("should return 'less than minute ago' when the publication date is inferior to 1 minute", () => {
  //     const now = new Date("2023-02-16T10:57:00.000Z");
  //     const publishedAt = new Date("2023-02-16T10:56:30.000Z");

  //     const text = publicationTime(now, publishedAt);
  //     expect(text).toEqual("less than a minute ago");
  //   });
  //   it("should return '1 minute ago' when the publication date is equal to 1 minute", () => {
  //     const now = new Date("2023-02-16T10:57:00.000Z");
  //     const publishedAt = new Date("2023-02-16T10:56:00.000Z");

  //     const text = publicationTime(now, publishedAt);
  //     expect(text).toEqual("1 minute ago");
  //   });
  //   it("should return '1 minute ago' when the publication date is exactly under 2 minutes ago", () => {
  //     const now = new Date("2023-02-16T10:57:00.000Z");
  //     const publishedAt = new Date("2023-02-16T10:55:45.000Z");

  //     const text = publicationTime(now, publishedAt);
  //     expect(text).toEqual("1 minute ago");
  //   });
  //   it("should return '2 minutes ago' when the publication date is equal to 2 minutes ago", () => {
  //     const now = new Date("2023-02-16T10:57:00.000Z");
  //     const publishedAt = new Date("2023-02-16T10:55:00.000Z");

  //     const text = publicationTime(now, publishedAt);
  //     expect(text).toEqual("2 minutes ago");
  //   });
  //   it("should return 'X minute ago' when the publication date superior to 2 minutes ago", () => {
  //     const now = new Date("2023-02-16T10:57:00.000Z");
  //     const publishedAt = new Date("2023-02-16T10:54:00.000Z");

  //     const text = publicationTime(now, publishedAt);
  //     expect(text).toEqual("3 minutes ago");
  //   });
  // });
});

const createFixture = () => {
  let timeline: Timeline;
  const messageRepository = new InMemoryMessageRepository();
  const dateProvider = new StubDateProvider();
  const viewTimelineUseCase = new ViewTimelineUseCase(
    messageRepository,
    dateProvider
  );
  return {
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    givenNowIs(now: Date) {
      dateProvider.now = now;
    },
    async whenUserSeesTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
    },
    thenUserShouldSee(_timeline: Timeline) {
      expect(timeline).toEqual(_timeline);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
