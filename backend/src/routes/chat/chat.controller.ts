import { Controller, Get, Post } from "@nestjs/common";
import { ChatService } from "./chat.service.js";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("channels")
  async getUserChannels() {
    return [
      { name: "42", id: 1 },
      { name: "Hello", id: 2 },
    ];
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
