import { getCache, RuntimeCache } from "@vercel/functions";
import alasql from "alasql";
import fs from "fs";
import path from "path";
import pickRandomFrom from "./utils/pickRandomFrom.js";

export interface IQuote {
  quote: string;
  author: string;
  tags: string[];
}

export interface IFilterOptions {
  minlength?: number;
  maxlength?: number;
  author?: string;
  tag?: string;
}

const QoDTags = [
  "love",
  "humor",
  "inspirational",
  "philosopy",
  "faith",
  "all",
] as const;

export type QoDTags = (typeof QoDTags)[number];

type QoD = {
  [Tag in QoDTags]: IQuote | null;
} & {
  date: Date | null;
};

function filter(quotes: IQuote[], options: IFilterOptions) {
  const { minlength, maxlength, author, tag } = options;

  const filtered = quotes.filter((quote) => {
    if (
      (minlength || 0) < quote.quote.length &&
      quote.quote.length < (maxlength || 1000) &&
      (author ? quote.author === author : true) &&
      (tag ? quote.tags.includes(tag) : true)
    )
      return true;
    return false;
  });

  return filtered;
}

async function getAll(): Promise<IQuote[]> {
  const cache = getCache();
  const cached: IQuote[] | null = (await cache.get("quotes")) as IQuote[];
  if (cached) {
    return cached;
  }

  const filePath = path.join(process.cwd(), "data/quotes.csv");
  const csv = fs.readFileSync(filePath, "utf8");

  const quotes: IQuote[] = await alasql.promise(
    "SELECT * FROM CSV(?, {separator:'|'})",
    [csv],
  );

  return quotes;
}

async function getRandom(): Promise<IQuote> {
  return pickRandomFrom(await this.GetAll());
}

async function updateQoD(cache: RuntimeCache): Promise<QoD> {
  const qod: QoD = {
    all: null,
    faith: null,
    humor: null,
    inspirational: null,
    love: null,
    philosopy: null,
    date: null,
  };

  for (let tag of QoDTags) {
    let filtered = await getAll();
    if (tag !== "all") filtered = filter(filtered, { tag });
    qod[tag] = pickRandomFrom(filtered) as IQuote;
  }
  qod.date = new Date();

  cache.set("qod", qod);
  return qod;
}

async function getQoD(tag: QoDTags): Promise<IQuote> {
  const cache = getCache();
  let cached: QoD | null = (await cache.get("qod")) as QoD;
  console.log("cached: ", cached);

  if (cached) {
    // If cache exists but the date isn't today, update qod
    if (
      cached.date?.getFullYear() !== new Date().getFullYear() ||
      cached.date?.getMonth() !== new Date().getMonth() ||
      cached.date?.getDate() !== new Date().getDate()
    ) {
      cached = await updateQoD(cache);
    }

    return cached[tag || "all"];
  }

  cached = await updateQoD(cache);
  console.log("updated: ", cached);
  return cached[tag || "all"];
}

export default {
  getAll,
  getRandom,
  getQoD,
};
