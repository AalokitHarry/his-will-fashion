import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_FILE = path.join(__dirname, "..", "data", "orders.json");

function readOrders() {
  if (!existsSync(ORDERS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(ORDERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  const orders = readOrders();
  orders.push(order);
  writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export function listOrders() {
  return readOrders();
}
