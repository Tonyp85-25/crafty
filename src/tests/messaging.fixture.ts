import { EditMessageUseCase } from "../edit-message.usecase";
import { Message } from "../message";
import { InMemoryMessageRepository } from "../message-repository.inmemory";
import {
  PostMessageCommand,
  PostMessageUseCase,
} from "../post-message.usecase";
import { StubDateProvider } from "../stub-date-provider";
import { Timeline } from "../timeline";
import { ViewTimelineUseCase } from "../view-timeline.usecase";

export const createMessagingFixture = () => {
  const dateProvider = new StubDateProvider();
  const messageRepository = new InMemoryMessageRepository();
  const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
  );
  const editMessageUseCase= new EditMessageUseCase(messageRepository)
  const viewTimelineUseCase = new ViewTimelineUseCase(
    messageRepository,
    dateProvider
  );
  let thrownError: Error;
  let timeline: Timeline;

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
    thenMessageShouldBe(expectedMessage: Message) {
      expect(expectedMessage).toEqual(
        messageRepository.getMessageById(expectedMessage.id)
      );
    },
    thenErrorShouldBe(expectedErrorClass: new () => Error) {
      expect(thrownError).toBeInstanceOf(expectedErrorClass);
    },
    async whenUserSeesTimelineOf(user: string) {
      timeline = await viewTimelineUseCase.handle({ user });
    },
    thenUserShouldSee(_timeline: Timeline) {
      expect(timeline).toEqual(_timeline);
    },
  };
};
// Domain Specific language
export type MessagingFixture = ReturnType<typeof createMessagingFixture>;
