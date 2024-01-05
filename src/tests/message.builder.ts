import { Message } from "../domain/message";

export const messageBuilder = ({
  id = "message-1",
  author = "Alice",
  text = "Hello World",
  publishedAt = new Date("2023-01-19T19:00:00.000Z"),
}: {
  id?: string;
  author?: string;
  text?: string;
  publishedAt?: Date;
} = {}) => {
  const props = {
    id,
    author,
    text,
    publishedAt,
  };
  return {
    withId(_id: string) {
      return messageBuilder({
        ...props,
        id: _id,
      });
    },
    authoredBy(_author: string) {
      return messageBuilder({
        ...props,
        author: _author,
      });
    },
    withText(_text: string) {
      return messageBuilder({
        ...props,
        text: _text,
      });
    },
    publishedAt(_publishedAt: Date) {
      return messageBuilder({
        ...props,
        publishedAt: _publishedAt,
      });
    },
    build(): Message {
      return Message.fromData(props);
    },
  };
};
