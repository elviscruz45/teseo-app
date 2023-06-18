module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  transform: {
    "\\.(js|jsx|ts|tsx)$": "babel-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!expo-status-bar)/"],
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(js|jsx|ts|tsx)$",
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/setupTests.js",
  ],
};
