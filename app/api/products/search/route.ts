/**
 * 商品検索APIルート
 * GET /api/products/search?q={query}&store={store}
 *
 * store パラメータ: "woolworths" | "paknsave" | "newworld" | 未指定（全店）
 * 結果はインメモリキャッシュで1時間保持する
 */

import { NextRequest } from "next/server";
import type { SupermarketProduct, StoreResults } from "@/app/lib/scraper";
import {
  searchWoolworths,
  searchPaknsave,
  searchNewworld,
  searchAllStores,
} from "@/app/lib/scraper";

/** キャッシュエントリー */
type CacheEntry = {
  data: SupermarketProduct[] | StoreResults;
  expiresAt: number;
};

/** インメモリキャッシュ（サーバーサイドシングルトン） */
const cache = new Map<string, CacheEntry>();

const CACHE_TTL_MS = 60 * 60 * 1000; // 1時間

function getCacheKey(query: string, store: string): string {
  return `${store}:${query.toLowerCase().trim()}`;
}

function getFromCache(key: string): CacheEntry["data"] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: CacheEntry["data"]): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const store = searchParams.get("store") ?? "all";

  if (!query) {
    return Response.json(
      { error: { code: "MISSING_QUERY", message: "クエリパラメータ q が必要です" } },
      { status: 400 }
    );
  }

  const cacheKey = getCacheKey(query, store);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return Response.json({ data: cached, cached: true });
  }

  try {
    let data: SupermarketProduct[] | StoreResults;

    switch (store) {
      case "woolworths":
        data = await searchWoolworths(query);
        break;
      case "paknsave":
        data = await searchPaknsave(query);
        break;
      case "newworld":
        data = await searchNewworld(query);
        break;
      default:
        data = await searchAllStores(query);
        break;
    }

    setCache(cacheKey, data);
    return Response.json({ data, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return Response.json(
      { error: { code: "SCRAPE_ERROR", message } },
      { status: 502 }
    );
  }
}
