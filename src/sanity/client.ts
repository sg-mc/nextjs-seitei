import { createClient } from "next-sanity";

// 本番での読み取り速度向上のため、CDN利用を環境変数で切り替え可能に
// 既定: 本番では true、開発では false
const useCdn = process.env.NEXT_PUBLIC_SANITY_USE_CDN
  ? !["false", "0"].includes(String(process.env.NEXT_PUBLIC_SANITY_USE_CDN).toLowerCase())
  : process.env.NODE_ENV === "production";

export const client = createClient({
  projectId: "6z254rdc",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn,
});
