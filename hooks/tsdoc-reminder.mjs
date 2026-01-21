#!/usr/bin/env node

/**
 * PostToolUse Hook: TSDoc Reminder
 * public API 작성 시 TSDoc 문서화 리마인더
 */

import { readFileSync } from 'fs';

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * TSDoc 리마인더 대상 파일인지 확인
 */
function shouldRemind(filePath) {
  if (!filePath) return false;

  // TypeScript 파일만 대상
  if (!/\.ts$/.test(filePath)) return false;

  // 제외 패턴
  const excludePatterns = [
    /\.spec\.ts$/,
    /\.test\.ts$/,
    /\.e2e-spec\.ts$/,
    /\.d\.ts$/,
    /\.module\.ts$/,
    /index\.ts$/,
    /main\.ts$/,
  ];

  return !excludePatterns.some(pattern => pattern.test(filePath));
}

/**
 * 파일에서 문서화되지 않은 export 찾기
 */
function findUndocumentedExports(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const undocumented = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // export 문 찾기
      const exportMatch = line.match(/^export\s+(async\s+)?function\s+(\w+)|^export\s+class\s+(\w+)|^export\s+interface\s+(\w+)|^export\s+type\s+(\w+)|^export\s+enum\s+(\w+)/);

      if (exportMatch) {
        // 바로 위 라인들 확인 (TSDoc 존재 여부)
        let hasDoc = false;
        for (let j = i - 1; j >= 0 && j >= i - 5; j--) {
          const prevLine = lines[j].trim();
          if (prevLine === '') continue;
          if (prevLine.endsWith('*/')) {
            hasDoc = true;
            break;
          }
          if (prevLine && !prevLine.startsWith('*') && !prevLine.startsWith('//')) {
            break;
          }
        }

        if (!hasDoc) {
          // export 이름 추출
          const name = exportMatch[2] || exportMatch[3] || exportMatch[4] || exportMatch[5] || exportMatch[6];
          if (name) {
            undocumented.push({
              name,
              line: i + 1,
              type: exportMatch[2] ? 'function' :
                    exportMatch[3] ? 'class' :
                    exportMatch[4] ? 'interface' :
                    exportMatch[5] ? 'type' : 'enum'
            });
          }
        }
      }
    }

    return undocumented;
  } catch {
    return [];
  }
}

/**
 * 리마인더 메시지 생성
 */
function generateReminder(filePath, undocumented) {
  if (undocumented.length === 0) return null;

  const items = undocumented
    .slice(0, 5)  // 최대 5개만 표시
    .map(item => `  • ${item.name} (${item.type}, line ${item.line})`)
    .join('\n');

  const moreCount = undocumented.length > 5 ? `\n  ... 외 ${undocumented.length - 5}개` : '';

  return `<tsdoc-reminder>
[TSDoc 문서화 리마인더]
문서화되지 않은 public API:
${items}${moreCount}

권장 조치:
→ /tsdoc-generate ${filePath}

TSDoc 표준: https://tsdoc.org/
</tsdoc-reminder>`;
}

async function main() {
  try {
    const input = await readStdin();
    const data = JSON.parse(input);

    const toolInput = data.toolInput || {};
    const filePath = toolInput.file_path || toolInput.filePath || '';

    if (shouldRemind(filePath)) {
      const undocumented = findUndocumentedExports(filePath);

      if (undocumented.length > 0) {
        const reminder = generateReminder(filePath, undocumented);
        if (reminder) {
          console.log(JSON.stringify({
            continue: true,
            message: reminder
          }));
          return;
        }
      }
    }

    console.log(JSON.stringify({ continue: true }));
  } catch (error) {
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
