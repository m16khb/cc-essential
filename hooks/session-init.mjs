#!/usr/bin/env node
/**
 * SessionStart Hook: Plugin Initialization
 * 프로젝트 타입 감지 및 권장 도구 안내
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

function detectProjectType() {
  const cwd = process.cwd();

  try {
    // NestJS 감지
    if (existsSync(join(cwd, 'nest-cli.json'))) {
      return 'nestjs';
    }

    const pkgPath = join(cwd, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['@nestjs/core']) return 'nestjs';
      if (deps['next']) return 'nextjs';
      if (deps['express']) return 'express';
    }
  } catch {
    // Ignore
  }

  return 'unknown';
}

async function main() {
  try {
    await readStdin();
    const projectType = detectProjectType();

    if (projectType === 'nestjs') {
      console.log(JSON.stringify({
        continue: true,
        message: `<cc-essential-init>
[cc-essential 활성화] NestJS 프로젝트

권장 명령어:
- /atomic-commit - Conventional Commit 분리
- /test-scaffold <file> - 테스트 스캐폴딩
- /tsdoc-generate <file> - TSDoc 생성

활성화된 자동 훅:
- Swagger 체크리스트 (DTO/Controller 편집 시)
- 테스트 리마인더 (Service/Controller 편집 시)
- API Breaking Change 감지
</cc-essential-init>`
      }));
      return;
    }

    console.log(JSON.stringify({ continue: true }));
  } catch {
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
