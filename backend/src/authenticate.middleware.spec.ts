import { AuthenticateMiddleware } from "./authenticate.middleware.js";

describe("AuthenticateMiddleware", () => {
  it("should be defined", () => {
    expect(new AuthenticateMiddleware()).toBeDefined();
  });
});
