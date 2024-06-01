import {
  Followee,
  FolloweeRepository,
} from "../application/followee.repository";

export class InMemoryFolloweeRepository implements FolloweeRepository {
  givenExistingFollowees(followees: Followee[]) {
    followees.forEach((f) => this.addFollowee(f));
  }

  followeesByUser = new Map<string, string[]>();
  saveFollowee(followee: Followee): Promise<void> {
    this.addFollowee(followee);
    return Promise.resolve();
  }

  private addFollowee(f: Followee): void {
    const followees = this.followeesByUser.get(f.user) ?? [];
    followees.push(f.followee);
    this.followeesByUser.set(f.user, followees);
  }

  getFolloweesOf(user: string) {
    return this.followeesByUser.get(user) ?? [];
  }
}
