import { defineMdastPlugin } from "satteri";
import type { MdastPluginDefinition } from "satteri";
import type { Link, Parents, Text } from "mdast";

// satteri は mdast の context 型を公開していないので visitor から導出する
type MdastVisitorContext = Parameters<NonNullable<MdastPluginDefinition["text"]>>[1];
import { createHash } from "node:crypto";
import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import ogs from "open-graph-scraper";

interface Options {
  /** 表示URLをホスト名だけに短縮する */
  shortenUrl?: boolean;
  /** サムネイルを左右どちらに置くか */
  thumbnailPosition?: "right" | "left";
  /** サムネイルを表示しない */
  noThumbnail?: boolean;
  /** ファビコンを表示しない */
  noFavicon?: boolean;
  /** OG画像・ファビコンを public/ に保存してローカル参照する */
  cache?: boolean;
}

interface ResolvedOptions extends Required<Options> {}

// public/ 配下の保存先。ここに置いたファイルはそのまま静的配信される
const OUTPUT_DIR = "/mdast-link-card/";
const SAVE_DIR = path.join(process.cwd(), "public", OUTPUT_DIR);

const TIMEOUT = 10000;

export default function mdastLinkCard(opts: Options = {}) {
  const options: ResolvedOptions = {
    shortenUrl: opts.shortenUrl ?? true,
    thumbnailPosition: opts.thumbnailPosition ?? "right",
    noThumbnail: opts.noThumbnail ?? false,
    noFavicon: opts.noFavicon ?? false,
    cache: opts.cache ?? true,
  };

  return defineMdastPlugin({
    name: "mdastLinkCard",

    // GFM のオートリンクなどで link ノードになっているケース
    async link(node, ctx) {
      const child = node.children[0];
      const isAutolink =
        node.children.length === 1 &&
        child?.type === "text" &&
        isSameUrl(node.url, child.value);
      if (!isAutolink) return;
      if (!isStandalone(node, ctx)) return;
      await replaceWithCard(node.url, node, ctx, options);
    },

    // 素のURLがテキストとして残っているケース
    async text(node, ctx) {
      if (!isCardableUrl(node.value)) return;
      if (!isStandalone(node, ctx)) return;
      await replaceWithCard(node.value, node, ctx, options);
    },
  });
}

// 判定
const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

function isCardableUrl(value: string): boolean {
  return URL.canParse(value) && URL_PATTERN.test(value);
}

function isSameUrl(a: string, b: string): boolean {
  try {
    return new URL(a).toString() === new URL(b).toString();
  } catch {
    return false;
  }
}

// 「段落にそのノードだけ」かつ「段落が root 直下」のときだけカード化する。
// 文中のインラインリンクを巻き込まないための条件。
function isStandalone(
  node: Readonly<Text | Link>,
  ctx: MdastVisitorContext,
): boolean {
  const paragraph = ctx.parent(node) as Parents | undefined;
  if (!paragraph || paragraph.type !== "paragraph") return false;
  if (paragraph.children.length !== 1) return false;
  const grandparent = ctx.parent(paragraph);
  return grandparent?.type === "root";
}

// 置換
async function replaceWithCard(
  rawUrl: string,
  node: Readonly<Text | Link>,
  ctx: MdastVisitorContext,
  options: ResolvedOptions,
): Promise<void> {
  const paragraph = ctx.parent(node);
  if (!paragraph) return;
  try {
    const data = await getLinkCardData(new URL(rawUrl), options);
    ctx.replaceNode(paragraph, { rawHtml: createCardHtml(data, options) });
  } catch (error) {
    console.error(`[mdast-link-card] Error: ${rawUrl}\n ${error}`);
  }
}

// データ取得

interface CardData {
  title: string;
  description: string;
  faviconUrl: string;
  ogImageUrl: string;
  displayUrl: string;
  url: URL;
}

async function getLinkCardData(
  url: URL,
  options: ResolvedOptions,
): Promise<CardData> {
  const og = await getOpenGraph(url);

  const title = og?.ogTitle || url.hostname;
  const description = og?.ogDescription || "";

  const faviconUrl = options.noFavicon
    ? ""
    : await resolveFavicon(url, og?.favicon, options);
  const ogImageUrl = options.noThumbnail
    ? ""
    : await resolveOgImage(url, extractOgImage(og), options);

  let displayUrl = options.shortenUrl ? url.hostname : url.toString();
  try {
    displayUrl = decodeURI(displayUrl);
  } catch {
    /* デコードできなければそのまま */
  }

  return { title, description, faviconUrl, ogImageUrl, displayUrl, url };
}

