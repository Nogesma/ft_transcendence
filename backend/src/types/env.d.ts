declare global {
  interface EnvironmentVariables {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    REDIRECT_URI: string;
    COOKIE_SECRET: string;
    DB_HOST: string;
    DB_USER: string;
    DB_NAME: string;
    DB_PASSWORD: string;
    AVATAR_UPLOAD_PATH: string;
  }
}

export {};
