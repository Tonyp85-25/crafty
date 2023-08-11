import { MessageRepository } from "./message.repository";
import { Timeline } from "./timeline";

export class ViewTimelineUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle({ user }: { user: string }): Promise<Timeline> {
    const userMessages = await this.messageRepository.getAllOfUser(user);
    userMessages.sort(
      (msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime()
    );

    return [
      {
        author: userMessages[0].author,
        text: userMessages[0].text,
        publicationTime: "1 minute ago",
      },
      {
        author: userMessages[1].author,
        text: userMessages[1].text,
        publicationTime: "3 minutes ago",
      },
    ];
  }
}
