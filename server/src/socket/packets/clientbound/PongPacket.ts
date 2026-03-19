import type { Packet } from "../Packet";

// temporary
export class PongPacket implements Packet
{
  constructor(readonly content: string) {}
}