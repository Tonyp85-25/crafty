import { Message } from "../domain/message";

export interface MessageRepository {
  save(message: Message): Promise<void>;
  getAllOfUser(user: string): Promise<Message[]>;
  getById(messageId: string): Promise<Message>;
}
