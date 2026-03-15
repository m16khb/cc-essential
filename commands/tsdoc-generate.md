---
description: 함수/클래스의 TSDoc 자동 생성
argument-hint: "<file-path> [--lang=ko|en]"
model: haiku
allowed-tools:
  - Read
  - Edit
  - Glob
  - Grep
---

# TSDoc Generator

TypeScript 파일의 public API에 대해 TSDoc 표준 문서를 자동 생성한다.

## TSDoc vs JSDoc

TSDoc은 TypeScript 전용 표준으로, JSDoc의 타입 명시 (`{Type}`)가 불필요하다.
- 공식 표준: https://tsdoc.org/
- eslint-plugin-tsdoc으로 린팅 가능
- Microsoft Rushstack 툴체인과 호환

## 아규먼트 처리

| 아규먼트 | 설명 | 기본값 |
|----------|------|--------|
| `<file-path>` | 문서화 대상 파일 경로 | 필수 |
| `--lang=ko` | 설명 언어 (ko/en) | ko |
| `--all` | 파일 내 모든 export 문서화 | - |

## 실행 단계

### 1. 대상 파일 분석

Read 도구로 파일을 읽고 문서화 대상 추출:

```typescript
// 문서화 대상
export function formatDate(date: Date, format?: string): string
export class UserService
export interface UserResponse
export type UserId = string
export const DEFAULT_LIMIT = 10
export enum UserRole
```

### 2. 기존 TSDoc 확인

이미 문서화된 항목은 스킵:

```typescript
/**
 * 이미 문서화됨 - 스킵
 */
export function alreadyDocumented() {}

// 문서 없음 - 대상
export function needsDocumentation() {}
```

### 3. 코드베이스에서 사용 예시 탐색

```bash
# 함수 사용처 찾기
grep -r "formatDate(" --include="*.ts" | head -5
```

실제 사용 예시를 @example에 반영.

### 4. TSDoc 생성

**함수/메서드:**

```typescript
/**
 * 주어진 날짜를 지정된 형식으로 포맷합니다.
 *
 * @param date - 포맷할 날짜 객체
 * @param format - 날짜 형식 문자열 (기본값: 'YYYY-MM-DD')
 * @returns 포맷된 날짜 문자열
 * @throws {@link InvalidDateError} 유효하지 않은 날짜인 경우
 *
 * @example
 * ```typescript
 * // 기본 형식
 * formatDate(new Date('2025-01-15'));
 * // => '2025-01-15'
 *
 * // 커스텀 형식
 * formatDate(new Date('2025-01-15'), 'YYYY년 MM월 DD일');
 * // => '2025년 01월 15일'
 * ```
 *
 * @see {@link parseDate} 역변환 함수
 * @public
 */
export function formatDate(date: Date, format = 'YYYY-MM-DD'): string {
```

**클래스:**

```typescript
/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스입니다.
 *
 * @remarks
 * 이 서비스는 UserRepository를 통해 데이터베이스와 상호작용하며,
 * 캐싱 전략을 적용하여 성능을 최적화합니다.
 *
 * @example
 * ```typescript
 * // NestJS DI를 통한 주입
 * constructor(private readonly userService: UserService) {}
 *
 * // 사용자 조회
 * const user = await this.userService.findById('user-123');
 * ```
 *
 * @public
 */
@Injectable()
export class UserService {
```

**인터페이스/타입:**

```typescript
/**
 * 사용자 API 응답 형식입니다.
 *
 * @remarks
 * GET /users/:id 엔드포인트의 응답 타입으로 사용됩니다.
 *
 * @public
 */
export interface UserResponse {
  /** 사용자 고유 식별자 */
  id: string;

  /** 사용자 이메일 주소 */
  email: string;

  /** 사용자 표시 이름 */
  name: string;

  /** 계정 생성 일시 */
  createdAt: Date;
}
```

**Enum:**

```typescript
/**
 * 사용자 역할을 정의하는 열거형입니다.
 *
 * @public
 */
export enum UserRole {
  /** 일반 사용자 */
  USER = 'USER',

  /** 관리자 권한 */
  ADMIN = 'ADMIN',

  /** 슈퍼 관리자 권한 */
  SUPER_ADMIN = 'SUPER_ADMIN',
}
```

### 5. TSDoc 태그 가이드

| 태그 | 용도 | 예시 |
|------|------|------|
| `@param` | 파라미터 설명 | `@param userId - 사용자 ID` |
| `@returns` | 반환값 설명 | `@returns 사용자 객체` |
| `@throws` | 발생 가능 예외 | `@throws {@link NotFoundError}` |
| `@example` | 사용 예시 | 코드 블록 포함 |
| `@remarks` | 추가 설명 | 상세 구현 노트 |
| `@see` | 관련 참조 | `@see {@link OtherClass}` |
| `@deprecated` | 폐기 예정 | `@deprecated v2.0에서 제거 예정` |
| `@public` | 공개 API | - |
| `@internal` | 내부 API | - |
| `@beta` | 베타 기능 | - |

### 6. 결과 출력

```
✅ TSDoc 생성 완료

파일: src/utils/date.util.ts

문서화된 항목:
├── formatDate (함수) - 새로 추가
├── parseDate (함수) - 새로 추가
├── DateFormat (타입) - 새로 추가
└── DEFAULT_FORMAT (상수) - 이미 존재, 스킵

Edit 도구로 4개 항목 문서화 완료
```

## 일괄 처리

```bash
/tsdoc-generate src/utils/ --all
```

디렉토리 내 모든 TypeScript 파일 처리.

## 주의사항

- private/protected 멤버는 @internal 태그 사용
- 기존 TSDoc이 있으면 덮어쓰지 않음
- @example은 실제 동작하는 코드로 작성
- 한글 설명 시 자연스러운 존댓말 사용
