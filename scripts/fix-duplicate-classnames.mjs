#!/usr/bin/env node
/**
 * Fixes duplicate className attributes in JSX elements across the codebase.
 * Patterns handled:
 *   className="A"  +  className="B"      →  className="A B"
 *   className="A"  +  className={expr}   →  className={`A ${expr}`}
 *   className={expr}  +  className="B"   →  className={`${expr} B`}
 *   className={e1}  +  className={e2}    →  className={`${e1} ${e2}`}
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Extract the full attribute value starting at `pos` in `src`.
 *  Handles "string", 'string', {balanced braces (with nested strings)} */
function extractValue(src, pos) {
  const ch = src[pos];
  if (ch === '"' || ch === "'") {
    let i = pos + 1;
    while (i < src.length) {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === ch) return src.slice(pos, i + 1);
      i++;
    }
    return null;
  }
  if (ch === '{') {
    let depth = 0, i = pos, inStr = false, strCh = '';
    while (i < src.length) {
      const c = src[i];
      if (inStr) {
        if (c === '\\') { i += 2; continue; }
        if (c === strCh) inStr = false;
      } else {
        if (c === '"' || c === "'" || c === '`') { inStr = true; strCh = c; }
        else if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return src.slice(pos, i + 1); }
      }
      i++;
    }
    return null;
  }
  return null;
}

/** Merge two className values into one.
 *  val1 / val2 are the full value tokens, e.g. "foo bar" or {cond ? "a" : "b"} */
function mergeValues(val1, val2) {
  const s1 = val1.startsWith('"') || val1.startsWith("'");
  const s2 = val2.startsWith('"') || val2.startsWith("'");

  if (s1 && s2) {
    const inner1 = val1.slice(1, -1);
    const inner2 = val2.slice(1, -1);
    const sep = (inner1 && inner2) ? ' ' : '';
    return `"${inner1}${sep}${inner2}"`;
  }
  if (s1) {
    const inner1 = val1.slice(1, -1);
    const expr2  = val2.slice(1, -1);  // strip { }
    if (!inner1) return val2;           // empty first string → keep second
    return `{\`${inner1} \${${expr2}}\`}`;
  }
  if (s2) {
    const expr1  = val1.slice(1, -1);
    const inner2 = val2.slice(1, -1);
    if (!inner2) return val1;           // empty second string → keep first
    return `{\`\${${expr1}} ${inner2}\`}`;
  }
  // both expressions
  const expr1 = val1.slice(1, -1);
  const expr2 = val2.slice(1, -1);
  return `{\`\${${expr1}} \${${expr2}}\`}`;
}

/** Return true if c would close a JSX opening tag at this point
 *  (i.e. we see '>' or '/>' outside of any string / brace nesting). */
function processFile(src) {
  // We scan the source, tracking JSX opening-tag context.
  // When we find className= inside a tag, we record its position.
  // If we find a second className= in the same tag, we merge and remove the first.

  let result = src;
  let offset = 0;          // rolling offset due to replacements
  let iterations = 0;

  // Repeat until no more duplicates (handles >2 className on one element)
  while (iterations++ < 50) {
    const changed = runOnePass(result);
    if (changed === null) break;
    result = changed;
  }
  return result;
}

