import { AuthenticateMiddleware } from './authenticate.middleware';

describe('AuthenticateMiddleware', () => {
  it('should be defined', () => {
    expect(new AuthenticateMiddleware()).toBeDefined();
  });
});
