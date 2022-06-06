import { Controller, HttpStatus, Req, Get, Res } from "@nestjs/common";

@Controller("api")
export class ApiController {
  @Get("me")
  async getUserData(@Req() request, @Res() response) {
    const uid = authenticate(request?.headers?.authorization);

    if (uid === null) response.status(HttpStatus.UNAUTHORIZED).end();

    const { username, displayname } = getUser(uid);

    response.end(JSON.stringify({ username, displayname }));
  }
}

const authenticate = (authorization) => {
  if (
    authorization === undefined ||
    authorization === null ||
    !authorization.startsWith("Bearer")
  )
    return null;

  const token = authorization.substring(7, authorization.length);

  return getUserByToken(token);
};

// todo: actually get the user id by fetching the session db
const getUserByToken = (token) => {
  if (token === "abc") return 123;

  return null;
};

// todo: actually fetch db to get username, displayname
const getUser = (id) => {
  return {
    username: "msegrans",
    displayname: "Mano Ségransan",
  };
};
