import type { Message } from "./message";

const ONE_MINUTE_IN_MS = 60000;
export type TimelineItem = {
  author: string;
  text: string;
  publicationTime: string;
};

export class Timeline {
  constructor(
    private readonly messages: Message[],
    private readonly now: Date
  ) {}

  get data() {
    this.messages.sort(
      (msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime()
    );
    return this.messages.map((m) => ({
      author: m.author,
      text: m.text,
      publicationTime: this.publicationTime(m.publishedAt),
    }));
  }

  private publicationTime(publishedAt: Date): string {
    const now = this.now;
    const diff = now.getTime() - publishedAt.getTime();
    const minuteNumber = Math.floor(diff / ONE_MINUTE_IN_MS);
    if (minuteNumber < 1) {
      return "Less than a minute ago";
    }
    if (minuteNumber < 2) {
      return "1 minute ago";
    }

    return `${minuteNumber} minutes ago`;
  }
}