async function getOpenGraph(url: URL): Promise<Record<string, any> | undefined> {
  try {
    const { result } = await ogs({ url: url.toString(), timeout: TIMEOUT });
    return result as Record<string, any>;
  } catch (error: any) {
    console.error(
      `[mdast-link-card] Error: Failed to get OG data of ${url} due to ${error?.result?.error ?? error}.`,
    );
    return undefined;
  }
}

function extractOgImage(og: Record<string, any> | undefined): string | undefined {
  const images = og?.ogImage;
  return Array.isArray(images) && images.length > 0 ? images[0].url : undefined;
}

async function resolveFavicon(
  url: URL,
  ogFavicon: string | undefined,
  options: ResolvedOptions,
): Promise<string> {
  let faviconUrl = ogFavicon;

  // 相対パスなら絶対URLに直す
  if (faviconUrl && !URL.canParse(faviconUrl)) {
    try {
      faviconUrl = new URL(faviconUrl, url.origin).toString();
    } catch {
      faviconUrl = undefined;
    }
  }

  // フォールバック
  if (!faviconUrl) {
    const google = `https://www.google.com/s2/favicons?domain=${url.hostname}`;
    try {
      const res = await fetch(google, {
        method: "HEAD",
        signal: AbortSignal.timeout(TIMEOUT),
      });
      faviconUrl = res.ok ? google : "";
    } catch {
      faviconUrl = "";
    }
  }

  if (faviconUrl && options.cache) {
    return (await cacheImage(new URL(faviconUrl))) ?? faviconUrl;
  }
  return faviconUrl;
}

async function resolveOgImage(
  _url: URL,
  imageUrl: string | undefined,
  options: ResolvedOptions,
): Promise<string> {
  if (!imageUrl || !URL.canParse(imageUrl)) return "";
  if (options.cache) {
    return (await cacheImage(new URL(imageUrl))) ?? imageUrl;
  }
  return imageUrl;
}

// 画像をビルド時に`public/`へ落とす
async function cacheImage(url: URL): Promise<string | null> {
  const hash = createHash("sha256").update(decodeURI(url.href)).digest("hex");

  // 既存チェック
  try {
    const files = await readdir(SAVE_DIR);
    const hit = files.find((f) => f.startsWith(`${hash}.`));
    if (hit) return path.posix.join(OUTPUT_DIR, hit);
  } catch {
    // ディレクトリ未作成
  }

  // ダウンロードして保存
  try {
    const res = await fetch(url.href, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const extension = await guessExtension(res.headers.get("Content-Type"), buffer);
    const filename = `${hash}${extension}`;

    try {
      await access(SAVE_DIR);
    } catch {
      await mkdir(SAVE_DIR, { recursive: true });
    }
    await writeFile(path.join(SAVE_DIR, filename), buffer);
    return path.posix.join(OUTPUT_DIR, filename);
  } catch (error) {
    console.error(`[mdast-link-card] Error: Failed to cache image ${url.href}\n ${error}`);
    return null;
  }
}

async function guessExtension(
  contentType: string | null,
  buffer: Buffer,
): Promise<string> {
  if (contentType?.startsWith("image/svg+xml")) return ".svg";
  if (contentType?.startsWith("image/")) {
    const type = await fileTypeFromBuffer(buffer);
    return type ? `.${type.ext}` : ".png";
  }
  return "";
}

// HTML生成
const BLOCK = "link-card";
const bem = (element?: string) => (element ? `${BLOCK}__${element}` : BLOCK);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createCardHtml(data: CardData, options: ResolvedOptions): string {
  const { title, description, faviconUrl, ogImageUrl, displayUrl, url } = data;

  const thumbnail = ogImageUrl
    ? `<div class="${bem("thumbnail")}"><img class="${bem("image")}" src="${escapeHtml(ogImageUrl)}" alt="" loading="lazy"></div>`
    : "";

  const favicon = faviconUrl
    ? `<img class="${bem("favicon")}" src="${escapeHtml(faviconUrl)}" width="14" height="14" alt="">`
    : "";

  const body = `<div class="${bem("body")}">
      <div class="${bem("text")}">
        <span class="${bem("title")}">${escapeHtml(title)}</span>
        <span class="${bem("description")}">${escapeHtml(description)}</span>
      </div>
      <div class="${bem("meta")}">
        ${favicon}
        <span class="${bem("url")}">${escapeHtml(displayUrl)}</span>
      </div>
    </div>`;

  const inner = options.thumbnailPosition === "left"
      ? `${thumbnail}\n${body}`
      : `${body}\n${thumbnail}`;

  return `<a class="${bem()}" href="${escapeHtml(url.toString())}" target="_blank" rel="noreferrer noopener">
      ${inner}
    </a>`;
}
