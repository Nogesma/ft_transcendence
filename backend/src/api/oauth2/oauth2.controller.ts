import { Controller, HttpStatus, Param, Post, Res } from "@nestjs/common";
import fetch, { FormData } from "node-fetch";
import { nanoid } from "nanoid";

@Controller("api/oauth2")
export class Oauth2Controller {
  @Post(":code/:state")
  async addUser(@Param() params, @Res() response) {
    const data = new FormData();
    data.set("redirect_uri", process.env.REDIRECT_URI);
    data.set("client_id", process.env.CLIENT_ID);
    data.set("client_secret", process.env.CLIENT_SECRET);
    data.set("grant_type", "authorization_code");
    data.set("code", params.code);
    data.set("state", params.state);

    const tokenResponse = await getOauthToken<{
      access_token: string;
      refresh_token: string;
    }>(data);

    if (tokenResponse === null) response.end(HttpStatus.UNAUTHORIZED);

    const { access_token } = tokenResponse;

    const userData = await getUserData<{
      id: number;
      login: string;
      displayname: string;
      image_url: string;
    }>(access_token);

    if (userData === null) response.end(HttpStatus.UNAUTHORIZED);

    const token = createAuthenticateUser(userData);

    response.end(
      JSON.stringify({
        sessionToken: token,
      })
    );
  }
}

function getOauthToken<T>(body): Promise<T> | null {
  return fetch("https://api.intra.42.fr/oauth/token", {
    method: "POST",
    body,
  }).then((res) => {
    if (res.ok) return res.json() as Promise<T>;
    return null;
  });
}

function getUserData<T>(token): Promise<T> | null {
  return fetch("https://api.intra.42.fr/v2/me", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (res.ok) return res.json() as Promise<T>;
    return null;
  });
}

const createAuthenticateUser = ({ id, login, displayname, image_url }) => {
  id;
  login;
  displayname;
  image_url;
  // todo create user if not exist, add nanoid to session token table
  return nanoid();
};
