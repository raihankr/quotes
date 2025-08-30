import quotes from "../../lib/quotes.js";
import sendResponse from "../../lib/utils/sendResponse.js";

export async function GET() {
  return sendResponse(200, await quotes.getRandom());
}
