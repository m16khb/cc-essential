#!/usr/bin/env node
/**
 * UserPromptSubmit Hook: Keyword Detection
 * 키워드 기반 도구/에이전트 추천
 */

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

const KEYWORDS = {
  'atomic': '/atomic-commit',
  'commit': '/atomic-commit',
  '커밋': '/atomic-commit',
  'swagger': 'swagger-reviewer',
  'coverage': 'coverage-advisor',
  '커버리지': 'coverage-advisor',
  'dead code': 'dead-code-hunter',
  '미사용': 'dead-code-hunter',
  'dependency': 'dependency-auditor',
  '의존성': 'dependency-auditor',
  'testcontainer': 'test-patterns skill',
  '통합 테스트': 'test-patterns skill',
};

async function main() {
  try {
    const input = await readStdin();
    const data = JSON.parse(input);
    const prompt = (data.prompt || '').toLowerCase();

    // 키워드 매칭 (현재는 로깅/분석용, 향후 확장 가능)
    for (const [keyword, suggestion] of Object.entries(KEYWORDS)) {
      if (prompt.includes(keyword)) {
        // 힌트 로깅만 (인터럽트하지 않음)
        break;
      }
    }

    console.log(JSON.stringify({ continue: true }));
  } catch {
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
