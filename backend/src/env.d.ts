declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly CLIENT_ID: string;
      readonly CLIENT_SECRET: string;
      readonly REDIRECT_URI: string;
      readonly COOKIE_SECRET: string;
      readonly DB_USER: string;
      readonly DB_NAME: string;
      readonly DB_PASSWORD: string;
      readonly AVATAR_UPLOAD_PATH: string;
    }
  }
}

export {};
