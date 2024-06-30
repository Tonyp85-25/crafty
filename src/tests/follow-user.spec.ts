import {
  createFollowingFixture,
  type FollowingFixture,
} from "./following.fixture";

describe("Feature: following a user", () => {
  let fixture: FollowingFixture;
  beforeEach(() => {
    fixture = createFollowingFixture();
  });
  test("Alice can follow Bob", async () => {
    fixture.givenUserFollowees({
      user: "Alice",
      followees: ["Charlie"],
    });

    await fixture.whenUserFollows({
      user: "Alice",
      userToFollow: "Bob",
    });

    await fixture.thenUserFolloweesAre({
      user: "Alice",
      followees: ["Charlie", "Bob"],
    });
  });
});
