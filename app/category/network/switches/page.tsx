"use client";

import * as React from "react";
import { useCart } from "@/app/CartProvider";
import { useWishlist } from "@/app/WishlistProvider";
import { Heart as HeartIcon } from "lucide-react";

type StockStatus = "onsale" | "instock" | "backorder";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number; // KES
  oldPrice?: number; // for sale badge/strike-through
  status: StockStatus;
  image: string; // use external placeholder so it works without local assets
};

const ALL_PRODUCTS: Product[] = [
  { id: "p1", name: "BDCOM S1200-16P2G1S 16-Port Unmanaged PoE Switch with SFP and 180W PoE Budget", brand: "BDCOM", price: 9265, status: "instock", image: "/products/switch1.jpg" },
  { id: "p2", name: "BDCOM S1200-24P2G1S 24-Port Unmanaged PoE Switch with SFP and 280W PoE Budget", brand: "BDCOM", price: 11745, status: "instock", image: "/products/switch2.jpg" },
  { id: "p3", name: "BDCOM S1200-24P2G1S-370 24-Port Unmanaged PoE Switch with SFP and 370W PoE Budget", brand: "BDCOM", price: 13705, status: "onsale", image: "/products/switch3.jpg" },
  { id: "p4", name: "BDCOM S1500-16P2S 16-Port Unmanaged PoE Switch with SFP and 180W PoE Budget", brand: "BDCOM", price: 13965, status: "instock", image: "/products/switch4.jpg" },
  { id: "p5", name: "BDCOM S1500-24P2S-370 24-Port Unmanaged PoE Switch with SFP and 370W PoE Budget", brand: "BDCOM", price: 17620, status: "instock", image: "/products/switch5.jpg" },
  { id: "p6", name: "BDCOM S1500-8P2G 8-Port Unmanaged PoE Switch with RJ45 and 90W PoE Budget", brand: "BDCOM", price: 5220, status: "onsale", image: "/products/switch6.jpg" },
  { id: "p7", name: "BDCOM S1508D Switch unmanaged 8 ports 1000M TX", brand: "BDCOM", price: 2480, status: "instock", image: "/products/switch7.jpg" },
  { id: "p8", name: "Commercial Switch", brand: "Himax", price: 4200, status: "instock", image: "/products/switch8.jpg" },
  { id: "p9", name: "Commercial Switch", brand: "Himax", price: 13650, status: "onsale", image: "/products/switch9.jpg" },
  { id: "p10", name: "Commercial Switch", brand: "Himax", price: 17550, status: "instock", image: "/products/switch10.jpg" },
  { id: "p11", name: "Indoor Access Point", brand: "Himax", price: 3600, status: "instock", image: "/products/switch11.jpg" },
];

const ALL_BRANDS = ["BDCOM", "Himax"] as const;

