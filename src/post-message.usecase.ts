import { DateProvider } from "./date-provider";
import { EmptyMessageError, MessageText, MessageTooLongError } from "./message";
import { MessageRepository } from "./message.repository";

export type PostMessageCommand = {
  id: string;
  text: string;
  author: string;
};



export class PostMessageUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly dateProvider: DateProvider
  ) {}
  async handle(postMessageCommand: PostMessageCommand) {
  const message = MessageText.of(postMessageCommand.text)
    await this.messageRepository.save({
      id: postMessageCommand.id,
      text: message,
      author: postMessageCommand.author,
      publishedAt: this.dateProvider.getNow(),
    });
  }
}
