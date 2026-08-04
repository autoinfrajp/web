type Page = {
  source: string;
  output: string;
  canonicalUrl: string;
  description: string;
};

type LatestIndex = Page & {
  versionUrl: string;
};

const pages: readonly Page[] = [
  {
    source: "privacy/livealigned/1.0/index.md",
    output: "privacy/livealigned/1.0/index.html",
    canonicalUrl: "https://autoinfra.jp/privacy/livealigned/1.0/",
    description:
      "LiveAlignedにおける利用者情報の取扱いを定めたプライバシーポリシーです。",
  },
  {
    source: "terms/livealigned/1.0/index.md",
    output: "terms/livealigned/1.0/index.html",
    canonicalUrl: "https://autoinfra.jp/terms/livealigned/1.0/",
    description:
      "LiveAlignedの利用条件とアプリの使用許諾を定めた利用規約です。",
  },
  {
    source: "community-guidelines/livealigned/1.0/index.md",
    output: "community-guidelines/livealigned/1.0/index.html",
    canonicalUrl: "https://autoinfra.jp/community-guidelines/livealigned/1.0/",
    description:
      "LiveAlignedのコミュニティ基準、児童安全、通報およびブロックについて説明します。",
  },
  {
    source: "account-deletion/livealigned/index.md",
    output: "account-deletion/livealigned/index.html",
    canonicalUrl: "https://autoinfra.jp/account-deletion/livealigned/",
    description:
      "LiveAlignedのアカウントと関連データを削除する方法を説明します。",
  },
  {
    source: "support/livealigned/index.md",
    output: "support/livealigned/index.html",
    canonicalUrl: "https://autoinfra.jp/support/livealigned/",
    description:
      "LiveAlignedのサポート窓口と安全に関する連絡方法を案内します。",
  },
] as const;

const latestIndexes: readonly LatestIndex[] = [
  {
    source: "privacy/livealigned/1.0/index.md",
    output: "privacy/livealigned/index.html",
    canonicalUrl: "https://autoinfra.jp/privacy/livealigned/",
    versionUrl: "/privacy/livealigned/1.0/",
    description: "LiveAlignedプライバシーポリシーの最新版を案内します。",
  },
  {
    source: "terms/livealigned/1.0/index.md",
    output: "terms/livealigned/index.html",
    canonicalUrl: "https://autoinfra.jp/terms/livealigned/",
    versionUrl: "/terms/livealigned/1.0/",
    description: "LiveAligned利用規約の最新版を案内します。",
  },
  {
    source: "community-guidelines/livealigned/1.0/index.md",
    output: "community-guidelines/livealigned/index.html",
    canonicalUrl: "https://autoinfra.jp/community-guidelines/livealigned/",
    versionUrl: "/community-guidelines/livealigned/1.0/",
    description: "LiveAlignedコミュニティガイドラインの最新版を案内します。",
  },
] as const;

const encoder = new TextEncoder();

for (const page of pages) {
  const markdown = await Deno.readTextFile(page.source);
  const document = parseDocument(markdown);
  const html = renderPage(page, document);
  await Deno.writeFile(page.output, encoder.encode(html));
  console.log(`rendered ${page.output}`);
}

for (const page of latestIndexes) {
  const markdown = await Deno.readTextFile(page.source);
  const document = parseDocument(markdown);
  const html = renderLatestIndex(page, document);
  await Deno.writeFile(page.output, encoder.encode(html));
  console.log(`rendered ${page.output}`);
}

type Document = {
  title: string;
  version?: string;
  status: string;
  lastUpdated: string;
  body: string;
};

function parseDocument(markdown: string): Document {
  const lines = markdown.split("\n");
  const metadata = new Map<string, string>();
  let bodyStart = 0;

  if (lines[0] === "---") {
    const end = lines.indexOf("---", 1);
    if (end < 0) throw new Error("Unclosed front matter");
    for (const line of lines.slice(1, end)) {
      const separator = line.indexOf(":");
      if (separator < 0) continue;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^"|"$/g, "");
      metadata.set(key, value);
    }
    bodyStart = end + 1;
  }

  const title = metadata.get("title");
  const lastUpdated = metadata.get("last_updated");
  if (!title || !lastUpdated) {
    throw new Error("title and last_updated are required");
  }

  return {
    title,
    version: metadata.get("version"),
    status: metadata.get("status") ?? "draft",
    lastUpdated,
    body: lines.slice(bodyStart).join("\n").trim(),
  };
}

