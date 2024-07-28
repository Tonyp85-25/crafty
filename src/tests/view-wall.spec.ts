import type { FolloweeRepository } from "../application/followee.repository";
import type { MessageRepository } from "../application/message.repository";
import { ViewWallUseCase } from "../application/usecases/view-wall.usecase";
import type { TimelineItem } from "../domain/timeline";
import { InMemoryFolloweeRepository } from "../infra/followee.inmemory.repository";
import { InMemoryMessageRepository } from "../infra/message-repository.inmemory";
import { StubDateProvider } from "../infra/stub-date-provider";
import {
  createFollowingFixture,
  type FollowingFixture,
} from "./following.fixture";
import { messageBuilder } from "./message.builder";
import {
  createMessagingFixture,
  type MessagingFixture,
} from "./messaging.fixture";

describe("Feature: view wall", () => {
  let fixture: Fixture;
  let messagingFixture: MessagingFixture;
  let followingFixture: FollowingFixture;

  const messageRepository = new InMemoryMessageRepository();
  const followeeRepository = new InMemoryFolloweeRepository();

  beforeEach(() => {
    messagingFixture = createMessagingFixture();
    followingFixture = createFollowingFixture();
    fixture = createFixture({
      messageRepository: messagingFixture.messageRepository,
      followeeRepository: followingFixture.followeeRepository,
    });
  });

  describe("Rule: All the messages from the user and its followees should appear in reverse chronological order", () => {
    test("Charlie subscribed to Alice's and Bob's timelines and view an agreggated list of subscriptions", async () => {
      fixture.givenNowIs(new Date("2023-02-17T17:15:00.000Z"));
      messagingFixture.givenTheFollowingMessagesExist([
        messageBuilder()
          .withId("message-1")
          .authoredBy("Alice")
          .withText("Test message from Alice")
          .publishedAt(new Date("2023-02-17T17:00:00.000Z"))
          .build(),
        messageBuilder()
          .withId("message-2")
          .authoredBy("Bob")
          .withText("Test message from Bob")
          .publishedAt(new Date("2023-02-17T17:01:00.000Z"))
          .build(),
        messageBuilder()
          .withId("message-3")
          .authoredBy("Charlie")
          .withText("Test message from Charlie")
          .publishedAt(new Date("2023-02-17T17:14:00.000Z"))
          .build(),
      ]);

      followingFixture.givenUserFollowees({
        user: "Charlie",
        followees: ["Alice"],
      });
      await fixture.whenUserSeesTimelineOf("Charlie");

      fixture.thenUserShouldSee([
        {
          author: "Charlie",
          text: "Test message from Charlie",
          publicationTime: "1 minute ago",
        },
        {
          author: "Alice",
          text: "Test message from Alice",
          publicationTime: "15 minutes ago",
        },
      ]);
    });
  });
});

const createFixture = ({
  messageRepository,
  followeeRepository,
}: {
  messageRepository: MessageRepository;
  followeeRepository: FolloweeRepository;
}) => {
  let wall: TimelineItem[];
  const dateProvider = new StubDateProvider();
  const viewWallUseCase = new ViewWallUseCase(
    messageRepository,
    followeeRepository,
    dateProvider
  );
  return {
    givenNowIs(_now: Date) {
      dateProvider.now = _now;
    },
    async whenUserSeesTimelineOf(user: string) {
      wall = await viewWallUseCase.handle({ user });
    },
    thenUserShouldSee(expectedWall: TimelineItem[]) {
      expect(wall).toEqual(expectedWall);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
