import { Socket } from "socket.io";
import type { Packet } from "./packets/Packet";

export type RequestService<T extends Packet> = (socket: Socket, packet: T) => void;