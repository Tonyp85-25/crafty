import {
  FollowUserCommand,
  FollowUserUseCase,
} from "../application/usecases/follow-user.usecase";
import { InMemoryFolloweeRepository } from "../infra/followee.inmemory.repository";

describe("Feature: following a user", () => {
  let fixture: Fixture;
  beforeEach(() => {
    fixture = createFixture();
  });
  test("Alice can follow Bob", async () => {
    fixture.givenUserFollowees({
      user: "Alice",
      followees: ["Charlie"],
    });

    await fixture.whenUserFollows({
      user: "Alice",
      userToFollow: "Bob",
    });

    await fixture.thenUserFolloweesAre({
      user: "Alice",
      followees: ["Charlie", "Bob"],
    });
  });
});

const createFixture = () => {
  const followeeRepository = new InMemoryFolloweeRepository();

  const followUserUseCase = new FollowUserUseCase(followeeRepository);

  return {
    givenUserFollowees({
      user,
      followees,
    }: {
      user: string;
      followees: string[];
    }) {
      followeeRepository.givenExistingFollowees(
        followees.map((f) => ({ user, followee: f }))
      );
    },
    async whenUserFollows(followCommand: FollowUserCommand) {
      await followUserUseCase.handle(followCommand);
    },
    async thenUserFolloweesAre(userFollowees: { user; followees }) {
      const currentFollowees = followeeRepository.getFolloweesOf(
        userFollowees.user
      );
      expect(currentFollowees).toEqual(userFollowees.followees);
    },
  };
};

type Fixture = ReturnType<typeof createFixture>;
