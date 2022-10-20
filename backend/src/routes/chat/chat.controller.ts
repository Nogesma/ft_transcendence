import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { MessageBody } from "@nestjs/websockets";
import type { AuthenticatedRequest } from "../../types/http.js";
import { isNil } from "ramda";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("channels")
  async getUserChannels(@Req() req: AuthenticatedRequest) {
    if (!req) return;
    const user = await req.session.$get("user");
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.chatService.getJoinedChannels(user);
  }

  @Get("public")
  async getPublicChannels() {
    return this.chatService.getPublicChannels();
  }

  @Get("isAdmin/:chan")
  async isadmin(@Req() req: AuthenticatedRequest, @Param("chan") chan: string) {
    if (isNil(chan))
      throw new HttpException("channel is nil", HttpStatus.BAD_REQUEST);

    return this.chatService.is_admin(req.session.userId, chan);
  }

  @Get("admins/:chan")
  async getAdmins(
    @Req() req: AuthenticatedRequest,
    @Param("chan") chan: string
  ) {
    if (isNil(chan))
      throw new HttpException("channel is nil", HttpStatus.BAD_REQUEST);
    return this.chatService.getAdmins(req.session.userId, chan);
  }

  @Get("muted/:chan")
  async getMuted(
    @Req() req: AuthenticatedRequest,
    @Param("chan") chan: string
  ) {
    if (isNil(chan))
      throw new HttpException("channel is nil", HttpStatus.BAD_REQUEST);
    return this.chatService.getMuted(req.session.userId, chan);
  }

  @Get("bans/:chan")
  async getBans(@Req() req: AuthenticatedRequest, @Param("chan") chan: string) {
    if (isNil(chan))
      throw new HttpException("channel is nil", HttpStatus.BAD_REQUEST);
    return this.chatService.getBans(req.session.userId, chan);
  }

  @Post("isMuted/:name")
  async ismuted(@Param("name") name: string, @Body("chan") chan: string) {
    return this.chatService.ismuted(name, chan);
  }

  @Post("isBanned/:name")
  async isbanned(@Param("name") name: string, @Body("chan") chan: string) {
    return this.chatService.isBanned(name, chan);
  }

  @Post("join/:name")
  async joinChannel(
    @Req() req: AuthenticatedRequest,
    @Param("name") name: string,
    @MessageBody("password") password: string,
    @MessageBody("public") pub: boolean
  ) {
    if (!name)
      throw new HttpException(
        "Channel needs to have a name",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.joinChannel(
      name,
      pub,
      password,
      req.session.userId
    );
  }

  @Post("leave/:name")
  async leaveChannel(
    @Req() req: AuthenticatedRequest,
    @Param("name") name: string
  ) {
    if (!name)
      throw new HttpException(
        "Channel needs to have a name",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.leaveChannel(name, req.session.userId);
  }

  @Post("create/:name")
  async createChannel(
    @Req() req: AuthenticatedRequest,
    @Param("name") name: string,
    @MessageBody("password") password: string,
    @MessageBody("type") type: number
  ) {
    if (!name || isNaN(type))
      throw new HttpException(
        "Channel needs to have a name",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.createChannel(
      name,
      type,
      password,
      req.session.userId
    );
  }

  @Post("delete/:name")
  async deleteChannel(
    @Req() req: AuthenticatedRequest,
    @Param("name") name: string
  ) {
    if (!name)
      throw new HttpException(
        "Channel needs to have a name",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.deleteChannel(name, req.session.userId);
  }

  @Post("addAdmin/:user")
  async addAdmin(
    @Req() req: AuthenticatedRequest,
    @Param("user") user: string,
    @Body("chan") chan: string
  ) {
    if (!user || !chan)
      throw new HttpException(
        "can't have empty parameters",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.addAdmin(req.session.userId, chan, user);
  }

  @Post("removeAdmin/:user")
  async removeAdmin(
    @Req() req: AuthenticatedRequest,
    @Param("user") user: string,
    @Body("chan") chan: string
  ) {
    if (!user || !chan)
      throw new HttpException(
        "can't have empty parameters",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.removeAdmin(req.session.userId, chan, user);
  }

  @Get("perms/:id/:chan")
  async getPerms(
    @Req() req: AuthenticatedRequest,
    @Param("chan") chan: string,
    @Param("id") id: number
  ) {
    if (!id || isNaN(id))
      throw new HttpException("id is not valid", HttpStatus.BAD_REQUEST);
    return this.chatService.getPerms(req.session.userId, chan, id);
  }

  @Post("changeOwner/:chan/:newOwner")
  async changeOwner(
    @Req() req: AuthenticatedRequest,
    @Param("chan") chan: string,
    @Param("newOwner") newOwner: number
  ) {
    if (!chan || !newOwner || isNaN(newOwner))
      throw new HttpException(
        "can't have empty parameters",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.changeOwner(req.session.userId, chan, newOwner);
  }

  @Get("type/:chan")
  async getType(@Req() req: AuthenticatedRequest, @Param("chan") chan: string) {
    if (!chan)
      throw new HttpException(
        "can't have empty parameters",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.getType(chan);
  }

  @Post("type/:chan")
  async changeType(
    @Req() req: AuthenticatedRequest,
    @Param("chan") chan: string,
    @Body("type") type: number,
    @Body("password") password: string
  ) {
    if (!chan || isNaN(type))
      throw new HttpException(
        "can't have empty parameters",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.changeType(
      req.session.userId,
      chan,
      type,
      password
    );
  }

  @Post("add/:chan/:id")
  async addUser(
    @Req() req: AuthenticatedRequest,
    @Param("chan") chan: string,
    @Param("id") id: number
  ) {
    if (!chan || isNaN(id))
      throw new HttpException(
        "can't have empty parameters",
        HttpStatus.BAD_REQUEST
      );

    return this.chatService.addUser(req.session.userId, chan, id);
  }
}
