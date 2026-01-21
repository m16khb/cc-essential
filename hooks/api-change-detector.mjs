#!/usr/bin/env node

/**
 * PostToolUse Hook: API Change Detector
 * Controller/DTO 파일 변경 시 Breaking Change 감지 및 경고
 */

import { execSync } from 'child_process';
// fs module not needed for this hook

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * API 관련 파일인지 확인
 */
function isApiFile(filePath) {
  if (!filePath) return false;

  const apiPatterns = [
    /\.controller\.ts$/,
    /\.dto\.ts$/,
    /response\.ts$/,
    /request\.ts$/,
  ];

  return apiPatterns.some(pattern => pattern.test(filePath));
}

/**
 * Git diff로 변경 내용 분석
 */
function analyzeChanges(filePath) {
  try {
    // staged 또는 unstaged diff 확인
    let diff = '';
    try {
      diff = execSync(`git diff HEAD -- "${filePath}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch {
      // git diff 실패 시 빈 문자열
      return null;
    }

    if (!diff || diff.trim() === '') {
      return null;
    }

    const changes = {
      breaking: [],
      added: [],
      changed: [],
      deprecated: [],
    };

    const lines = diff.split('\n');

    for (const line of lines) {
      // Breaking Changes 감지

      // 필드/프로퍼티 삭제
      if (line.startsWith('-') && !line.startsWith('---')) {
        if (/@ApiProperty/.test(line)) {
          const match = line.match(/(\w+)[\s:]/);
          if (match) {
            changes.breaking.push({
              type: 'field_removed',
              name: match[1],
              detail: 'API 필드 삭제됨'
            });
          }
        }

        // 엔드포인트 삭제
        if (/@(Get|Post|Put|Delete|Patch)\(/.test(line)) {
          const match = line.match(/@(Get|Post|Put|Delete|Patch)\(['"]([^'"]*)['"]\)/);
          if (match) {
            changes.breaking.push({
              type: 'endpoint_removed',
              method: match[1],
              path: match[2] || '/',
              detail: '엔드포인트 삭제됨'
            });
          }
        }
      }

      // 추가 감지
      if (line.startsWith('+') && !line.startsWith('+++')) {
        if (/@ApiProperty/.test(line)) {
          const match = line.match(/(\w+)[\s:]/);
          if (match) {
            changes.added.push({
              type: 'field_added',
              name: match[1],
              detail: 'API 필드 추가됨'
            });
          }
        }

        // 새 엔드포인트
        if (/@(Get|Post|Put|Delete|Patch)\(/.test(line)) {
          const match = line.match(/@(Get|Post|Put|Delete|Patch)\(['"]([^'"]*)['"]\)/);
          if (match) {
            changes.added.push({
              type: 'endpoint_added',
              method: match[1],
              path: match[2] || '/',
              detail: '엔드포인트 추가됨'
            });
          }
        }

        // Deprecation 추가
        if (/@Deprecated|deprecated:\s*true/.test(line)) {
          changes.deprecated.push({
            type: 'deprecation_added',
            detail: 'Deprecation 마킹 추가됨'
          });
        }
      }

      // 타입 변경 감지 (- line과 + line 비교)
      // 간단한 휴리스틱: 같은 필드명인데 타입이 다른 경우
    }

    return changes;
  } catch (error) {
    return null;
  }
}

/**
 * 알림 메시지 생성
 */
function generateAlert(filePath, changes) {
  const hasBreaking = changes.breaking.length > 0;
  const hasChanges = changes.added.length > 0 ||
                     changes.changed.length > 0 ||
                     changes.deprecated.length > 0;

  if (!hasBreaking && !hasChanges) {
    return null;
  }

  let message = '';

  if (hasBreaking) {
    message += `<api-change-alert>
⚠️ Breaking Change 감지!

파일: ${filePath}
`;

    for (const change of changes.breaking) {
      if (change.type === 'field_removed') {
        message += `- 삭제된 필드: ${change.name}\n`;
      } else if (change.type === 'endpoint_removed') {
        message += `- 삭제된 엔드포인트: ${change.method} ${change.path}\n`;
      }
    }

    message += `
영향도 분석 및 CHANGELOG 업데이트 권장:
→ "api-changelog 업데이트해줘"

Migration deadline 설정 권장 (최소 24개월)
</api-change-alert>`;
  } else if (hasChanges) {
    message += `<api-change-info>
[API 변경 감지]

파일: ${filePath}
`;

    if (changes.added.length > 0) {
      message += `\n추가됨:\n`;
      for (const change of changes.added.slice(0, 3)) {
        if (change.type === 'field_added') {
          message += `  + 필드: ${change.name}\n`;
        } else if (change.type === 'endpoint_added') {
          message += `  + 엔드포인트: ${change.method} ${change.path}\n`;
        }
      }
    }

    if (changes.deprecated.length > 0) {
      message += `\nDeprecation 추가됨 (CHANGELOG 업데이트 권장)\n`;
    }

    message += `</api-change-info>`;
  }

  return message;
}

async function main() {
  try {
    const input = await readStdin();
    const data = JSON.parse(input);

    const toolInput = data.toolInput || {};
    const filePath = toolInput.file_path || toolInput.filePath || '';

    if (isApiFile(filePath)) {
      const changes = analyzeChanges(filePath);

      if (changes) {
        const alert = generateAlert(filePath, changes);
        if (alert) {
          console.log(JSON.stringify({
            continue: true,
            message: alert
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
