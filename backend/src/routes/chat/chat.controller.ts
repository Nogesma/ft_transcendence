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
import { Request } from "express";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("channels")
  async getUserChannels(@Req() req: Request) {
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

  @Post("join/:name")
  async joinChannel(
    @Req() req: Request,
    @Param("name") name: string,
    @MessageBody("password") password: string,
    @MessageBody("public") pub: boolean
  ) {
    return this.chatService.joinChannel(
      name,
      pub,
      password,
      req.session.userId
    );
  }

  @Post("leave/:name")
  async leaveChannel(@Req() req: Request, @Param("name") name: string) {
    return this.chatService.leaveChannel(name, req.session.userId);
  }

  @Post("create/:name")
  async createChannel(
    @Req() req: Request,
    @Param("name") name: string,
    @MessageBody("password") password: string,
    @MessageBody("public") pub: boolean
  ) {
    return this.chatService.createChannel(
      name,
      pub,
      password,
      req.session.userId
    );
  }
  @Post("delete/:name")
  async deleteChannel(@Req() req: Request, @Param("name") name: string) {
    return this.chatService.deleteChannel(name, req.session.userId);
  }

  @Post("ban/:user")
  async banUser(
    @Req() req: Request,
    @Param("user") user: string,
    @Param("expires") expires: Date,
    @Body("name") name: string
  ) {
    expires = new Date();
    return this.chatService.banUser(req.session.userId, name, user, expires);
  }

  @Post("unban/:user")
  async unbanUser(
    @Req() req: Request,
    @Param("user") user: string,
    @Body("name") chan: string
  ) {
    return this.chatService.unbanUser(req.session.userId, chan, user);
  }

  @Post("mute/:user")
  async muteUser(
    @Req() req: Request,
    @Param("user") user: string,
    @Body("name") name: string,
    @Body("expires") expires: Date
  ) {
    return this.chatService.muteUser(req.session.userId, name, user, expires);
  }

  @Post("unmute/:user")
  async unmuteUser(
    @Req() req: Request,
    @Param("user") user: string,
    @Body("name") chan: string
  ) {
    return this.chatService.unmuteUser(req.session.userId, chan, user);
  }

  @Post("add_admin/:user")
  async addAdmin(
    @Req() req: Request,
    @Param("user") user: string,
    @Body("chan") chan: string
  ) {
    return this.chatService.addAdmin(req.session.userId, chan, user);
  }

  @Post("remove_admin/:user")
  async removeAdmin(
    @Req() req: Request,
    @Param("user") user: string,
    @Body("chan") chan: string
  ) {
    return this.chatService.removeAdmin(req.session.userId, chan, user);
  }
}
