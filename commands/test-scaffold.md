---
description: 소스 파일 분석하여 테스트 파일 스캐폴딩 생성
argument-hint: "<file-path> [--style=aaa|gwt]"
model: claude-haiku-4-5
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
---

# Test Scaffolder

소스 파일을 분석하여 NestJS Testing Module 패턴 기반의 테스트 파일을 자동 생성한다.

## 아규먼트 처리

| 아규먼트 | 설명 | 기본값 |
|----------|------|--------|
| `<file-path>` | 테스트 대상 소스 파일 경로 | 필수 |
| `--style=aaa` | AAA 패턴 (Arrange-Act-Assert) | 기본값 |
| `--style=gwt` | GWT 패턴 (Given-When-Then) | - |

## 실행 단계

### 1. 대상 파일 분석

```bash
# 파일 존재 확인
ls <file-path>

# 기존 테스트 파일 확인
ls <file-path>.spec.ts 2>/dev/null || echo "No existing test"
```

### 2. 소스 코드 분석

Read 도구로 소스 파일을 읽고 다음을 추출한다:

- **클래스명**: `export class UserService`
- **메서드**: public 메서드 목록
- **의존성**: constructor 파라미터 (DI 대상)
- **예외**: throw 문 분석
- **반환 타입**: Promise, Observable 등

### 3. 프로젝트 테스트 패턴 감지

```bash
# 기존 테스트 파일 샘플링
find . -name "*.spec.ts" -type f | head -3
```

기존 테스트 파일에서 다음을 학습:
- beforeEach 패턴
- Mock 생성 방식
- describe/it 구조

### 4. 테스트 파일 생성

**NestJS Service 테스트 템플릿:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { {ClassName} } from './{filename}';
// ... 의존성 imports

describe('{ClassName}', () => {
  let service: {ClassName};
  let module: TestingModule;
  // Mock 선언

  beforeEach(async () => {
    // Mock 초기화
    const mock{Dependency} = {
      // 메서드별 jest.fn()
    };

    module = await Test.createTestingModule({
      providers: [
        {ClassName},
        {
          provide: {Dependency},
          useValue: mock{Dependency},
        },
      ],
    }).compile();

    service = module.get<{ClassName}>({ClassName});
  });

  afterEach(async () => {
    await module.close();
  });

  describe('{methodName}', () => {
    it('should {expected behavior} when {condition}', async () => {
      // Arrange
      const input = {};
      const expected = {};
      mock{Dependency}.{method}.mockResolvedValue(expected);

      // Act
      const result = await service.{methodName}(input);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should throw {Exception} when {error condition}', async () => {
      // Arrange
      mock{Dependency}.{method}.mockResolvedValue(null);

      // Act & Assert
      await expect(service.{methodName}('invalid'))
        .rejects.toThrow({Exception});
    });
  });
});
```

**NestJS Controller 테스트 템플릿:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { {ClassName} } from './{filename}';
import { {ServiceName} } from './{service-filename}';

describe('{ClassName}', () => {
  let controller: {ClassName};
  let module: TestingModule;
  let mockService: jest.Mocked<{ServiceName}>;

  beforeEach(async () => {
    mockService = {
      // 서비스 메서드별 jest.fn()
    } as any;

    module = await Test.createTestingModule({
      controllers: [{ClassName}],
      providers: [
        {
          provide: {ServiceName},
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<{ClassName}>({ClassName});
  });

  afterEach(async () => {
    await module.close();
  });

  describe('{methodName}', () => {
    it('should return {expected} when {condition}', async () => {
      // Arrange
      const dto = {};
      const expected = {};
      mockService.{serviceMethod}.mockResolvedValue(expected);

      // Act
      const result = await controller.{methodName}(dto);

      // Assert
      expect(result).toEqual(expected);
      expect(mockService.{serviceMethod}).toHaveBeenCalledWith(dto);
    });
  });
});
```

### 5. 테스트 케이스 생성 규칙

각 public 메서드에 대해:

1. **Happy Path**: 정상 동작 테스트
2. **Error Cases**: throw 문 기반 예외 테스트
3. **Edge Cases**:
   - null/undefined 입력
   - 빈 배열/객체
   - 경계값

### 6. 결과 출력

```
✅ 테스트 파일 생성 완료

파일: src/modules/user/user.service.spec.ts

생성된 테스트:
├── describe('UserService')
│   ├── describe('findById')
│   │   ├── it('should return user when found')
│   │   └── it('should throw NotFoundException when not found')
│   ├── describe('create')
│   │   ├── it('should create and return user')
│   │   └── it('should throw ConflictException on duplicate email')
│   └── describe('update')
│       └── it('should update user fields')

총 5개 테스트 케이스 생성
```

## 파일 타입별 처리

| 파일 패턴 | 테스트 타입 | 특이사항 |
|-----------|------------|----------|
| `*.service.ts` | Unit Test | DI Mock 필수 |
| `*.controller.ts` | Unit Test | Service Mock |
| `*.guard.ts` | Unit Test | ExecutionContext Mock |
| `*.interceptor.ts` | Unit Test | CallHandler Mock |
| `*.pipe.ts` | Unit Test | ArgumentMetadata Mock |
| `*.util.ts` | Unit Test | 순수 함수 테스트 |
| `*.repository.ts` | Integration | DB 연결 필요 시 Skip |

## 주의사항

- 기존 테스트 파일이 있으면 덮어쓰지 않고 경고
- private 메서드는 테스트 대상에서 제외
- 순환 의존성 감지 시 경고
- jest.mock 보다 DI 기반 Mock 선호
