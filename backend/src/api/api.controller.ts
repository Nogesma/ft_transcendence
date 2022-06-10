import { Controller, Get, HttpStatus, Req, Res } from "@nestjs/common";

@Controller("api")
export class ApiController {
  @Get("me")
  async getUserData(@Req() request, @Res() response) {
    const uid = request?.uid;

    if (uid === null) response.status(HttpStatus.UNAUTHORIZED).end();

    const { username, displayname } = getUser(uid);

    response.end(JSON.stringify({ username, displayname }));
  }
}

// todo: actually fetch db to get username, displayname
const getUser = (id) => {
  id;
  return {
    username: "msegrans",
    displayname: "Mano Ségransan",
  };
};
