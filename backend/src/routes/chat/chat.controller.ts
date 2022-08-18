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

  @Post("is_admin/:name")
  async isadmin(@Param("name") name: string, @Body("chan") chan: string) {
    return this.chatService.is_admin(name, chan);
  }

  @Post("is_muted/:name")
  async ismuted(@Param("name") name: string, @Body("chan") chan: string) {
    return this.chatService.ismuted(name, chan);
  }

  @Post("is_banned/:name")
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
    @MessageBody("public") pub: boolean
  ) {
    if (!name)
      throw new HttpException(
        "Channel needs to have a name",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.createChannel(
      name,
      pub,
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

  @Post("unban/:user")
  async unbanUser(
    @Req() req: AuthenticatedRequest,
    @Param("user") user: string,
    @Body("name") chan: string
  ) {
    if (!user || !chan)
      throw new HttpException(
        "can't have empty parameters",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.unbanUser(req.session.userId, chan, user);
  }

  @Post("unmute/:user")
  async unmuteUser(
    @Req() req: AuthenticatedRequest,
    @Param("user") user: string,
    @Body("name") chan: string
  ) {
    if (!user || !chan)
      throw new HttpException(
        "can't have empty parameters",
        HttpStatus.BAD_REQUEST
      );
    return this.chatService.unmuteUser(req.session.userId, chan, user);
  }

  @Post("add_admin/:user")
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

  @Post("remove_admin/:user")
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
}
