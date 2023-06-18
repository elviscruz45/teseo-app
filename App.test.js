import React from "react";
import { shallow } from "enzyme";
import App from "./App";

describe("App", () => {
  it("renders without crashing", () => {
    shallow(<App />);
  });

  it("contains StatusBar component", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find("StatusBar")).toHaveLength(1);
  });

  it("contains NavigationContainer component", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find("NavigationContainer")).toHaveLength(1);
  });

  it("contains Provider component", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find("Provider")).toHaveLength(1);
  });
});
