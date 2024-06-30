import {
  FollowUserUseCase,
  type FollowUserCommand,
} from "../application/usecases/follow-user.usecase";
import { InMemoryFolloweeRepository } from "../infra/followee.inmemory.repository";

export const createFollowingFixture = () => {
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
      const currentFollowees = await followeeRepository.getFolloweesOf(
        userFollowees.user
      );
      expect(currentFollowees).toEqual(userFollowees.followees);
    },
  };
};

export type FollowingFixture = ReturnType<typeof createFollowingFixture>;