function renderPage(page: Page, document: Document): string {
  const robots = document.status === "published"
    ? "index,follow"
    : "noindex,nofollow";
  const version = document.version
    ? `<span>版 ${escapeHtml(document.version)}</span>`
    : "";

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(document.title)} | 株式会社オートインフラ</title>
  <meta name="description" content="${escapeAttribute(page.description)}">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#0a0e14">
  <link rel="canonical" href="${escapeAttribute(page.canonicalUrl)}">
  <link rel="stylesheet" href="/assets/legal.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/"><span aria-hidden="true"></span>株式会社オートインフラ</a>
  </header>
  <main class="document">
    <div class="document-meta">
      ${version}
      <span>最終更新日 ${escapeHtml(document.lastUpdated)}</span>
    </div>
    ${renderMarkdown(document.body)}
  </main>
  <footer class="site-footer">
    <span>© 株式会社オートインフラ</span>
    <a href="/">autoinfra.jp トップへ</a>
  </footer>
</body>
</html>
`;
}

function renderLatestIndex(page: LatestIndex, document: Document): string {
  const robots = document.status === "published"
    ? "index,follow"
    : "noindex,nofollow";
  const version = document.version ?? "最新版";

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(document.title)} | 株式会社オートインフラ</title>
  <meta name="description" content="${escapeAttribute(page.description)}">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#0a0e14">
  <link rel="canonical" href="${escapeAttribute(page.canonicalUrl)}">
  <link rel="stylesheet" href="/assets/legal.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/"><span aria-hidden="true"></span>株式会社オートインフラ</a>
  </header>
  <main class="document latest-index">
    <h1>${escapeHtml(document.title)}</h1>
    <p>現在の版は${escapeHtml(version)}です。</p>
    <p><a class="version-link" href="${escapeAttribute(page.versionUrl)}">${
    escapeHtml(version)
  }を読む</a></p>
    <p class="updated">最終更新日 ${escapeHtml(document.lastUpdated)}</p>
  </main>
  <footer class="site-footer">
    <span>© 株式会社オートインフラ</span>
    <a href="/">autoinfra.jp トップへ</a>
  </footer>
</body>
</html>
`;
}

function renderMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  const output: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | undefined;
  let listItems: string[] = [];
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    output.push(`<p>${renderInline(paragraph.join(""))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (!listType) return;
    output.push(
      `<${listType}>`,
      ...listItems.map((item) => `<li>${renderInline(item)}</li>`),
      `</${listType}>`,
    );
    listType = undefined;
    listItems = [];
  };
  const flushQuote = () => {
    if (quote.length === 0) return;
    output.push(
      `<aside class="notice">${renderInline(quote.join(""))}</aside>`,
    );
    quote = [];
  };

  for (const line of [...lines, ""]) {
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    const unordered = /^-\s+(.+)$/.exec(line);
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    const quoted = /^>\s?(.*)$/.exec(line);
    const listContinuation = /^\s{2,}(\S.*)$/.exec(line);

    if (quoted) {
      flushParagraph();
      closeList();
      quote.push(quoted[1]);
      continue;
    }
    flushQuote();

    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = unordered ?? ordered;
    if (listItem) {
      flushParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
      }
      listItems.push(listItem[1]);
      continue;
    }

    if (listType && listContinuation) {
      const lastIndex = listItems.length - 1;
      listItems[lastIndex] += listContinuation[1];
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      closeList();
      continue;
    }

    paragraph.push(line.trim());
  }

  return output.join("\n    ");
}

function renderInline(value: string): string {
  const tokens: string[] = [];
  const token = (html: string) => {
    const index = tokens.push(html) - 1;
    return `\u0000${index}\u0000`;
  };

  let marked = value.replace(
    /`([^`]+)`/g,
    (_, code: string) => token(`<code>${escapeHtml(code)}</code>`),
  );
  marked = marked.replace(
    /\[([^\]]+)]\(([^)]+)\)/g,
    (_, label: string, href: string) => {
      if (!isSafeHref(href)) throw new Error(`Unsafe link: ${href}`);
      return token(
        `<a href="${escapeAttribute(href)}">${escapeHtml(label)}</a>`,
      );
    },
  );
  marked = marked.replace(
    /<([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>/gi,
    (_, email: string) =>
      token(
        `<a href="mailto:${escapeAttribute(email)}">${escapeHtml(email)}</a>`,
      ),
  );

  return escapeHtml(marked).replace(
    /\u0000(\d+)\u0000/g,
    (_, index: string) => tokens[Number(index)],
  );
}

function isSafeHref(href: string): boolean {
  return href.startsWith("/") || href.startsWith("https://") ||
    href.startsWith("mailto:");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll("`", "&#96;");
}
