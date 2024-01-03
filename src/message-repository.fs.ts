import * as fs from "fs";
import * as path from "path";
import { Message, MessageText } from "./message";
import { MessageRepository } from "./message.repository";

export class FileSystemMessageRepository implements MessageRepository {
  private readonly messagePath = path.join(__dirname, "message.json");

  async getAllOfUser(user: string): Promise<Message[]> {
    const messages = await this.getMessages();
    return messages.filter((m) => m.author === user);
  }
  async save(message: Message): Promise<void> {
    const messages = await this.getMessages();
    const existingMessageIndex = messages.findIndex((m) => m.id === message.id);
    if (existingMessageIndex === -1) {
      messages.push(message);
    } else {
      messages[existingMessageIndex] = message;
    }

    return fs.promises.writeFile(this.messagePath, JSON.stringify(messages));
  }

  async getById(messageId: string): Promise<Message> {
    const messages = await this.getMessages();
    return messages.find((m) => m.id === messageId)!;
  }

  private async getMessages(): Promise<Message[]> {
    const data = await fs.promises.readFile(this.messagePath);
    const messages = JSON.parse(data.toString()) as {
      id: string;
      author: string;
      text: MessageText;
      publishedAt: string;
    }[];

    return messages.map((m) => ({
      id: m.id,
      author: m.author,
      text: m.text,
      publishedAt: new Date(m.publishedAt),
    }));
  }
}
