import quotes, { QoDTags } from "../../lib/quotes.js";
import sendResponse from "../../lib/utils/sendResponse.js";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    // The tag would be the last segment if it exists, e.g., /api/v1/qod/love -> ["", "api", "v1", "qod", "love"]
    // If the path is /api/v1/qod, the last segment would be "qod"
    // We need to check if there's a segment after "qod"
    let tag: QoDTags = "all";
    const qodIndex = pathSegments.indexOf("qod");
    if (qodIndex !== -1 && qodIndex + 1 < pathSegments.length) {
      tag = (pathSegments[qodIndex + 1] as QoDTags) || tag;
    }

    // Ensure tag is one of the allowed QoDTags, otherwise default to "all"
    // For simplicity, I'll rely on getQoD's internal handling of invalid tags,
    // which defaults to "all" if the tag is not found in cached.
    // However, the problem statement implies the tag parameter is directly used.
    // Let's stick to the problem statement: if tag is empty/not passed, tag should be all.
    // The current logic already handles this by initializing tag to "all".

    const quote = await quotes.getQoD(tag); // Cast to any because QoDTags is a const array type, and tag might be a string

    if (!quote) {
      return sendResponse(404, {}, `Quote not found for the tag "${tag}"`);
    }

    return sendResponse(200, { quote });
  } catch (error: any) {
    console.error("Error in QoD handler:", error);
    return sendResponse(500, {}, error.message || "Internal Server Error");
  }
}
