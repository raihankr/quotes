import { getReasonPhrase } from "http-status-codes";
import IResponse from "../types/IResponse.js";

export default function sendResponse(
  statusCode: number,
  data: Record<string, any>,
  message?: string,
): Response {
  const body: IResponse = {
    status: statusCode < 400 ? "success" : "error",
    data,
    message,
  };

  return new Response(JSON.stringify(body), {
    status: statusCode,
    statusText: getReasonPhrase(statusCode),
    headers: {
      "content-type": "application/json",
    },
  });
}
