import type { DateProvider } from "../application/date-provider";
import type { TimelinePresenter } from "../application/timeline.presenter";
import type { Timeline, TimelineItem } from "../domain/timeline";
const ONE_MINUTE_IN_MS = 60000;

export class TimelineDefaultPresenter implements TimelinePresenter {
  constructor(private readonly dateProvider: DateProvider) {}
  show(timeline: Timeline): TimelineItem[] {
    const messages = timeline.data;
    return messages.map((m) => ({
      author: m.author,
      text: m.text,
      publicationTime: this.publicationTime(m.publishedAt),
    }));
  }

  private publicationTime(publishedAt: Date): string {
    const now = this.dateProvider.getNow();
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
