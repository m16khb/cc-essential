# cc-essential

Claude Code 필수 플러그인 모음 - 테스트, 문서화, 코드 품질을 위한 종합 도구 세트.

## 주요 기능

| 영역 | 도구 | 설명 |
|------|------|------|
| **Git** | `/atomic-commit` | 변경 사항 분석 및 Conventional Commit 분리 |
| **Swagger** | `swagger-reviewer` | NestJS DTO/Controller 문서화 리뷰 |
| **Test** | `/test-scaffold`, `coverage-advisor` | 테스트 스캐폴딩 및 커버리지 분석 |
| **Docs** | `/tsdoc-generate`, `api-changelog` | TSDoc 생성 및 API 변경 추적 |
| **Code** | `dead-code-hunter`, `dependency-auditor` | 미사용 코드/의존성 감지 |

---

## 1. Git - Atomic Commit

### 기능
- **변경 사항 분석**: staged/unstaged 파일의 내용을 분석
- **논리적 단위 분리**: 의미 기반 + 모듈 기반으로 변경 사항 그룹화
- **Conventional Commit**: 표준 prefix (feat, fix, refactor 등) 자동 적용
- **한글 커밋 메시지**: 자연스러운 한글 커밋 메시지 생성

### 사용법

```bash
# 변경 사항 분석 및 분리 커밋
/atomic-commit

# 분석 결과만 미리보기 (dry-run)
/atomic-commit --dry-run
```

### 예시 출력

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
```

---

## 2. Swagger Documentation

### 구성 요소
- **Agents**: `swagger-reviewer`, `swagger-reviewer-low` - 문서화 완성도 분석
- **Skill**: `nestjs-swagger` - DTO/Controller Swagger 문서화 가이드
- **Hook**: `swagger-reminder` - DTO/Controller 편집 시 체크리스트 자동 표시

### 자동 체크리스트

DTO나 Controller 파일을 편집하면 자동으로 체크리스트가 표시됩니다:

```
[DTO Swagger 문서화 체크리스트]
- [ ] 모든 필수 프로퍼티에 @ApiProperty({ description, example }) 추가
- [ ] 모든 선택 프로퍼티에 @ApiPropertyOptional({ description, example }) 추가
- [ ] enum 필드: enum 속성이 validator의 @IsIn() 값과 일치
```

### 문서화 리뷰

```bash
# 상세 분석 (Sonnet 모델)
"src/modules/user/dto/ 폴더의 DTO들 swagger 문서화 리뷰해줘"

# 빠른 체크 (Haiku 모델)
"user.controller.ts의 swagger 문서화 빠르게 체크해줘"
```

---

## 3. Test Tools (NEW)

### Commands

#### `/test-scaffold`
NestJS Testing Module 패턴 기반 테스트 파일 생성

```bash
# 특정 서비스의 테스트 스캐폴드 생성
/test-scaffold src/modules/user/user.service.ts

# 전체 모듈 테스트 생성
/test-scaffold src/modules/user/
```

**특징:**
- AAA 패턴 (Arrange-Act-Assert) 자동 적용
- DI 기반 Mock 자동 생성
- jest.Mocked 타입 안전성 보장
- beforeEach/afterEach 리소스 관리 포함

#### `/fixture-factory`
타입 안전한 테스트 픽스처 생성

```bash
# DTO 기반 픽스처 팩토리 생성
/fixture-factory src/modules/user/dto/create-user.dto.ts

# Entity 기반 픽스처 생성
/fixture-factory src/modules/user/entities/user.entity.ts
```

### Agents

#### `coverage-advisor` (Opus)
브랜치 커버리지 분석 및 누락 테스트 제안

```bash
"user.service.ts의 테스트 커버리지 분석해줘"
```

**분석 항목:**
- 테스트되지 않은 브랜치 식별
- Edge case 누락 감지
- 테스트 우선순위 제안

### Skills

#### `test-patterns`
NestJS 테스트 패턴 및 베스트 프랙티스 가이드

- AAA 패턴 상세 가이드
- Mock 전략 및 패턴
- NestJS Testing Module 심화
- 테스트 피라미드 권장 비율

### Hooks

#### `test-reminder`
테스트 대상 파일 편집 시 테스트 파일 존재 여부 체크

```
[테스트 리마인더]
user.service.ts에 대한 테스트 파일이 없습니다.
/test-scaffold 명령어로 테스트 스캐폴드를 생성하세요.
```

---

## 4. Documentation Tools (NEW)

### Commands

#### `/tsdoc-generate`
TSDoc 표준 문서 생성

```bash
# 특정 파일에 TSDoc 추가
/tsdoc-generate src/modules/user/user.service.ts

