import {
  type EmptyMessageError,
  Message,
  type MessageTooLongError,
} from "../../domain/message";
import type { DateProvider } from "../date-provider";
import type { MessageRepository } from "../message.repository";
import { Err, Ok, type Result } from "../result";

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
  async handle(
    postMessageCommand: PostMessageCommand
  ): Promise<Result<void, EmptyMessageError | MessageTooLongError>> {
    let message: Message;
    try {
      message = Message.fromData({
        id: postMessageCommand.id,
        text: postMessageCommand.text,
        author: postMessageCommand.author,
        publishedAt: this.dateProvider.getNow(),
      });
    } catch (error) {
      return Err.of(error);
    }
    await this.messageRepository.save(message);
    return Ok.of(undefined);
  }
}
