import { Timeline, type TimelineItem } from "../../domain/timeline";
import type { DateProvider } from "../date-provider";
import type { FolloweeRepository } from "../followee.repository";
import type { MessageRepository } from "../message.repository";
const ONE_MINUTE_IN_MS = 60000;
export class ViewWallUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private followeeRepository: FolloweeRepository,
    private dateProvider: DateProvider
  ) {}

  async handle({ user }: { user: string }): Promise<TimelineItem[]> {
    const followees = await this.followeeRepository.getFolloweesOf(user);
    const followeesMessages = (
      await Promise.all(
        [user, ...followees].map((user) =>
          this.messageRepository.getAllOfUser(user)
        )
      )
    ).flat();
    console.log(followeesMessages);
    const timeline = new Timeline(
      followeesMessages,
      this.dateProvider.getNow()
    );
    return timeline.data;
  }
}
