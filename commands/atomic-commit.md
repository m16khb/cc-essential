---
description: 변경 사항을 분석하여 의미 있는 단위로 분리하고 Conventional Commit 형태로 커밋
argument-hint: "[--dry-run]"
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - Task
  - AskUserQuestion
  - TodoWrite
---

# Atomic Commit

변경 사항을 분석하여 논리적 단위로 분리하고, Conventional Commit 형태로 순차 커밋한다.

## 실행 단계

### 1. 변경 사항 수집

다음 git 명령어로 현재 상태를 파악한다:

```bash
# staged 변경 사항
git diff --cached --name-status

# unstaged 변경 사항
git diff --name-status

# untracked 파일
git ls-files --others --exclude-standard
```

### 2. 변경 내용 분석

각 변경 파일의 내용을 분석한다:

```bash
# staged 파일의 diff
git diff --cached -- <file>

# unstaged 파일의 diff
git diff -- <file>
```

### 3. commit-analyzer Agent 호출

Task 도구로 commit-analyzer 에이전트를 호출하여 변경 사항을 논리적 단위로 분리한다:

```
분석 요청:
- 변경된 파일 목록과 각 파일의 diff 내용
- 분리 기준: 의미 기반 + 모듈 기반
- 출력: 그룹별 파일 목록과 커밋 메시지 제안
```

### 4. 사용자 확인

분석 결과를 사용자에게 보여주고 확인받는다:

```
📊 변경 사항 분석 결과:
┌─────────────────────────────────────────────────────────────┐
│ 커밋 1: feat(user): 사용자 프로필 API 추가                    │
│   - src/modules/user/user.controller.ts                     │
│   - src/modules/user/user.service.ts                        │
│   - src/modules/user/dto/profile.dto.ts                     │
├─────────────────────────────────────────────────────────────┤
│ 커밋 2: fix(auth): JWT 토큰 만료 처리 버그 수정               │
│   - src/common/guards/jwt-auth.guard.ts                     │
└─────────────────────────────────────────────────────────────┘

이대로 커밋할까요?
```

AskUserQuestion으로 다음 선택지를 제공한다:
- 승인: 제안대로 커밋 실행
- 수정: 커밋 그룹 또는 메시지 수정
- 취소: 작업 취소

### 5. 순차 커밋 실행

승인된 경우, 각 그룹별로 순차 커밋을 실행한다:

```bash
# 그룹 1의 파일들을 staging
git add <file1> <file2> ...

# 커밋 생성
git commit -m "<type>(<scope>): <description>"
```

각 커밋이 성공하면 다음 그룹으로 진행한다.

### 6. 결과 보고

모든 커밋이 완료되면 결과를 보고한다:

```
✅ 커밋 완료!

생성된 커밋:
1. abc1234 - feat(user): 사용자 프로필 API 추가
2. def5678 - fix(auth): JWT 토큰 만료 처리 버그 수정

총 2개 커밋, 5개 파일 변경
```

## --dry-run 옵션

`--dry-run` 인자가 있으면:
- 분석 결과만 보여주고 실제 커밋은 실행하지 않는다
- "dry-run 모드: 실제 커밋은 실행되지 않았습니다" 메시지 표시

## Conventional Commit Prefix

| Type | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 코드 리팩토링 |
| `docs` | 문서 변경 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드/설정 변경 |
| `style` | 코드 스타일 변경 |
| `perf` | 성능 개선 |
| `ci` | CI/CD 변경 |
| `build` | 빌드 시스템 변경 |

## 커밋 메시지 형식

```
<type>(<scope>): <한글 설명>
```

예시:
- `feat(user): 사용자 프로필 조회 API 추가`
- `fix(auth): 토큰 갱신 시 만료 체크 누락 수정`
- `refactor(cache): Redis 연결 풀 관리 개선`

## 분리 기준

### 의미 기반
- 새 기능 추가 → `feat`
- 버그 수정 → `fix`
- 코드 개선 → `refactor`
- 테스트 → `test`

### 모듈 기반
- 같은 모듈의 변경은 하나의 커밋으로
- 다른 모듈의 변경은 분리

### 롤백 가능성
- 독립적으로 롤백할 수 있는 단위로 분리
- 의존성이 있는 변경은 하나의 커밋으로

## 주의사항

- 변경 사항이 없으면 "커밋할 변경 사항이 없습니다" 메시지 표시
- git 저장소가 아니면 에러 메시지 표시
- 커밋 실패 시 롤백하고 에러 보고
