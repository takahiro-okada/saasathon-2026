/**
 * NZスーパーマーケット スクレイピングモジュール
 * Woolworths・Pak'nSave・New World の商品検索APIを叩いて価格データを取得する
 */

export type SupermarketProduct = {
  name: string;
  brand: string;
  price: number; // NZD
  salePrice?: number;
  imageUrl: string;
  inStock: boolean;
  size: string; // 例: "1.5kg"
  unitPrice?: string; // 例: "$1.99/kg"
  store: "paknsave" | "newworld" | "woolworths";
};

export type StoreResults = {
  woolworths: SupermarketProduct[];
  paknsave: SupermarketProduct[];
  newworld: SupermarketProduct[];
  errors: Record<string, string>;
};

/** タイムアウト付きfetch（デフォルト5秒） */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Woolworths NZ の商品検索
 * GET https://www.woolworths.co.nz/api/v1/products?target=search&search={query}&inStockProductsOnly=false&size=10
 */
export async function searchWoolworths(
  query: string
): Promise<SupermarketProduct[]> {
  const url = new URL("https://www.woolworths.co.nz/api/v1/products");
  url.searchParams.set("target", "search");
  url.searchParams.set("search", query);
  url.searchParams.set("inStockProductsOnly", "false");
  url.searchParams.set("size", "10");

  const res = await fetchWithTimeout(url.toString(), {
    headers: {
      "x-requested-with": "OnlineShopping.WebApp",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      accept: "application/json, text/plain, */*",
    },
  });

  if (!res.ok) {
    throw new Error(`Woolworths API error: ${res.status}`);
  }

  const data = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = data?.products?.items ?? [];

  return items.map((item) => {
    const originalPrice: number =
      item.price?.originalPrice ?? item.price?.salePrice ?? 0;
    const salePrice: number | undefined =
      item.price?.salePrice !== originalPrice
        ? item.price?.salePrice
        : undefined;

    return {
      name: item.name ?? "",
      brand: item.brand ?? "",
      price: originalPrice,
      salePrice,
      imageUrl: item.images?.small ?? item.images?.big ?? "",
      inStock: item.stockLevel !== "None" && item.stockLevel !== 0,
      size: item.size?.volumeSize ?? item.size?.weightSize ?? "",
      unitPrice: item.price?.comparePrice
        ? `$${item.price.comparePrice}/${item.price.comparePriceUnit ?? "unit"}`
        : undefined,
      store: "woolworths" as const,
    };
  });
}

// Foodstuffs JWT token cache
let foodstuffsToken: string | null = process.env.FOODSTUFFS_JWT ?? null;
let foodstuffsTokenExpiry = 0;

export function setFoodstuffsToken(token: string, expiresInMs = 25 * 60 * 1000) {
  foodstuffsToken = token;
  foodstuffsTokenExpiry = Date.now() + expiresInMs;
}

const FOODSTUFFS_STORE_ID = "be4c4780-218e-425a-a90f-63e21773572b";

async function searchFoodstuffs(
  domain: string,
  query: string,
  store: "paknsave" | "newworld"
): Promise<SupermarketProduct[]> {
  const token = foodstuffsTokenExpiry > Date.now() ? foodstuffsToken : foodstuffsToken;
  if (!token) {
    throw new Error(`${store}: No JWT token available`);
  }

  const url = `https://${domain}/v1/edge/search/paginated/products`;
  const banner = store === "paknsave" ? "PNS" : "NW";

  const res = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "origin": `https://www.${store === "paknsave" ? "paknsave" : "newworld"}.co.nz`,
        "referer": `https://www.${store === "paknsave" ? "paknsave" : "newworld"}.co.nz/`,
      },
      body: JSON.stringify({
        algoliaQuery: {
          attributesToHighlight: [],
          attributesToRetrieve: ["productID", "Type", "sponsored"],
          facets: ["brand", "onPromotion"],
          filters: `stores:${FOODSTUFFS_STORE_ID}`,
          hitsPerPage: 10,
          page: 0,
          query,
          analyticsTags: [`fs#WEB:desktop`],
        },
        algoliaFacetQueries: [],
        storeId: FOODSTUFFS_STORE_ID,
        hitsPerPage: 10,
        page: 0,
        sortOrder: "SI_POPULARITY_ASC",
        tobaccoQuery: false,
        precisionMedia: {
          adDomain: "SEARCH_PAGE",
          adPositions: [],
          publishImpressionEvent: false,
          disableAds: true,
        },
        banner,
      }),
    },
    10000
  );

  if (!res.ok) {
    throw new Error(`${store} API error: ${res.status}`);
  }

  const data = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: any[] = data?.products ?? [];

  return products.map((hit) => {
    const productId: string = hit.productId ?? "";
    const cleanId = productId.replace(/-EA-000$/, "");
    const imageUrl = cleanId
      ? `https://a.fsimg.co.nz/product/retail/fan/image/400x400/${cleanId}.png`
      : "";

    const priceInCents: number = hit.singlePrice?.price ?? 0;
    const price = priceInCents / 100;

    const promos = hit.promotions ?? [];
    const bestPromo = promos.find((p: { bestPromotion?: boolean }) => p.bestPromotion);
    const salePrice = bestPromo
      ? bestPromo.rewardValue / 100
      : undefined;

    const comparePrice = hit.singlePrice?.comparativePrice;
    const unitPrice = comparePrice
      ? `$${(comparePrice.pricePerUnit / 100).toFixed(2)}/${comparePrice.measureDescription ?? "unit"}`
      : undefined;

    const inStock = (hit.availability ?? []).includes("ONLINE");

    return {
      name: hit.name ?? "",
      brand: hit.brand ?? "",
      price: salePrice && salePrice < price ? price : price,
      salePrice: salePrice && salePrice < price ? salePrice : undefined,
      imageUrl,
      inStock,
      size: hit.displayName ?? "",
      unitPrice,
      store,
    };
  });
}

export async function searchPaknsave(
  query: string
): Promise<SupermarketProduct[]> {
  return searchFoodstuffs("api-prod.paknsave.co.nz", query, "paknsave");
}

export async function searchNewworld(
  query: string
): Promise<SupermarketProduct[]> {
  return searchFoodstuffs("api-prod.newworld.co.nz", query, "newworld");
}

/**
 * 全スーパーマーケットを並行検索する
 * 1店舗が失敗しても他店のデータを返す
 */
export async function searchAllStores(query: string): Promise<StoreResults> {
  const results: StoreResults = {
    woolworths: [],
    paknsave: [],
    newworld: [],
    errors: {},
  };

  const [woolworthsResult, paknsaveResult, newworldResult] =
    await Promise.allSettled([
      searchWoolworths(query),
      searchPaknsave(query),
      searchNewworld(query),
    ]);

  if (woolworthsResult.status === "fulfilled") {
    results.woolworths = woolworthsResult.value;
  } else {
    results.errors.woolworths = woolworthsResult.reason?.message ?? "取得失敗";
  }

  if (paknsaveResult.status === "fulfilled") {
    results.paknsave = paknsaveResult.value;
  } else {
    results.errors.paknsave = paknsaveResult.reason?.message ?? "取得失敗";
  }

  if (newworldResult.status === "fulfilled") {
    results.newworld = newworldResult.value;
  } else {
    results.errors.newworld = newworldResult.reason?.message ?? "取得失敗";
  }

  return results;
}
