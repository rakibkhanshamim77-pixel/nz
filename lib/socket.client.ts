"use client";

import { io, Socket } from "socket.io-client";
import type {
  AdminEmitEvents,
  AdminListenEvents,
  CustomerEmitEvents,
  CustomerListenEvents,
} from "./socket.types";

let adminSocket: Socket<AdminListenEvents, AdminEmitEvents> | null = null;
let customerSocket: Socket<CustomerListenEvents, CustomerEmitEvents> | null = null;

export function getAdminSocket(): Socket<AdminListenEvents, AdminEmitEvents> {
  if (!adminSocket) {
    adminSocket = io("/admin-chat", {
      path: "/api/socketio",
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return adminSocket;
}

export function getCustomerSocket(): Socket<CustomerListenEvents, CustomerEmitEvents> {
  if (!customerSocket) {
    customerSocket = io("/customer-chat", {
      path: "/api/socketio",
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
    });
  }
  return customerSocket;
}

export function disconnectAdminSocket() {
  adminSocket?.disconnect();
  adminSocket = null;
}

export function disconnectCustomerSocket() {
  customerSocket?.disconnect();
  customerSocket = null;
}
