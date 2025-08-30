import { next } from "@vercel/functions";

export const config = {
  runtime: "nodejs",
};

export default function middleware() {
  return next({
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "X-Requested-With",
    },
  });
}
