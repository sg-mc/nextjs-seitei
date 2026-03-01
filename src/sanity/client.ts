import { createClient } from "next-sanity";

// 本番での読み取り速度向上のため、CDN利用を環境変数で切り替え可能に
// 既定: 本番では true、開発では false
// Next.js App Routerのキャッシュ（ISR）と連携するため、useCdnはfalseに固定
const useCdn = false;

export const client = createClient({
  projectId: "6z254rdc",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn,
});
