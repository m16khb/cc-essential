# Description 작성 가이드

프론트엔드 개발자가 API를 쉽게 이해하고 사용할 수 있도록 description을 작성하는 방법입니다.

## 좋은 Description의 5가지 원칙

### 1. 목적 명시 (What & Why)

필드가 무엇인지 + 왜 필요한지 설명

```typescript
// ❌ BAD - 타입만 설명
@ApiProperty({ description: '문자열' })
email: string

// ✅ GOOD - 목적과 용도 설명
@ApiProperty({ description: '계정 인증 및 알림 수신에 사용되는 이메일 주소' })
email: string
```

### 2. 제약 조건 포함 (Constraints)

유효성 검사 규칙을 description에 명시

```typescript
// ❌ BAD - 제약 조건 누락
@ApiProperty({ description: '사용자 나이' })
@Min(18) @Max(120)
age: number

// ✅ GOOD - 제약 조건 명시
@ApiProperty({
  description: '사용자 나이 (18세 이상 120세 이하)',
  minimum: 18,
  maximum: 120
})
@Min(18) @Max(120)
age: number
```

### 3. 기본값 설명 (Defaults)

생략 시 어떻게 동작하는지 설명

```typescript
// ❌ BAD - 기본값 동작 불명확
@ApiPropertyOptional({ description: '페이지 번호' })
page?: number = 1

// ✅ GOOD - 기본값 동작 명확
@ApiPropertyOptional({
  description: '페이지 번호 (미지정 시 1페이지)',
  default: 1,
  minimum: 1
})
page?: number = 1
```

### 4. 관계 설명 (Relationships)

다른 필드나 엔드포인트와의 관계 설명

```typescript
// ❌ BAD - 관계 정보 없음
@ApiProperty({ description: '카테고리 ID' })
categoryId: string

// ✅ GOOD - 관계 정보 포함
@ApiProperty({
  description: '카테고리 ID (GET /categories에서 조회 가능)',
  example: 'cat_tech_001'
})
categoryId: string
```

### 5. Enum 값 나열 (Enum Values)

가능한 값 목록을 description에도 명시

```typescript
// ❌ BAD - enum 값만 지정
@ApiProperty({ enum: OrderStatus })
status: OrderStatus

// ✅ GOOD - description에도 값 나열
@ApiProperty({
  description: '주문 상태 (pending | processing | shipped | delivered | cancelled)',
  enum: OrderStatus,
  example: OrderStatus.PENDING
})
status: OrderStatus
```

## 타입별 Description 템플릿

### 문자열 (String)

```typescript
@ApiProperty({
  description: '[필드 목적] ([형식 설명])',
  example: '[실제 예시]',
  minLength: N,  // @Length(N, M) 사용 시
  maxLength: M,
  pattern: '^...$',  // @Matches() 사용 시
})
```

**예시:**
```typescript
@ApiProperty({
  description: '사용자 닉네임 (2~20자, 영문/숫자/한글만 허용)',
  example: 'trader123',
  minLength: 2,
  maxLength: 20,
  pattern: '^[a-zA-Z0-9가-힣]+$'
})
@Length(2, 20)
@Matches(/^[a-zA-Z0-9가-힣]+$/)
nickname: string
```

### 숫자 (Number)

```typescript
@ApiProperty({
  description: '[필드 목적] ([범위 설명])',
  example: N,
  minimum: MIN,
  maximum: MAX,
  default: DEFAULT,  // 기본값 있을 경우
})
```

**예시:**
```typescript
@ApiProperty({
  description: '검색 결과 개수 (1~100, 기본값: 10)',
  example: 10,
  minimum: 1,
  maximum: 100,
  default: 10
})
@Min(1) @Max(100)
limit: number = 10
```

### 날짜 (Date/ISO8601)

```typescript
@ApiProperty({
  description: '[필드 목적] (UTC ISO 8601 형식)',
  example: '2025-01-21T00:00:00Z',
  format: 'date-time',
})
```

**예시:**
```typescript
@ApiProperty({
  description: '조회 기준 시점 (UTC ISO 8601 형식, 미지정 시 현재 시점)',
  example: '2025-01-21T00:00:00Z',
  format: 'date-time'
})
@IsOptional()
@IsISO8601({ strict: true })
timePoint?: string
```

### 배열 (Array)

```typescript
@ApiProperty({
  description: '[필드 목적] ([요소 설명])',
  type: [ElementType],
  minItems: N,
  maxItems: M,
  example: ['item1', 'item2'],
})
```

**예시:**
```typescript
@ApiProperty({
  description: '주문할 상품 ID 목록 (1~50개)',
  type: [String],
  minItems: 1,
  maxItems: 50,
  example: ['prod_123', 'prod_456']
})
@IsArray()
@ArrayMinSize(1)
@ArrayMaxSize(50)
productIds: string[]
```

### ID/참조 필드 (Reference)

```typescript
@ApiProperty({
  description: '[리소스명] ID (GET /[endpoint]에서 조회 가능)',
  example: '[실제 ID 형식]',
})
```

**예시:**
```typescript
@ApiProperty({
  description: '카테고리 ID (GET /categories에서 조회 가능)',
  example: 'cat_tech_001'
})
categoryId: string

@ApiProperty({
  description: '사용자 ID (인증된 사용자의 고유 식별자)',
  example: 123
})
userId: number
```

## 프론트엔드 개발자가 필요로 하는 정보 체크리스트

| 정보 | 포함 여부 | 예시 |
|------|----------|------|
| 필드 목적 | ✅ 필수 | "계정 인증에 사용되는 이메일" |
| 데이터 형식 | ✅ 필수 | "ISO 8601 형식", "UUID v4" |
| 유효성 규칙 | ✅ 필수 | "2~20자", "1 이상" |
| 기본값 | ✅ 필수 (있을 때) | "미지정 시 10" |
| 가능한 값 | ✅ 필수 (enum) | "pending \| completed" |
| 관계 정보 | 🔶 권장 | "GET /categories에서 조회" |
| 부작용 | 🔶 권장 | "지정 시 이메일 발송됨" |

## 안티패턴 (피해야 할 것)

### ❌ 타입만 반복

```typescript
// BAD
@ApiProperty({ description: '문자열입니다' })
name: string
```

### ❌ 필드명만 반복

```typescript
// BAD
@ApiProperty({ description: '이메일' })
email: string
```

### ❌ 제약 조건 누락

```typescript
// BAD - validator는 있지만 description에 없음
@ApiProperty({ description: '나이' })
@Min(18) @Max(120)
age: number
```

### ❌ 기본값 미설명

```typescript
// BAD - 기본값이 있지만 description에 없음
@ApiPropertyOptional({ description: '페이지 크기' })
limit?: number = 10
```

### ❌ enum 값 미나열

```typescript
// BAD - enum이 있지만 description에 값 목록 없음
@ApiProperty({
  description: '상태',
  enum: Status
})
status: Status
```
