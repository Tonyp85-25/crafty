/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	watchPathIgnorePatterns: [
		"<rootDir>/node_modules/",
		"<rootDir>/src/infra/tests/*.json",
	],
};
