import * as fs from "node:fs";
import * as path from "node:path";
import type {
  Followee,
  FolloweeRepository,
} from "../application/followee.repository";

export class FileSystemFolloweeRepository implements FolloweeRepository {
  constructor(
    private readonly followeesPath = path.join(__dirname, "./followees.json")
  ) {}
  followeesByUser = new Map<string, string[]>();
  // givenExistingFollowees(followees: Followee[]) {
  //   followees.forEach((f) => this.addFollowee(f));
  // }

  async saveFollowee(followee: Followee): Promise<void> {
    const followees = await this.getFollowees();
    const existingFollowees = followees[followee.user] ?? [];
    existingFollowees.push(followee.followee);
    followees[followee.user] = existingFollowees;

    return fs.promises.writeFile(this.followeesPath, JSON.stringify(followees));
  }

  // private addFollowee(f: Followee): void {
  //   const followees = this.followeesByUser.get(f.user) ?? [];
  //   followees.push(f.followee);
  //   this.followeesByUser.set(f.user, followees);
  // }
  async getFolloweesOf(user: string): Promise<string[]> {
    const allFollowees = await this.getFollowees();
    return allFollowees[user] ?? [];
  }

  private async getFollowees() {
    const data = await fs.promises.readFile(this.followeesPath, "utf-8");
    return JSON.parse(data.toString());
  }
}
