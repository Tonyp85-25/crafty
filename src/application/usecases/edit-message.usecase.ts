import type {
  EmptyMessageError,
  MessageTooLongError,
} from "../../domain/message";
import type { MessageRepository } from "../message.repository";
import { Err, Ok, type Result } from "../result";

export interface EditMessageCommand {
  messageId: string;
  text: string;
}
export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async handle(
    editMessageCommand: EditMessageCommand
  ): Promise<Result<void, EmptyMessageError | MessageTooLongError>> {
    const message = await this.messageRepository.getById(
      editMessageCommand.messageId
    );
    try {
      message.editText(editMessageCommand.text);
    } catch (error) {
      return Err.of(error);
    }

    await this.messageRepository.save(message);
    return Ok.of(undefined);
  }
}
