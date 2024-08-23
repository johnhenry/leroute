import { createPhroute } from "./create-phroute.mjs";

export const createResponse = (strings, ...substitutions) =>
  createPhroute()(strings, ...substitutions)();

export default createResponse;
