import { Controller, Get, HttpStatus, Req, Res } from "@nestjs/common";

@Controller("api")
export class ApiController {
  @Get("me")
  async getUserData(@Req() request, @Res() response) {
    const uid = request?.uid;

    if (uid === null) response.status(HttpStatus.UNAUTHORIZED).end();

    const { username, displayname, image_url } = getUser(uid);

    response.end(JSON.stringify({ username, displayname, image_url }));
  }
}

// todo: actually fetch db to get username, displayname
const getUser = (id) => {
  id;
  return {
    username: "msegrans",
    displayname: "Mano Ségransan",
    image_url: "https://cdn.intra.42.fr/users/msegrans.jpg",
  };
};
