import { EditMessageUseCase } from "../application/usecases/edit-message.usecase";
import {
  PostMessageUseCase,
  type PostMessageCommand,
} from "../application/usecases/post-message.usecase";
import { ViewTimelineUseCase } from "../application/usecases/view-timeline.usecase";
import type { Message } from "../domain/message";
import type { TimelineItem } from "../domain/timeline";
import { InMemoryMessageRepository } from "../infra/message-repository.inmemory";
import { StubDateProvider } from "../infra/stub-date-provider";

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  const editMessageUseCase = new EditMessageUseCase(messageRepository);
  const viewTimelineUseCase = new ViewTimelineUseCase(
    messageRepository,
    dateProvider
  );
  let thrownError: Error;
  let timeline: TimelineItem[];

  return {
    givenNowIs(_now: Date) {
      dateProvider.now = _now;
    },
    givenTheFollowingMessagesExist(messages: Message[]) {
      messageRepository.givenExistingMessages(messages);
    },
    async whenUserPostsAMessage(postMessageCommand: PostMessageCommand) {
      try {
        await postMessageUseCase.handle(postMessageCommand);
      } catch (err: any) {
        thrownError = err;
      }
    },
    async whenUserEditsMessage(editMessageCommand: {
      messageId: string;
      text: string;
    }) {
      try {
        await editMessageUseCase.handle(editMessageCommand);
      } catch (err: any) {
        thrownError = err;
      }
    },
    async thenMessageShouldBe(expectedMessage: Message) {
      const message = await messageRepository.getById(expectedMessage.id);
      expect(message).toEqual(expectedMessage);
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    },
    async whenUserSeesTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
    },
    thenUserShouldSee(_timeline: TimelineItem[]) {
      expect(timeline).toEqual(_timeline);
    },
    messageRepository,
  };
};
// Domain Specific language
export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
