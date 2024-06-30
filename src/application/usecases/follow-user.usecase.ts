import type { FolloweeRepository } from "../followee.repository";
export type FollowUserCommand = {
  user: string;
  userToFollow: string;
};

export class FollowUserUseCase {
  constructor(private readonly followeeRepository: FolloweeRepository) {}

  async handle(followCommand: FollowUserCommand) {
    await this.followeeRepository.saveFollowee({
      user: followCommand.user,
      followee: followCommand.userToFollow,
    });
  }
}
