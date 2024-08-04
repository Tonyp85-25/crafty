import type { PrismaClient } from "@prisma/client";
import type { MessageRepository } from "../application/message.repository";
import { Message } from "../domain/message";

export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(message: Message): Promise<void> {
    const messageData = message.data;
    await this.prisma.user.upsert({
      where: { name: message.author },
      update: { name: message.author },
      create: { name: message.author },
    });

    await this.prisma.message.upsert({
      where: { id: messageData.id },
      update: {
        id: messageData.id,
        text: messageData.text,
        publishedAt: messageData.publishedAt,
        authorId: messageData.author,
      },
      create: {
        id: messageData.id,
        text: messageData.text,
        publishedAt: messageData.publishedAt,
        authorId: messageData.author,
      },
    });
  }

  async getById(id: string): Promise<Message> {
    const messageData = await this.prisma.message.findFirstOrThrow({
      where: { id },
    });
    return Message.fromData({
      id: messageData.id,
      text: messageData.text,
      author: messageData.authorId,
      publishedAt: messageData.publishedAt,
    });
  }

  async getAllOfUser(user: string): Promise<Message[]> {
    const messageData = await this.prisma.message.findMany({
      where: { authorId: user },
    });
    return messageData.map((m) =>
      Message.fromData({
        id: m.id,
        text: m.text,
        author: m.authorId,
        publishedAt: m.publishedAt,
      })
    );
  }
}
