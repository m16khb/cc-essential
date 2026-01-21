#!/usr/bin/env node

/**
 * PostToolUse Hook: Test File Reminder
 * 새 소스 파일 작성 시 테스트 파일 생성 리마인더
 */

import { existsSync } from 'fs';
import { dirname, basename, join } from 'path';

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * 테스트가 필요한 파일인지 확인
 */
function shouldRemind(filePath) {
  if (!filePath) return false;

  // 테스트 대상 패턴
  const testablePatterns = [
    /\.service\.ts$/,
    /\.controller\.ts$/,
    /\.guard\.ts$/,
    /\.interceptor\.ts$/,
    /\.pipe\.ts$/,
    /\.util\.ts$/,
    /\.helper\.ts$/,
  ];

  // 제외 패턴
  const excludePatterns = [
    /\.spec\.ts$/,
    /\.test\.ts$/,
    /\.e2e-spec\.ts$/,
    /\.d\.ts$/,
    /\.module\.ts$/,
    /index\.ts$/,
  ];

  // 제외 패턴에 매칭되면 false
  if (excludePatterns.some(pattern => pattern.test(filePath))) {
    return false;
  }

  // 테스트 대상 패턴에 매칭되면 true
  return testablePatterns.some(pattern => pattern.test(filePath));
}

/**
 * 테스트 파일 경로 생성
 */
function getTestFilePath(filePath) {
  const dir = dirname(filePath);
  const fileName = basename(filePath, '.ts');
  return join(dir, `${fileName}.spec.ts`);
}

/**
 * 테스트 파일 존재 여부 확인
 */
function testFileExists(filePath) {
  const testPath = getTestFilePath(filePath);
  return existsSync(testPath);
}

/**
 * 파일 타입에 따른 리마인더 메시지 생성
 */
function generateReminder(filePath) {
  const fileName = basename(filePath);
  const testPath = getTestFilePath(filePath);
  const relativeTestPath = testPath.replace(process.cwd() + '/', '');

  let fileType = 'File';
  if (/\.service\.ts$/.test(filePath)) fileType = 'Service';
  else if (/\.controller\.ts$/.test(filePath)) fileType = 'Controller';
  else if (/\.guard\.ts$/.test(filePath)) fileType = 'Guard';
  else if (/\.interceptor\.ts$/.test(filePath)) fileType = 'Interceptor';
  else if (/\.pipe\.ts$/.test(filePath)) fileType = 'Pipe';
  else if (/\.util\.ts$/.test(filePath)) fileType = 'Utility';
  else if (/\.helper\.ts$/.test(filePath)) fileType = 'Helper';

  return `<test-reminder>
[${fileType} 테스트 리마인더]
테스트 파일 없음: ${fileName}

권장 조치:
→ /test-scaffold ${filePath}

생성될 테스트 파일: ${relativeTestPath}
</test-reminder>`;
}

async function main() {
  try {
    const input = await readStdin();
    const data = JSON.parse(input);

    const toolInput = data.toolInput || {};
    const filePath = toolInput.file_path || toolInput.filePath || '';

    // 테스트 대상 파일이고 테스트 파일이 없는 경우에만 리마인더
    if (shouldRemind(filePath) && !testFileExists(filePath)) {
      const reminder = generateReminder(filePath);
      console.log(JSON.stringify({
        continue: true,
        message: reminder
      }));
      return;
    }

    console.log(JSON.stringify({ continue: true }));
  } catch (error) {
    // 에러 시에도 실행 계속
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
