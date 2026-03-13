import type {Packet} from "../Packet.js";

// temporary
export class PongPacket implements Packet {
  constructor(readonly content: string) {}
}