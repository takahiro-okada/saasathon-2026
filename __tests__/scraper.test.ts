import {
  searchWoolworths,
  searchPaknsave,
  searchNewworld,
  setFoodstuffsToken,
  searchAllStores,
} from "@/app/lib/scraper";

// Mock global fetch
const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

beforeEach(() => {
  fetchMock.mockReset();
});

describe("searchWoolworths", () => {
  it("transforms API response into SupermarketProduct[]", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        products: {
          items: [
            {
              name: "Pams Plain Flour",
              brand: "Pams",
              price: { originalPrice: 2.99, salePrice: 2.99, comparePrice: "1.99", comparePriceUnit: "kg" },
              images: { small: "https://small.jpg", big: "https://big.jpg" },
              stockLevel: 5,
              size: { volumeSize: "1.5kg" },
            },
          ],
        },
      })
    );

    const result = await searchWoolworths("flour");

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "Pams Plain Flour",
      brand: "Pams",
      price: 2.99,
      salePrice: undefined, // same as original → no sale
      imageUrl: "https://small.jpg",
      inStock: true,
      size: "1.5kg",
      unitPrice: "$1.99/kg",
      store: "woolworths",
    });
  });

  it("detects sale price when salePrice differs from originalPrice", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        products: {
          items: [
            {
              name: "Soy Sauce",
              brand: "Kikkoman",
              price: { originalPrice: 6.99, salePrice: 4.99 },
              images: { big: "https://big.jpg" },
              stockLevel: 10,
              size: { volumeSize: "500ml" },
            },
          ],
        },
      })
    );

    const result = await searchWoolworths("soy sauce");

    expect(result[0].salePrice).toBe(4.99);
    expect(result[0].price).toBe(6.99);
  });

  it("falls back to images.big when small is missing", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        products: {
          items: [
            {
              name: "Egg",
              price: { originalPrice: 5 },
              images: { big: "https://only-big.jpg" },
              stockLevel: 3,
              size: { weightSize: "12pk" },
            },
          ],
        },
      })
    );

    const result = await searchWoolworths("egg");
    expect(result[0].imageUrl).toBe("https://only-big.jpg");
    expect(result[0].size).toBe("12pk");
  });

  it("flags inStock=false when stockLevel is None or 0", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        products: {
          items: [
            { name: "A", price: { originalPrice: 1 }, stockLevel: "None" },
            { name: "B", price: { originalPrice: 1 }, stockLevel: 0 },
            { name: "C", price: { originalPrice: 1 }, stockLevel: 1 },
          ],
        },
      })
    );

    const result = await searchWoolworths("x");
    expect(result[0].inStock).toBe(false);
    expect(result[1].inStock).toBe(false);
    expect(result[2].inStock).toBe(true);
  });

  it("returns empty array when API returns no items", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ products: { items: [] } }));
    expect(await searchWoolworths("nothing")).toEqual([]);
  });

  it("throws when API returns non-OK status", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500));
    await expect(searchWoolworths("x")).rejects.toThrow("Woolworths API error: 500");
  });

  it("encodes the search query in the URL", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ products: { items: [] } }));
    await searchWoolworths("plain flour");
    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("search=plain+flour");
    expect(calledUrl).toContain("inStockProductsOnly=false");
  });
});

