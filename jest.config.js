module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  transform: {
    "\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(js|jsx|ts|tsx)$",
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
};
