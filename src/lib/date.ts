// 共通日付ユーティリティ
// 変更理由: サイト全体での日付表示ロジックをDRY化し、
// サーバー/クライアントでの振る舞いの一貫性と可読性を向上させる。

export type DateInput = string | number | Date | null | undefined;

export function formatDate(
  input: DateInput,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
  locale: string = 'ja-JP'
): string {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, options).format(d);
}