describe("Foodstuffs (Pak'nSave / New World)", () => {
  beforeEach(() => {
    setFoodstuffsToken("test-jwt-token");
  });

  it("throws when JWT is missing", async () => {
    setFoodstuffsToken("", -1000); // expired
    // Force it actually empty: re-set with empty
    setFoodstuffsToken("");
    // Empty string is falsy in scraper's check
    await expect(searchPaknsave("x")).rejects.toThrow(/No JWT token/);
  });

  it("transforms Pak'nSave API response (cents → dollars, image URL build)", async () => {
    setFoodstuffsToken("valid-jwt");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        products: [
          {
            productId: "5012345-EA-000",
            name: "Plain Flour",
            brand: "Pams",
            singlePrice: {
              price: 299, // cents
              comparativePrice: { pricePerUnit: 199, measureDescription: "kg" },
            },
            promotions: [],
            availability: ["ONLINE"],
            displayName: "1.5kg",
          },
        ],
      })
    );

    const result = await searchPaknsave("flour");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: "Plain Flour",
      brand: "Pams",
      price: 2.99,
      salePrice: undefined,
      imageUrl: "https://a.fsimg.co.nz/product/retail/fan/image/400x400/5012345.png",
      inStock: true,
      size: "1.5kg",
      unitPrice: "$1.99/kg",
      store: "paknsave",
    });
  });

  it("picks bestPromotion as salePrice", async () => {
    setFoodstuffsToken("valid-jwt");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        products: [
          {
            productId: "999-EA-000",
            name: "Soy Sauce",
            brand: "Kikkoman",
            singlePrice: { price: 699 },
            promotions: [
              { rewardValue: 599, bestPromotion: false },
              { rewardValue: 499, bestPromotion: true },
            ],
            availability: ["ONLINE"],
            displayName: "500ml",
          },
        ],
      })
    );

    const result = await searchPaknsave("soy");
    expect(result[0].salePrice).toBe(4.99);
    expect(result[0].price).toBe(6.99);
  });

  it("flags inStock=false when ONLINE not in availability", async () => {
    setFoodstuffsToken("valid-jwt");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        products: [
          {
            productId: "1-EA-000",
            name: "Out",
            singlePrice: { price: 100 },
            availability: ["IN_STORE"],
            displayName: "1pc",
          },
        ],
      })
    );
    const result = await searchPaknsave("out");
    expect(result[0].inStock).toBe(false);
  });

  it("Pak'nSave uses paknsave.co.nz origin and PNS banner", async () => {
    setFoodstuffsToken("valid-jwt");
    fetchMock.mockResolvedValueOnce(jsonResponse({ products: [] }));
    await searchPaknsave("x");
    const [, init] = fetchMock.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({
      origin: "https://www.paknsave.co.nz",
    });
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.banner).toBe("PNS");
  });

  it("New World uses newworld.co.nz origin and NW banner", async () => {
    setFoodstuffsToken("valid-jwt");
    fetchMock.mockResolvedValueOnce(jsonResponse({ products: [] }));
    await searchNewworld("x");
    const [, init] = fetchMock.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({
      origin: "https://www.newworld.co.nz",
    });
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.banner).toBe("NW");
  });

  it("strips -EA-000 suffix from productId for image URL", async () => {
    setFoodstuffsToken("valid-jwt");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        products: [
          {
            productId: "ABCDEF-EA-000",
            name: "Test",
            singlePrice: { price: 100 },
            availability: ["ONLINE"],
          },
        ],
      })
    );
    const result = await searchPaknsave("test");
    expect(result[0].imageUrl).toBe(
      "https://a.fsimg.co.nz/product/retail/fan/image/400x400/ABCDEF.png"
    );
  });

  it("returns empty image URL when productId is missing", async () => {
    setFoodstuffsToken("valid-jwt");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        products: [{ name: "No ID", singlePrice: { price: 100 }, availability: ["ONLINE"] }],
      })
    );
    const result = await searchPaknsave("x");
    expect(result[0].imageUrl).toBe("");
  });

  it("throws when API returns non-OK", async () => {
    setFoodstuffsToken("valid-jwt");
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 401));
    await expect(searchPaknsave("x")).rejects.toThrow("paknsave API error: 401");
  });
});

describe("searchAllStores", () => {
  beforeEach(() => {
    setFoodstuffsToken("valid-jwt");
  });

  it("aggregates results from all three stores in parallel", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          products: { items: [{ name: "WW Egg", price: { originalPrice: 5 }, stockLevel: 1 }] },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          products: [
            {
              productId: "1-EA-000",
              name: "PnS Egg",
              singlePrice: { price: 450 },
              availability: ["ONLINE"],
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          products: [
            {
              productId: "2-EA-000",
              name: "NW Egg",
              singlePrice: { price: 520 },
              availability: ["ONLINE"],
            },
          ],
        })
      );

    const result = await searchAllStores("egg");

    expect(result.woolworths).toHaveLength(1);
    expect(result.paknsave).toHaveLength(1);
    expect(result.newworld).toHaveLength(1);
    expect(result.errors).toEqual({});
    expect(result.woolworths[0].name).toBe("WW Egg");
    expect(result.paknsave[0].price).toBe(4.5);
    expect(result.newworld[0].price).toBe(5.2);
  });

  it("returns errors per-store when one fails but keeps others", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, false, 503)) // WW fails
      .mockResolvedValueOnce(
        jsonResponse({
          products: [
            {
              productId: "1-EA-000",
              name: "PnS OK",
              singlePrice: { price: 100 },
              availability: ["ONLINE"],
            },
          ],
        })
      )
      .mockResolvedValueOnce(jsonResponse({}, false, 401)); // NW fails

    const result = await searchAllStores("x");

    expect(result.woolworths).toEqual([]);
    expect(result.paknsave).toHaveLength(1);
    expect(result.newworld).toEqual([]);
    expect(result.errors.woolworths).toContain("503");
    expect(result.errors.newworld).toContain("401");
    expect(result.errors.paknsave).toBeUndefined();
  });
});
