import sendResponse from "../lib/utils/sendResponse.js";

export function GET() {
  return sendResponse(404, {}, "Not found");
}
