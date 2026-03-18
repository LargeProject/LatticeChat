import type {Packet} from "../Packet";

// temporary
export class PingPacket implements Packet {
  constructor(readonly content: string) {}
}