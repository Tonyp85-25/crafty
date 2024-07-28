import * as fs from "node:fs";
import path from "node:path";
import { FileSystemFolloweeRepository } from "../followee.fs.repository";

const testFolloweesPath = path.join(__dirname, "./test-followees.json");

describe("Filesystem followee repository", () => {
  beforeEach(async () => {
    await fs.promises.writeFile(testFolloweesPath, JSON.stringify({}));
  });

  test("should save a followee in a file", async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweesPath
    );

    await fs.promises.writeFile(
      testFolloweesPath,
      JSON.stringify({ Alice: ["Bob"], Bob: ["Charlie"] })
    );

    await followeeRepository.saveFollowee({
      user: "Alice",
      followee: "Charlie",
    });

    const followeesData = await fs.promises.readFile(testFolloweesPath);
    const followees = JSON.parse(followeesData.toString());
    expect(followees).toEqual({
      Alice: ["Bob", "Charlie"],
      Bob: ["Charlie"],
    });
  });

  test("should get all followees of a user", async () => {
    const followeeRepository = new FileSystemFolloweeRepository(
      testFolloweesPath
    );
    await fs.promises.writeFile(
      testFolloweesPath,
      JSON.stringify({ Alice: ["Bob", "Charlie"], Bob: ["Charlie"] })
    );
    const [aliceFollowees, bobFollowees] = await Promise.all([
      followeeRepository.getFolloweesOf("Alice"),
      followeeRepository.getFolloweesOf("Bob"),
    ]);

    expect(aliceFollowees).toEqual(["Bob", "Charlie"]);
    expect(bobFollowees).toEqual(["Charlie"]);
  });
});
