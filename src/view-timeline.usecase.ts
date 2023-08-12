import { DateProvider } from "./date-provider";
import { MessageRepository } from "./message.repository";
import { Timeline } from "./timeline";

export class ViewTimelineUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}

  async handle({ user }: { user: string }): Promise<Timeline> {
    const userMessages = await this.messageRepository.getAllOfUser(user);
    userMessages.sort(
      (msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime()
    );
    const now = this.dateProvider.getNow();
    return userMessages.map((m) => ({
      id: m.id,
      author: m.author,
      text: m.text,
      publicationTime: this.publicationTime(now, m.publishedAt),
    }));
  }

  private publicationTime = (now: Date, publishedAt: Date): string => {
    const diff = now.getTime() - publishedAt.getTime();
    const minuteNumber = Math.floor(diff / 60000);
    if (minuteNumber < 1) {
      return "Less than a minute ago";
    }
    if (minuteNumber < 2) {
      return "1 minute ago";
    }

    return `${minuteNumber} minutes ago`;
  };
}