function formatKES(x: number) {
  return `Ksh${x.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export default function Page() {
  // UI state
  const [query, setQuery] = React.useState("");
  const [brands, setBrands] = React.useState<string[]>([]);
  const [stock, setStock] = React.useState<StockStatus[]>([]);
  const [priceMin, setPriceMin] = React.useState(3000);
  const [priceMax, setPriceMax] = React.useState(200000);
  const [perPage, setPerPage] = React.useState(12);
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState("default"); // default|price-asc|price-desc|name-asc|name-desc

  // Quantity per product (keyed by product id)
  const [qtyMap, setQtyMap] = React.useState<Record<string, number>>({});
  const getQty = (id: string) => qtyMap[id] ?? 1;
  const incQty = (id: string) =>
    setQtyMap((m) => ({ ...m, [id]: (m[id] ?? 1) + 1 }));
  const decQty = (id: string) =>
    setQtyMap((m) => ({ ...m, [id]: Math.max(1, (m[id] ?? 1) - 1) }));

  // Derived products after filters
  const filtered = React.useMemo(() => {
    let out = ALL_PRODUCTS.filter((p) => p.price >= priceMin && p.price <= priceMax);
    if (brands.length) out = out.filter((p) => brands.includes(p.brand));
    if (stock.length) out = out.filter((p) => stock.includes(p.status));
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    switch (sort) {
      case "price-asc":
        out = [...out].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        out = [...out].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        out = [...out].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        out = [...out].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return out;
  }, [priceMin, priceMax, brands, stock, sort, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  React.useEffect(() => {
    // reset to first page when filters change
    setPage(1);
  }, [priceMin, priceMax, brands, stock, sort, perPage, query]);

  function toggleBrand(b: string) {
    setBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }

  function toggleStock(s: StockStatus) {
    setStock((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function clampRange(min: number, max: number) {
    if (min > max) [min, max] = [max, min];
    setPriceMin(min);
    setPriceMax(max);
  }

  const { wishlist, toggleWish } = useWishlist();
  const { addToCart } = useCart();

  // small helpers
  const showingFrom = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const showingTo = Math.min(filtered.length, page * perPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-[url('https://images.unsplash.com/photo-1569235182173-379ecd0bba77?q=80&w=2400&auto=format&fit=crop')] bg-cover bg-center">
        <div className="bg-gray-800/85">
          <div className="mx-auto max-w-7xl px-4 py-10 text-white">
            <h1 className="text-4xl font-extrabold">Switches</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 space-y-8">
          {/* Filter by Price */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Filter by Price</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={3000}
                  max={200000}
                  value={priceMin}
                  onChange={(e) => clampRange(parseInt(e.target.value), priceMax)}
                  className="w-full"
                />
                <input
                  type="range"
                  min={3000}
                  max={200000}
                  value={priceMax}
                  onChange={(e) => clampRange(priceMin, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <p className="text-sm text-gray-600">
                Price: <span className="font-medium">{formatKES(priceMin)}</span> —{" "}
                <span className="font-medium">{formatKES(priceMax)}</span>
              </p>
            </div>
          </section>

          {/* Brands */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Filter by Brand</h3>
            <div className="space-y-2">
              {ALL_BRANDS.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={brands.includes(b)}
                    onChange={() => toggleBrand(b)}
                    className="h-4 w-4"
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Stock */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Stock Status</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={stock.includes("onsale")}
                  onChange={() => toggleStock("onsale")}
                  className="h-4 w-4"
                />
                On sale
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={stock.includes("instock")}
                  onChange={() => toggleStock("instock")}
                  className="h-4 w-4"
                />
                In stock
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={stock.includes("backorder")}
                  onChange={() => toggleStock("backorder")}
                  className="h-4 w-4"
                />
                On backorder
              </label>
            </div>
          </section>

          {/* Promo */}
          <section className="rounded-2xl border bg-white overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1580906855280-95e535b1341c?q=80&w=1200&auto=format&fit=crop"
              alt="Promo"
              className="h-44 w-full object-cover"
            />
            <div className="p-5">
              <h4 className="text-lg font-semibold">High Quality Products</h4>
              <p className="text-sm text-gray-600 mt-1">
                Reliable brands for professional networking.
              </p>
              <button className="mt-4 rounded-xl bg-gray-800 px-4 py-2 text-white hover:bg-red-700">
                Shop Now
              </button>
            </div>
          </section>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9">
          {/* Top controls */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{showingFrom}</span>–
              <span className="font-medium">{showingTo}</span> of{" "}
              <span className="font-medium">{filtered.length}</span> results
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm">
                Show:
                {[9, 12, 18, 24].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPerPage(n)}
                    className={`rounded-md px-2 py-1 ${perPage === n ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-2">
                <div className="grid grid-cols-2 gap-0.5 rounded-md border p-1">
                  <span className="h-4 w-4 bg-gray-900" />
                  <span className="h-4 w-4 bg-gray-300" />
                  <span className="h-4 w-4 bg-gray-300" />
                  <span className="h-4 w-4 bg-gray-300" />
                </div>
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border bg-white px-3 py-2 text-sm"
                aria-label="Sorting"
              >
                <option value="default">Default sorting</option>
                <option value="price-asc">Sort by price: low to high</option>
                <option value="price-desc">Sort by price: high to low</option>
                <option value="name-asc">Sort by name: A → Z</option>
                <option value="name-desc">Sort by name: Z → A</option>
              </select>

              {/* Search */}
              <div className="flex items-center rounded-lg border bg-white px-3 py-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products"
                  className="w-52 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grid (flex to center last row) */}
          {current.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-gray-600">
              No products match your filters.
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              {current.map((p) => {
                const onSale = p.status === "onsale" && p.oldPrice && p.oldPrice > p.price;
                const qty = getQty(p.id);

                return (
                  <div
                    key={p.id}
                    className="w-full sm:w-[300px] group relative rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    {/* Wishlist */}
                    <button
                      onClick={() =>
                        toggleWish({
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          image: p.image,
                        })
                      }
                      className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow hover:bg-white"
                      aria-label="Toggle wishlist"
                    >
                      <HeartIcon
                        className="w-5 h-5"
                        strokeWidth={1.5}
                        fill={wishlist[p.id] ? "red" : "transparent"}
                        stroke={wishlist[p.id] ? "red" : "gray"}
                      />
                    </button>

                    {/* Sale badge */}
                    {onSale && (
                      <div className="absolute left-3 top-3 rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                        -{Math.round(((p.oldPrice! - p.price) / p.oldPrice!) * 100)}%
                      </div>
                    )}

                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-50">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      <h3 className="line-clamp-2 text-sm font-medium text-gray-900">{p.name}</h3>
                      <div className="flex items-center gap-2">
                        {onSale && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatKES(p.oldPrice!)}
                          </span>
                        )}
                        <span className="text-base font-semibold text-red-600">
                          {formatKES(p.price)}
                        </span>
                      </div>

                      {/* Quantity selector */}
                      <div className="flex items-center gap-2 mt-2 justify-center">
                        <button
                          onClick={() => decQty(p.id)}
                          className="px-2 py-1 rounded border hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          –
                        </button>
                        <span className="px-3">{qty}</span>
                        <button
                          onClick={() => incQty(p.id)}
                          className="px-2 py-1 rounded border hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Add to Cart */}
                      <button
                        onClick={() =>
                          addToCart({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            image: p.image,
                            quantity: qty,
                          })
                        }
                        className="mt-2 w-full rounded-full bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              disabled={page === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-9 w-9 rounded-lg border text-sm ${
                  page === n ? "bg-gray-800 font-semibold text-white" : "bg-white hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
