import type { Timeline } from "../domain/timeline";

export interface TimelinePresenter {
  show(timeline: Timeline): void;
}
