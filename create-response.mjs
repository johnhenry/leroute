import { createLouteRoute } from "./create-louteroute.mjs";

export const createResponse = (strings, ...substitutions) =>
  createLouteRoute()(strings, ...substitutions)();

export default createResponse;
