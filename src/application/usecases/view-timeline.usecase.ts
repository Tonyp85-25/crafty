import { Timeline } from "../../domain/timeline";
import type { DateProvider } from "../date-provider";
import type { MessageRepository } from "../message.repository";
import type { TimelinePresenter } from "../timeline.presenter";

export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle(
    { user }: { user: string },
    timelinePresenter: TimelinePresenter
  ): Promise<void> {
    const userMessages = await this.messageRepository.getAllOfUser(user);
    userMessages;

    const timeline = new Timeline(userMessages);
    timelinePresenter.show(timeline);
  }
}
