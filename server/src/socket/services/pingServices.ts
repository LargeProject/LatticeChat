import type { RequestService } from "./types";
import { PingPacket } from "../packets/serverbound/PingPacket";
import { PongPacket } from "../packets/clientbound/PongPacket";

// temporary
const handlePing: RequestService<PingPacket> = (req) => {
  const socket = req.socket;
  const packet = req.packet;

  console.log(`User ${socket.id} is pinging the server! Additional Content: ${packet.content}`);

  socket.emit('pong', new PongPacket("pong!"));
}

export { handlePing }