import type {
  Followee,
  FolloweeRepository,
} from "../application/followee.repository";

export class InMemoryFolloweeRepository implements FolloweeRepository {
  followeesByUser = new Map<string, string[]>();
  givenExistingFollowees(followees: Followee[]) {
    followees.forEach((f) => this.addFollowee(f));
  }

  async saveFollowee(followee: Followee): Promise<void> {
    this.addFollowee(followee);
    return Promise.resolve();
  }

  private addFollowee(f: Followee): void {
    const followees = this.followeesByUser.get(f.user) ?? [];
    followees.push(f.followee);
    this.followeesByUser.set(f.user, followees);
  }

  async getFolloweesOf(user: string) {
    return Promise.resolve(this.followeesByUser.get(user) ?? []);
  }
}
