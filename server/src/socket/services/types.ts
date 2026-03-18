import { Socket } from "socket.io";
import type { Packet } from "../packets/Packet";

export type RequestService<T extends Packet> = (request: ClientRequest<T>) => void;

export class ClientRequest<T extends Packet>
{
  constructor(readonly socket: Socket, readonly packet: T) {}
}