function runOnePass(src) {
  // Find the first JSX opening tag that has two className= attributes.
  // Returns modified src, or null if nothing to do.

  // State machine to scan character-by-character
  let i = 0;
  while (i < src.length) {
    // Look for < followed by a letter (JSX/HTML opening tag)
    if (src[i] !== '<') { i++; continue; }
    if (i + 1 >= src.length) break;
    const nextCh = src[i + 1];
    if (!/[A-Za-z]/.test(nextCh)) { i++; continue; }

    // We're at the start of a JSX opening tag. Scan to its end.
    const tagStart = i;
    let j = i + 1;
    // Skip tag name
    while (j < src.length && /[A-Za-z0-9._-]/.test(src[j])) j++;

    // Now scan attributes until we hit the closing > or />
    // Track positions/values of className= occurrences
    const classNames = []; // { attrStart, attrEnd, eqPos, valStart, valEnd, value }
    let depth = 0;        // brace depth
    let inStr = false, strCh = '';
    let tagEnd = -1;

    while (j < src.length) {
      const c = src[j];

      if (inStr) {
        if (c === '\\') { j += 2; continue; }
        if (c === strCh) inStr = false;
        j++;
        continue;
      }

      if (c === '"' || c === "'" || c === '`') {
        inStr = true; strCh = c;
        j++;
        continue;
      }

      if (c === '{') { depth++; j++; continue; }
      if (c === '}') { depth--; j++; continue; }

      if (depth === 0) {
        // Check for tag-closing > or />
        if (c === '/' && src[j + 1] === '>') { tagEnd = j + 2; break; }
        if (c === '>') { tagEnd = j + 1; break; }

        // Check for className=
        if (src.slice(j, j + 10) === 'className=') {
          const attrStart = j;
          const eqPos = j + 9;
          const valStart = eqPos + 1;
          const val = extractValue(src, valStart);
          if (val) {
            const valEnd = valStart + val.length;
            classNames.push({ attrStart, eqPos, valStart, valEnd, value: val });
            j = valEnd;
            continue;
          }
        }
      }

      j++;
    }

    if (tagEnd === -1) { i++; continue; } // unclosed tag, skip

    if (classNames.length >= 2) {
      // Merge first two classNames, remove second attribute
      const cn1 = classNames[0];
      const cn2 = classNames[1];

      const merged = mergeValues(cn1.value, cn2.value);

      // Build new src: replace cn1's value, delete cn2's whole attribute
      // cn2 attribute spans: from cn2.attrStart to cn2.valEnd
      // But we must also remove any leading whitespace before cn2.attrStart

      // Find leading whitespace before cn2 attribute
      let wsStart = cn2.attrStart;
      // Walk back to remove leading whitespace/newline
      while (wsStart > 0 && /[ \t\r\n]/.test(src[wsStart - 1])) wsStart--;
      // Actually we want to keep at least the newline structure - let's just remove
      // the attribute text and one preceding space if any
      let removeStart = cn2.attrStart;
      // remove one leading space or newline+indent before cn2
      if (removeStart > 0 && src[removeStart - 1] === ' ') removeStart--;
      else if (removeStart > 0 && /\s/.test(src[removeStart - 1])) {
        // walk back to start of whitespace run
        let k = removeStart - 1;
        while (k > 0 && src[k - 1] !== '\n') k--;
        removeStart = k; // remove from start of that whitespace run
      }

      const newSrc =
        src.slice(0, cn1.valStart) +
        merged +
        src.slice(cn1.valEnd, removeStart) +
        src.slice(cn2.valEnd);

      return newSrc;
    }

    i = tagEnd;
  }

  return null; // no changes
}

// ─── walk directory ──────────────────────────────────────────────────────────

function walkDir(dir, exts, results = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walkDir(full, exts, results);
    else if (exts.includes(extname(entry))) results.push(full);
  }
  return results;
}

// ─── main ────────────────────────────────────────────────────────────────────

const root = new URL('../artifacts/sahu-csc/src', import.meta.url).pathname;
const files = walkDir(root, ['.tsx', '.ts', '.jsx', '.js']);

let totalFixed = 0;
const changedFiles = [];

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const fixed = processFile(original);
  if (fixed !== original) {
    writeFileSync(file, fixed, 'utf8');
    const rel = file.replace(root + '/', '');
    // Count how many merges happened
    const countBefore = (original.match(/className=/g) || []).length;
    const countAfter  = (fixed.match(/className=/g) || []).length;
    const merges = countBefore - countAfter;
    changedFiles.push({ file: rel, merges });
    totalFixed += merges;
    console.log(`✅ ${rel}  (${merges} merge${merges !== 1 ? 's' : ''})`);
  }
}

console.log(`\nDone. ${totalFixed} duplicate className attribute${totalFixed !== 1 ? 's' : ''} merged across ${changedFiles.length} file${changedFiles.length !== 1 ? 's' : ''}.`);
