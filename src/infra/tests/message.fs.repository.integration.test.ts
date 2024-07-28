import fs from "node:fs";
import path from "node:path";
import { messageBuilder } from "../../tests/message.builder";
import { FileSystemMessageRepository } from "../message-repository.fs";

const testMessagePath = path.join(__dirname, "message-test.json");
describe("Filesystem message repository", () => {
  beforeEach(async () => {
    try {
      await fs.promises.writeFile(testMessagePath, JSON.stringify([]));
    } catch (err) {}
  });
  test("should save a message in a file", async () => {
    const repository = new FileSystemMessageRepository(testMessagePath);
    const message = messageBuilder()
      .authoredBy("Alice")
      .withId("message-1")
      .publishedAt(new Date("2023-01-19T19:00:00.000Z"))
      .withText("Test message")
      .build();
    await repository.save(message);
    const messagesData = await fs.promises.readFile(testMessagePath);
    const savedMessage = JSON.parse(messagesData.toString());
    expect(savedMessage).toEqual([
      {
        id: "message-1",
        author: "Alice",
        text: "Test message",
        publishedAt: "2023-01-19T19:00:00.000Z",
      },
    ]);
  });
  test("should save an edited message in a file", async () => {
    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: "message-1",
          author: "Alice",
          text: "Test message",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
      ])
    );
    const repository = new FileSystemMessageRepository(testMessagePath);
    const message = messageBuilder()
      .authoredBy("Alice")
      .withId("message-1")
      .publishedAt(new Date("2023-01-19T19:00:00.000Z"))
      .withText("Test message edited")
      .build();
    await repository.save(message);
    const messagesData = await fs.promises.readFile(testMessagePath);
    const savedMessage = JSON.parse(messagesData.toString());
    expect(savedMessage).toEqual([
      {
        id: "message-1",
        author: "Alice",
        text: "Test message edited",
        publishedAt: "2023-01-19T19:00:00.000Z",
      },
    ]);
  });
  test("should get a message from a file", async () => {
    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: "message-1",
          author: "Alice",
          text: "Test message",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
        {
          id: "message-2",
          author: "Bob",
          text: "Test message from Bob",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
      ])
    );
    const repository = new FileSystemMessageRepository(testMessagePath);
    const bobMessage = await repository.getById("message-2");
    expect(bobMessage).toEqual(
      messageBuilder()
        .authoredBy("Bob")
        .withId("message-2")
        .publishedAt(new Date("2023-01-19T19:00:00.000Z"))
        .withText("Test message from Bob")
        .build()
    );
  });
  test("should get all messages from a user", async () => {
    await fs.promises.writeFile(
      testMessagePath,
      JSON.stringify([
        {
          id: "message-1",
          author: "Alice",
          text: "Test message",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
        {
          id: "message-2",
          author: "Bob",
          text: "Test message from Bob",
          publishedAt: "2023-01-19T19:00:00.000Z",
        },
        {
          id: "message-3",
          author: "Alice",
          text: "Test message 2",
          publishedAt: "2023-01-19T19:02:00.000Z",
        },
        {
          id: "message-4",
          author: "Alice",
          text: "Test message 3",
          publishedAt: "2023-01-19T19:03:00.000Z",
        },
      ])
    );
    const repository = new FileSystemMessageRepository(testMessagePath);
    const aliceMessages = await repository.getAllOfUser("Alice");
    expect(aliceMessages).toHaveLength(3);
    expect(aliceMessages).toEqual([
      messageBuilder()
        .authoredBy("Alice")
        .withId("message-1")
        .publishedAt(new Date("2023-01-19T19:00:00.000Z"))
        .withText("Test message")
        .build(),
      messageBuilder()
        .authoredBy("Alice")
        .withId("message-3")
        .publishedAt(new Date("2023-01-19T19:02:00.000Z"))
        .withText("Test message 2")
        .build(),
      messageBuilder()
        .authoredBy("Alice")
        .withId("message-4")
        .publishedAt(new Date("2023-01-19T19:03:00.000Z"))
        .withText("Test message 3")
        .build(),
    ]);
  });
});
