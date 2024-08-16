import type { Message } from "./message";

export type TimelineItem = {
  author: string;
  text: string;
  publicationTime: string;
};

export class Timeline {
  constructor(private readonly messages: Message[]) {}

  get data() {
    this.messages.sort(
      (msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime()
    );
    return this.messages.map((m) => m.data);
  }
}
