export class Message {
  constructor(
    private readonly _id: string,
    private _text: MessageText,
    private readonly _author: string,
    private readonly _publishedAt: Date
  ) {}

  get id(): string {
    return this._id;
  }
  get text(): string {
    return this._text.value;
  }

  editText(text: string) {
    this._text = MessageText.of(text);
  }
  get author(): string {
    return this._author;
  }
  get publishedAt(): Date {
    return this._publishedAt;
  }
  get data() {
    return {
      id: this.id,
      text: this.text,
      author: this.author,
      publishedAt: this.publishedAt,
    };
  }

  static fromData(data: Message["data"]) {
    return new Message(
      data.id,
      MessageText.of(data.text),
      data.author,
      data.publishedAt
    );
  }
}

export class MessageTooLongError extends Error {}

export class EmptyMessageError extends Error {}

export class MessageText {
  private constructor(readonly value: string) {}

  static of(text: string) {
    if (text.length > 280) {
      throw new MessageTooLongError();
    }
    if (text.trim().length === 0) {
      throw new EmptyMessageError();
    }
    return new MessageText(text);
  }
}
