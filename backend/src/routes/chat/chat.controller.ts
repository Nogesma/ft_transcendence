import { Controller, Get, Post } from "@nestjs/common";
import { ChatService } from "./chat.service.js";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("channels")
  async getUserChannels() {
    return ["admin", "test", "42"];
  }

  @Get("public")
  async getPublicChannels() {
    return ["public", "channels"];
  }

  @Post("join")
  async joinChannel() {
    return true;
  }
}
