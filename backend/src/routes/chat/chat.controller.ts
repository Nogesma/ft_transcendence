import { Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { MessageBody } from "@nestjs/websockets";
import { Request } from "express";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("channels")
  async getUserChannels(@Req() req: Request) {
    return this.chatService.getJoinedChannels(req.userId);
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
    return this.chatService.joinChannel(name, pub, password, req.userId);
  }

  @Post("create/:name")
  async createChannel(
    @Req() req: Request,
    @Param("name") name: string,
    @MessageBody("password") password: string,
    @MessageBody("public") pub: boolean
  ) {
    return this.chatService.createChannel(name, pub, password, req.userId);
  }
}
