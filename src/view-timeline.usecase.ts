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
    return [
      {
        author: userMessages[0].author,
        text: userMessages[0].text,
        publicationTime: this.publicationTime(now, userMessages[0].publishedAt),
      },
      {
        author: userMessages[1].author,
        text: userMessages[1].text,
        publicationTime: this.publicationTime(now, userMessages[1].publishedAt),
      },
      {
        author: userMessages[2].author,
        text: userMessages[2].text,
        publicationTime: this.publicationTime(now, userMessages[2].publishedAt),
      },
    ];
  }

  private publicationTime = (now: Date, publishedAt: Date): string => {
    const diff = now.getTime() - publishedAt.getTime();
    const minuteNumber = diff / 60000;
    if (minuteNumber < 1) {
      return "Less than a minute ago";
    }
    if (minuteNumber < 2) {
      return "1 minute ago";
    }

    return `${minuteNumber} minutes ago`;
  };
}
