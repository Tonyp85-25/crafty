import { Timeline } from "../../domain/timeline";
import type { DateProvider } from "../date-provider";
import type { FolloweeRepository } from "../followee.repository";
import type { MessageRepository } from "../message.repository";
import { TimelinePresenter } from "../timeline.presenter";
export class ViewWallUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private followeeRepository: FolloweeRepository,
    private dateProvider: DateProvider
  ) {}

  async handle(
    { user }: { user: string },
    timelinePresenter: TimelinePresenter
  ): Promise<void> {
    const followees = await this.followeeRepository.getFolloweesOf(user);
    console.log(followees);

    const followeesMessages = (
      await Promise.all(
        [user, ...followees].map((user) =>
          this.messageRepository.getAllOfUser(user)
        )
      )
    ).flat();

    const timeline = new Timeline(followeesMessages);
    timelinePresenter.show(timeline);
  }
}
