import { Timeline, type TimelineItem } from "../../domain/timeline";
import type { DateProvider } from "../date-provider";
import type { MessageRepository } from "../message.repository";

export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle({ user }: { user: string }): Promise<TimelineItem[]> {
    const userMessages = await this.messageRepository.getAllOfUser(user);
    userMessages;
    const now = this.dateProvider.getNow();
    const timeline = new Timeline(userMessages, now);
    return timeline.data;
  }
}
