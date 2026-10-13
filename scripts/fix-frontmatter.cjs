const fs = require('fs');
const path = require('path');

const NEW_POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');
const OLD_POSTS_DIR = 'G:\\文档\\hexo\\blog\\shokax-can\\source\\_posts';

const SLUG_MAP = {
  'mothers-day': "mother's-day"
};

const CHINESE_COMMA = '\uFF0C';
const RE_QUOTES = /^['"\u2018\u2019\u201C\u201D]|['"\u2018\u2019\u201C\u201D]$/g;

function stripQuotes(s) {
  return s.replace(RE_QUOTES, '');
}

function simpleYamlParse(text) {
  const result = {};
  const lines = text.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }

    const keyMatch = line.match(/^([\w-]+):\s*(.*?)$/);
    if (!keyMatch) { i++; continue; }

    const key = keyMatch[1];
    let value = keyMatch[2].trim();

    if (value === '' || value === null) {
      i++;
      while (i < lines.length && lines[i].trim() === '') { i++; }
      if (i < lines.length && lines[i].trimStart().startsWith('- ')) {
        const arr = [];
        while (i < lines.length && lines[i].trimStart().startsWith('- ')) {
          arr.push(lines[i].trimStart().slice(2).trim());
          i++;
        }
        result[key] = arr;
        continue;
      }
      result[key] = null;
      continue;
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      if (inner === '') {
        value = [];
      } else {
        value = inner.split(/[,，]/).map(s => stripQuotes(s.trim())).filter(s => s);
      }
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else {
      value = stripQuotes(value);
    }

    result[key] = value;
    i++;
  }

  return result;
}

function stripBOM(text) {
  if (text.charCodeAt(0) === 0xFEFF) return text.slice(1);
  return text;
}

function parseNewFrontmatter(content) {
  content = stripBOM(content);
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (match) {
    return { data: simpleYamlParse(match[1]), body: content.slice(match[0].length) };
  }
  return { data: {}, body: content };
}

function parseOldFrontmatter(content) {
  const endMatch = content.match(/\r?\n-{3,}\r?\n/);
  if (endMatch) {
    const yamlText = content.slice(0, endMatch.index);
    return { data: simpleYamlParse(yamlText), body: content.slice(endMatch.index + endMatch[0].length) };
  }
  return { data: simpleYamlParse(content), body: '' };
}

function stringifyFrontmatter(data) {
  const lines = ['---'];
  const fieldOrder = ['title', 'date', 'lastMod', 'summary', 'cover', 'category', 'tags', 'draft', 'comments', 'sticky'];

  for (const field of fieldOrder) {
    if (data[field] === undefined || data[field] === null) continue;
    const value = data[field];

    if (field === 'tags') {
      if (Array.isArray(value) && value.length > 0) {
        const tagsStr = value.map(t => `'${t}'`).join(', ');
        lines.push(`tags: [${tagsStr}]`);
      } else {
        lines.push('tags: []');
      }
    } else if (field === 'date' || field === 'lastMod') {
      lines.push(`${field}: ${value}`);
    } else if (typeof value === 'string') {
      lines.push(`${field}: '${value}'`);
    } else if (typeof value === 'boolean') {
      lines.push(`${field}: ${value}`);
    } else if (typeof value === 'number') {
      lines.push(`${field}: ${value}`);
    } else if (value instanceof Date) {
      lines.push(`${field}: ${value.toISOString()}`);
    } else if (Array.isArray(value)) {
      lines.push(`${field}: ${JSON.stringify(value)}`);
    }
  }

  lines.push('---');
  return lines.join('\n') + '\n';
}

function hasChineseCommaTags(data) {
  if (!Array.isArray(data.tags)) return false;
  for (const tag of data.tags) {
    if (typeof tag === 'string' && tag.includes(CHINESE_COMMA)) return true;
  }
  return false;
}

