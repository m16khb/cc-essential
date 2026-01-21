# cc-essential

Claude Code 필수 플러그인 모음.

## 기능

### 1. Atomic Commit
- **변경 사항 분석**: staged/unstaged 파일의 내용을 분석
- **논리적 단위 분리**: 의미 기반 + 모듈 기반으로 변경 사항 그룹화
- **Conventional Commit**: 표준 prefix (feat, fix, refactor 등) 자동 적용
- **한글 커밋 메시지**: 자연스러운 한글 커밋 메시지 생성

### 2. NestJS Swagger Documentation
- **자동 체크리스트**: DTO/Controller 파일 편집 시 Swagger 문서화 체크리스트 자동 표시
- **문서화 리뷰**: swagger-reviewer 에이전트로 문서화 완성도 분석
- **베스트 프랙티스**: nestjs-swagger 스킬로 DTO/Controller 패턴 가이드

## 설치

```bash
# GitHub에서 클론
git clone https://github.com/m16khb/cc-essential.git ~/.claude/plugins/cc-essential

# 또는 플러그인 디렉토리에 복사
cp -r cc-essential ~/.claude/plugins/
```

## 사용법

```bash
# 변경 사항 분석 및 분리 커밋
/atomic-commit

# 분석 결과만 미리보기 (dry-run)
/atomic-commit --dry-run
```

## 예시

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
├─────────────────────────────────────────────────────────────┤
│ 커밋 3: refactor(cache): Redis 캐시 서비스 분리               │
│   - src/common/cache/redis.service.ts                       │
│   - src/common/cache/cache.module.ts                        │
└─────────────────────────────────────────────────────────────┘
```

## Conventional Commit Prefix

| Prefix | 설명 | 예시 |
|--------|------|------|
| `feat` | 새로운 기능 추가 | feat(user): 사용자 프로필 API 추가 |
| `fix` | 버그 수정 | fix(auth): 토큰 만료 처리 버그 수정 |
| `refactor` | 코드 리팩토링 | refactor(db): 쿼리 최적화 |
| `docs` | 문서 변경 | docs(readme): 설치 가이드 추가 |
| `test` | 테스트 추가/수정 | test(user): 프로필 API 테스트 추가 |
| `chore` | 빌드/설정 변경 | chore(deps): 의존성 업데이트 |
| `style` | 코드 스타일 변경 | style(lint): ESLint 규칙 적용 |
| `perf` | 성능 개선 | perf(query): 인덱스 추가로 쿼리 최적화 |
| `ci` | CI/CD 변경 | ci(github): 배포 워크플로우 추가 |
| `build` | 빌드 시스템 변경 | build(docker): Dockerfile 최적화 |

## 설정

`~/.claude/atomic-commit.local.md` 파일을 생성하여 커스터마이징할 수 있습니다:

```markdown
# atomic-commit 설정

## 커밋 메시지 언어
한글

## 추가 prefix
- hotfix: 긴급 버그 수정
- wip: 작업 중

## scope 매핑
- src/modules/user → user
- src/modules/auth → auth
- src/common → common
```

## 구성 요소

### Atomic Commit
- **Command**: `/atomic-commit` - 사용자 진입점
- **Agent**: `commit-analyzer` - 변경 사항 분석 에이전트
- **Skill**: `conventional-commit` - Conventional Commit 형식 가이드

### NestJS Swagger
- **Agents**: `swagger-reviewer`, `swagger-reviewer-low` - 문서화 완성도 분석
- **Skill**: `nestjs-swagger` - DTO/Controller Swagger 문서화 가이드
- **Hook**: `swagger-reminder` - DTO/Controller 편집 시 체크리스트 자동 표시

## Swagger 사용법

### 자동 체크리스트 (Hook)

DTO나 Controller 파일을 편집하면 자동으로 체크리스트가 표시됩니다:

```
[DTO Swagger 문서화 체크리스트]
- [ ] 모든 필수 프로퍼티에 @ApiProperty({ description, example }) 추가
- [ ] 모든 선택 프로퍼티에 @ApiPropertyOptional({ description, example }) 추가
- [ ] enum 필드: enum 속성이 validator의 @IsIn() 값과 일치
...
```

### 문서화 리뷰 (Agent)

```bash
# 상세 분석 (Sonnet 모델)
"src/modules/user/dto/ 폴더의 DTO들 swagger 문서화 리뷰해줘"

# 빠른 체크 (Haiku 모델)
"user.controller.ts의 swagger 문서화 빠르게 체크해줘"
```

### Swagger 스킬 활성화

DTO 작성, Swagger 데코레이터 추가 등의 작업 시 자동으로 `nestjs-swagger` 스킬이 활성화됩니다.

## 라이선스

MIT
