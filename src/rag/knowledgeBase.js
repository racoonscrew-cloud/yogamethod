import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MiniSearch from "minisearch";

const CONTENT_DIR = path.resolve(process.cwd(), "content/knowledge-base");

function listMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(fullPath);
    if (entry.isFile() && entry.name.endsWith(".md")) return [fullPath];
    return [];
  });
}

// Разбивает markdown-файл на чанки по заголовкам второго уровня (##),
// чтобы каждый чанк отвечал на один конкретный вопрос.
function splitIntoChunks(filePath, rawContent) {
  const { data, content } = matter(rawContent);
  const sourceTitle = data.title || path.basename(filePath, ".md");
  const sections = content.split(/\n(?=## )/g).filter((s) => s.trim());

  if (sections.length === 0) {
    return [{ id: filePath, source: sourceTitle, heading: sourceTitle, text: content.trim() }];
  }

  return sections.map((section, i) => {
    const headingMatch = section.match(/^##\s+(.+)$/m);
    const heading = headingMatch ? headingMatch[1].trim() : sourceTitle;
    return {
      id: `${filePath}#${i}`,
      source: sourceTitle,
      heading,
      text: section.replace(/^##\s+.+$/m, "").trim(),
    };
  });
}

export function loadKnowledgeBase() {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(`Папка базы знаний не найдена: ${CONTENT_DIR}`);
  }

  const files = listMarkdownFiles(CONTENT_DIR);
  const chunks = files.flatMap((filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    return splitIntoChunks(path.relative(CONTENT_DIR, filePath), raw);
  });

  const index = new MiniSearch({
    idField: "id",
    fields: ["heading", "text", "source"],
    storeFields: ["source", "heading", "text"],
    searchOptions: { boost: { heading: 2 }, fuzzy: 0.2, prefix: true },
  });
  index.addAll(chunks);

  return {
    chunkCount: chunks.length,
    search(query, topK = 5) {
      return index.search(query, { combineWith: "OR" }).slice(0, topK);
    },
  };
}