function fixChineseCommaTags(tags) {
  const result = [];
  for (const tag of tags) {
    if (typeof tag === 'string' && tag.includes(CHINESE_COMMA)) {
      const parts = tag.split(CHINESE_COMMA).map(s => s.trim()).filter(s => s);
      result.push(...parts);
    } else {
      result.push(tag);
    }
  }
  return result;
}

function hasOldFrontmatterIssues(oldData, slug) {
  if (slug === 'qqth') return true;
  return false;
}

async function main() {
  const slugs = fs.readdirSync(NEW_POSTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let updated = 0;
  let skipped = 0;
  let warned = [];
  let fixedComma = [];

  for (const slug of slugs) {
    const newPath = path.join(NEW_POSTS_DIR, slug, 'index.md');
    if (!fs.existsSync(newPath)) {
      console.log(`  ⚠ ${slug}: index.md not found, skipping`);
      warned.push(slug);
      continue;
    }

    const newContent = fs.readFileSync(newPath, 'utf-8');
    const { data, body } = parseNewFrontmatter(newContent);

    const chineseCommaIssue = hasChineseCommaTags(data);
    if (chineseCommaIssue) {
      data.tags = fixChineseCommaTags(data.tags);
      fixedComma.push(slug);
      console.log(`  🔧 ${slug}: fixed Chinese commas in tags`);
    }

    const tagsExist = Array.isArray(data.tags) && data.tags.length > 0;
    const catExist = typeof data.category === 'string' && data.category !== '';

    if (tagsExist && catExist) {
      console.log(`  ✓ ${slug}: already complete, skipping`);
      skipped++;
      if (chineseCommaIssue) {
        const newFrontmatter = stringifyFrontmatter(data);
        fs.writeFileSync(newPath, newFrontmatter + body, 'utf-8');
        updated++;
      }
      continue;
    }

    const needsTagsFix = !tagsExist;
    const needsCatFix = !catExist;

    let oldSlug = slug;
    if (SLUG_MAP[slug]) oldSlug = SLUG_MAP[slug];

    let oldPath = path.join(OLD_POSTS_DIR, oldSlug + '.md');
    if (!fs.existsSync(oldPath)) {
      console.log(`  ⚠ ${slug}: no old article found (${oldPath}), skipping`);
      warned.push(slug);
      continue;
    }

    const oldContent = fs.readFileSync(oldPath, 'utf-8');
    const { data: oldData } = parseOldFrontmatter(oldContent);

    let oldCategory = oldData.category || oldData.categories || oldData.cate || null;
    if (Array.isArray(oldCategory) && oldCategory.length > 0) {
      oldCategory = oldCategory[0];
    }

    let oldTags = oldData.tags || [];
    if (!Array.isArray(oldTags)) {
      oldTags = typeof oldTags === 'string' ? [oldTags] : [];
    }
    oldTags = [...new Set(oldTags)];

    if (needsCatFix && oldCategory) {
      data.category = oldCategory;
    } else if (needsCatFix) {
      console.log(`  ⚠ ${slug}: missing category but old article has none either`);
    }

    if (needsTagsFix && oldTags.length > 0) {
      data.tags = oldTags;
    } else if (needsTagsFix) {
      console.log(`  ⚠ ${slug}: empty tags but old article has none either`);
    }

    const newFrontmatter = stringifyFrontmatter(data);
    fs.writeFileSync(newPath, newFrontmatter + body, 'utf-8');

    const changes = [];
    if (needsCatFix) changes.push(`category: ${oldCategory || '(none)'}`);
    if (needsTagsFix) changes.push(`tags: ${oldTags.length > 0 ? oldTags.join(', ') : '(none)'}`);
    if (chineseCommaIssue) changes.push('fixed commas');
    console.log(`  ✓ ${slug}: updated (${changes.join(', ')})`);
    updated++;
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (already complete): ${skipped}`);
  console.log(`  Warnings (no old article): ${warned.length}`);
  if (fixedComma.length > 0) {
    console.log(`  Fixed Chinese commas: ${fixedComma.join(', ')}`);
  }
  if (warned.length > 0) {
    console.log(`  No matching old article: ${warned.join(', ')}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
