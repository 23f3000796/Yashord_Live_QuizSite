import { describe, expect, it } from "vitest";
import { isAcceptedAnswer, normalizeAnswer, wordCount } from "./textAnswer";

describe("normalizeAnswer", () => {
  it("ignores case, spaces, punctuation and accents", () => {
    expect(normalizeAnswer("  Air-Cannon! ")).toBe("aircannon");
    expect(normalizeAnswer("AIR CANNON")).toBe("aircannon");
    expect(normalizeAnswer("Huáwei")).toBe("huawei");
  });
  it("drops filler words", () => {
    expect(normalizeAnswer("the Adobe logo")).toBe("adobe");
  });
});

describe("isAcceptedAnswer", () => {
  it("accepts the main answer in any casing or spacing", () => {
    expect(isAcceptedAnswer("air cannon", "Air cannon")).toBe(true);
    expect(isAcceptedAnswer("AirCannon", "Air cannon")).toBe(true);
    expect(isAcceptedAnswer("Slack", "Slack")).toBe(true);
  });

  it("forgives small typos on longer names", () => {
    expect(isAcceptedAnswer("Huawai", "Huawei")).toBe(true);
    expect(isAcceptedAnswer("grammerly", "Grammarly")).toBe(true);
    expect(isAcceptedAnswer("projecter", "Projector")).toBe(true);
    expect(isAcceptedAnswer("air canon", "Air cannon")).toBe(true);
  });

  it("is exact on short names, so a different short word can't slip through", () => {
    expect(isAcceptedAnswer("slick", "Slack")).toBe(true); // 5 letters: 1 typo ok
    expect(isAcceptedAnswer("house", "Mouse")).toBe(true); // same rule
    expect(isAcceptedAnswer("dron", "Drone")).toBe(true);
    expect(isAcceptedAnswer("zip", "Hdd")).toBe(false);
  });

  it("accepts listed alternate names", () => {
    expect(isAcceptedAnswer("Bamboo copter", "Hopter", ["Take-copter", "Bamboo copter"])).toBe(true);
    expect(isAcceptedAnswer("airpods", "Earbud case", ["AirPods", "AirPods case"])).toBe(true);
  });

  it("rejects wrong answers", () => {
    expect(isAcceptedAnswer("Microsoft", "Slack")).toBe(false);
    expect(isAcceptedAnswer("Keyboard", "Mouse")).toBe(false);
    expect(isAcceptedAnswer("Camera", "Projector")).toBe(false);
    expect(isAcceptedAnswer("Teams", "Slack")).toBe(false);
  });

  it("does not score a list of guesses", () => {
    expect(isAcceptedAnswer("mouse drone charger", "Mouse")).toBe(false);
    expect(isAcceptedAnswer("slack or teams", "Slack")).toBe(false);
  });

  it("rejects empty and filler-only input", () => {
    expect(isAcceptedAnswer("", "Slack")).toBe(false);
    expect(isAcceptedAnswer("   ", "Slack")).toBe(false);
    expect(isAcceptedAnswer("the logo", "Slack")).toBe(false);
  });
});

describe("wordCount", () => {
  it("counts words in the main answer", () => {
    expect(wordCount("Hopter")).toBe(1);
    expect(wordCount("Air cannon")).toBe(2);
    expect(wordCount("  Invisible   cape ")).toBe(2);
  });
});
