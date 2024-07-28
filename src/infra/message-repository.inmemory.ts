import type { MessageRepository } from "../application/message.repository";
import { Message } from "../domain/message";

export class InMemoryMessageRepository implements MessageRepository {
  getById(messageId: string): Promise<Message> {
    return Promise.resolve(this.getMessageById(messageId));
  }
  messages = new Map<string, Message>();
  save(msg: Message): Promise<void> {
    this._save(msg);
    return Promise.resolve();
  }

  getMessageById(messageId: string) {
    return this.messages.get(messageId)!;
  }

  givenExistingMessages(messages: Message[]) {
    messages.forEach(this._save.bind(this));
  }
  getAllOfUser(user: string): Promise<Message[]> {
    return Promise.resolve(
      [...this.messages.values()]
        .filter((msg) => msg.author === user)
        .map((m) =>
          Message.fromData({
            id: m.id,
            author: m.author,
            text: m.text,
            publishedAt: m.publishedAt,
          })
        )
    );
  }

  private _save(msg: Message) {
    this.messages.set(msg.id, msg);
  }
}