# 전체 모듈 문서화
/tsdoc-generate src/modules/user/
```

**TSDoc 표준:**
- `@param` - 매개변수 설명
- `@returns` - 반환값 설명
- `@throws` - 예외 설명
- `@example` - 사용 예시

### Agents

#### `api-changelog` (Opus)
Breaking Change 감지 및 API 버전 관리

```bash
"최근 API 변경 사항 분석하고 CHANGELOG 업데이트해줘"
```

**기능:**
- Breaking Change 자동 감지 (제거된 endpoint, 변경된 DTO 필드 등)
- Date-based 버전 형식 (2025.01)
- 24개월 폐기 정책 적용
- 마이그레이션 가이드 생성

#### `readme-sync` (Sonnet)
README vs 프로젝트 상태 동기화 분석

```bash
"README.md가 현재 프로젝트 상태와 동기화되어 있는지 확인해줘"
```

### Hooks

#### `tsdoc-reminder`
문서화되지 않은 public export 감지

```
[TSDoc 문서화 체크리스트]
다음 public export에 TSDoc 문서가 누락되어 있습니다:
- createUser (함수)
- UserService (클래스)
```

#### `api-change-detector`
Controller/DTO 파일의 Breaking Change 감지

```
[⚠️ API Breaking Change 감지]
다음 변경 사항이 Breaking Change일 수 있습니다:
- @Delete 데코레이터가 제거됨
- DTO 필드가 삭제됨
CHANGELOG 업데이트를 권장합니다.
```

---

## 5. Code Quality Tools (NEW)

### Agents

#### `dead-code-hunter` (Opus)
Knip 기반 미사용 코드 탐지 + NestJS 패턴 인식

```bash
"프로젝트에서 미사용 코드 찾아줘"
```

**탐지 대상:**
- 미사용 export
- 도달 불가능 코드
- 미사용 의존성
- 미사용 NestJS Provider

**NestJS 특수 패턴:**
- `@Injectable()` + `@Inject()` 패턴 인식
- Dynamic Module 패턴 예외 처리
- Custom Decorator 사용 추적

#### `dependency-auditor` (Sonnet)
의존성 보안 및 품질 감사

```bash
"프로젝트 의존성 감사해줘"
```

**감사 항목:**
- npm audit 보안 취약점
- 미사용 패키지 (depcheck)
- 중복 패키지
- 라이선스 호환성
- 버전 업데이트 권장

---

## 설치

```bash
# GitHub에서 클론
git clone https://github.com/m16khb/cc-essential.git ~/.claude/plugins/cc-essential

# 또는 플러그인 디렉토리에 복사
cp -r cc-essential ~/.claude/plugins/
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

## 구성 요소 목록

### Commands
| 명령어 | 설명 |
|--------|------|
| `/atomic-commit` | 변경 사항 분석 및 분리 커밋 |
| `/test-scaffold` | NestJS 테스트 스캐폴드 생성 |
| `/fixture-factory` | 테스트 픽스처 팩토리 생성 |
| `/tsdoc-generate` | TSDoc 문서 생성 |

### Agents
| 에이전트 | 모델 | 설명 |
|----------|------|------|
| `commit-analyzer` | Sonnet | 변경 사항 분석 |
| `swagger-reviewer` | Sonnet | Swagger 문서화 리뷰 |
| `swagger-reviewer-low` | Haiku | Swagger 빠른 체크 |
| `coverage-advisor` | Opus | 테스트 커버리지 분석 |
| `api-changelog` | Opus | API Breaking Change 감지 |
| `readme-sync` | Sonnet | README 동기화 분석 |
| `dead-code-hunter` | Opus | 미사용 코드 탐지 |
| `dependency-auditor` | Sonnet | 의존성 감사 |

### Skills
| 스킬 | 설명 |
|------|------|
| `conventional-commit` | Conventional Commit 형식 가이드 |
| `nestjs-swagger` | NestJS Swagger 문서화 가이드 |
| `test-patterns` | NestJS 테스트 패턴 가이드 |

### Hooks
| 훅 | 트리거 | 설명 |
|----|--------|------|
| `swagger-reminder` | DTO/Controller 편집 | Swagger 체크리스트 표시 |
| `test-reminder` | Service/Controller 등 편집 | 테스트 파일 존재 확인 |
| `tsdoc-reminder` | TypeScript 파일 편집 | TSDoc 누락 감지 |
| `api-change-detector` | Controller/DTO 편집 | Breaking Change 감지 |

## 라이선스

MIT
