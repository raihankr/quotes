import express from "express";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import readJSONL from "./src/utils/read-jsonl.js";
import cors from "./src/utils/cors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const DATASET = path.resolve(__dirname, "src/datasets/quotes.jsonl");
const quotes = readJSONL(DATASET);

function filter(data, opt) {
  const { minlength, maxlength, author, tag } = opt;

  const filtered = data.filter((item) => {
    if (
      (minlength || 0) < item.quote.length &&
      item.quote.length < (maxlength || 1000) &&
      (author ? item.author === author : true) &&
      (tag ? item.tags.includes(tag) : true)
    )
      return true;
    return false;
  });

  return filtered;
}

function pickRandomFrom(data) {
  const randIdx = Math.floor(Math.random() * data.length);
  return data[randIdx];
}

const qod = {
  love: "",
  inspirational: "",
  life: "",
  humor: "",
  books: "",
  all: "",
  date: new Date(),
};

function updateQOD() {
  "all,love,inspirational,life,humor,books".split(",").forEach((tag) => {
    let filtered = quotes;
    if (tag !== "all") filtered = filter(quotes, { tag });
    qod[tag] = pickRandomFrom(filtered);
  });
  qod.date = new Date();
}
updateQOD();

function sendResponse(res, code, data) {
  const status =
    {
      200: "OK",
      404: "Not Found",
      500: "Internal Server Error",
    }[code] || code;

  res.json({
    code,
    status,
    data: code > 300 ? {} : data,
  });
}

const authors = new Set();
const tags = new Set();

quotes.forEach((item) => {
  authors.add(item.author);
  item.tags.forEach((tag) => tags.add(tag));
});

app.use(cors);

app.get("/", (_req, res) => {
  res.redirect(303, "/docs");
});

app.get("/api/authors", (_req, res) => {
  sendResponse(res, 200, Array.from(authors));
});

app.get("/api/tags", (_req, res) => {
  sendResponse(res, 200, Array.from(tags));
});

app.get("/api/tags/popularity", (_req, res) => {
  const quotesCount = {};
  quotes.forEach((quote) =>
    quote.tags.forEach((tag) => {
      quotesCount[tag] = quotesCount[tag] ? quotesCount[tag] + 1 : 1;
    }),
  );
  sendResponse(
    res,
    200,
    Object.entries(quotesCount).sort((a, b) => b[1] - a[1]),
  );
});

app.get("/api/random", (req, res) => {
  const filtered = filter(quotes, req.query);
  sendResponse(res, 200, pickRandomFrom(filtered) || {});
});

app.get("/api/qod/:tag?", (req, res) => {
  // Update quotes of the day when day changes
  if (
    qod.date.getFullYear() !== new Date().getFullYear() ||
    qod.date.getMonth() !== new Date().getMonth() ||
    qod.date.getDate() !== new Date().getDate()
  )
    updateQOD();

  const { quote, author, tags } = qod[req.params.tag || "all"] || {};
  if (!quote) return sendResponse(res, 404);

  const data = {
    title:
      {
        all: "Quotes of the day",
        love: "Quotes of the day about love",
        inspirational: "Inspirational quotes of the day",
        life: "Quotes of the day about life",
        humor: "Humor quotes of the day",
        books: "Quotes of the day about books",
      }[req.params.tag || "all"] || "",
    quote,
    author,
    tags,
  };

  return sendResponse(res, 200, data);
});

function searchQuotesBy(category, query) {
  const result = [];

  result.push(
    ...quotes.filter((item) =>
      item[category] instanceof Array
        ? item[category].toString().match(new RegExp(query, "i"))
        : item[category].match(new RegExp(query, "i")),
    ),
  );

  return result;
}

app.get("/api/search(/quotes?)?/:quote", (req, res) => {
  let result = searchQuotesBy("quote", req.params.quote);

  result = filter(result, req.query);

  return result.length === 0
    ? sendResponse(res, 404)
    : sendResponse(res, 200, result);
});

app.get("/api/search/author/:author", (req, res) => {
  let result = searchQuotesBy("author", req.params.author);

  result = filter(result, req.query);

  return result.length === 0
    ? sendResponse(res, 404)
    : sendResponse(res, 200, result);
});

app.get("/api/search/tag/:tag", (req, res) => {
  let result = searchQuotesBy("tags", req.params.tag);

  result = filter(result, req.query);

  return result.length === 0
    ? sendResponse(res, 404)
    : sendResponse(res, 200, result);
});

app.use(/^\/(help|docs)/, (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../README.html"));
});

// eslint-disable-next-line no-unused-vars
app.use((_req, res, _next) => sendResponse(res, 404));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  sendResponse(res, 500);
  console.log(err);
});

try {
  app.listen(PORT, () => {
    console.log("\x1b[33m%s\x1b[0m", `Server running on port: ${PORT}`);
  });
} catch (err) {
  console.error("error");
}

export default app;
