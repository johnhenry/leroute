import { createLeRoute } from "./create-leroute.mjs";

export const createResponse = (strings, ...substitutions) =>
  createLeRoute()(strings, ...substitutions)();

export default createResponse;
