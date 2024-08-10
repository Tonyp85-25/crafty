import { PrismaClient } from "@prisma/client";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { PrismaMessageRepository } from "../infra/message.prisma.repository";
import { messageBuilder } from "./message.builder";

const asyncExec = promisify(exec);
describe("Prisma Message Repository", () => {
  jest.setTimeout(60000); //mandatory to let container start
  let container: StartedPostgreSqlContainer;
  let prismaClient: PrismaClient;
  beforeAll(async () => {
    container = await new PostgreSqlContainer()
      .withDatabase("test")
      .withUsername("test")
      .withPassword("test")
      .withExposedPorts(5432)
      .start();
    const databaseUrl = `postgresql://test:test@${container.getHost()}:${container.getPort()}/test?schema=public`;

    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    await asyncExec(`DATABASE_URL=${databaseUrl} pnpm prisma migrate deploy`);
    return prismaClient.$connect();
  });

  afterAll(async () => {
    await container.stop();
    await prismaClient.$disconnect();
  });

  beforeEach(async () => {
    await prismaClient.message.deleteMany();
    await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');
  });

  test("save should save a new message", async () => {
    const repository = new PrismaMessageRepository(prismaClient);
    await repository.save(
      messageBuilder()
        .authoredBy("Alice")
        .withId("message-1")
        .withText("Test message")
        .publishedAt(new Date("2023-01-19T19:00:00.000Z"))
        .build()
    );
    const expectedMessage = await prismaClient.message.findUnique({
      where: { id: "message-1" },
    });
    expect(expectedMessage).toEqual({
      id: "message-1",
      authorId: "Alice",
      text: "Test message",
      publishedAt: new Date("2023-01-19T19:00:00.000Z"),
    });
  });

  test("save should update an existing message", async () => {
    const repository = new PrismaMessageRepository(prismaClient);

    const aliceMessageBuilder = messageBuilder()
      .authoredBy("Alice")
      .withId("message-1")
      .withText("Test message")
      .publishedAt(new Date("2023-01-19T19:00:00.000Z"));
    await repository.save(aliceMessageBuilder.build());
    await repository.save(
      aliceMessageBuilder.withText("Updated message").build()
    );
    const expectedMessage = await prismaClient.message.findUnique({
      where: { id: "message-1" },
    });
    expect(expectedMessage).toEqual({
      id: "message-1",
      authorId: "Alice",
      text: "Updated message",
      publishedAt: new Date("2023-01-19T19:00:00.000Z"),
    });
  });
});
