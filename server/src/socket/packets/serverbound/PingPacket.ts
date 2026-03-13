import type {Packet} from "../Packet.js";

// temporary
export class PingPacket implements Packet {
  constructor(readonly content: string) {}
}