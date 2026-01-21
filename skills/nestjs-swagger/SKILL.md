---
name: nestjs-swagger
description: NestJS Swagger/DTO 문서화 가이드. DTO 작성/수정, Swagger 데코레이터 추가, API 문서화 관련 작업 시 활성화.
---

# NestJS Swagger Documentation Skill

이 프로젝트의 Swagger/DTO 문서화 규칙을 제공합니다.

## 핵심 원칙

1. **모든 프로퍼티에 description과 example 필수**
2. **Validator 데코레이터와 Swagger 속성 일치**
3. **description은 한글, example은 실제 값**
4. **커스텀 밸리데이터 적극 활용**

## Quick Reference

### Request DTO 템플릿

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString } from 'class-validator'

export class ExampleRequestDto {
  @ApiProperty({
    description: '필수 필드 설명',
    example: 'example_value',
  })
  @IsString()
  requiredField!: string

  @ApiPropertyOptional({
    description: '선택 필드 설명',
    example: 'optional_value',
  })
  @IsOptional()
  @IsString()
  optionalField?: string
}
```

### Response DTO 템플릿

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ExampleResponseDto {
  @ApiProperty({ description: 'ID', example: 1 })
  id!: number

  @ApiProperty({ description: '생성일시' })
  createdAt!: Date

  @ApiPropertyOptional({ description: '선택 응답 필드' })
  optionalField?: string
}
```

### Controller 문서화 패턴

```typescript
@ApiTags('Resource')
@Controller('resource')
export class ExampleController {
  @Post()
  @ApiOperation({
    summary: '리소스 생성',
    description: '새로운 리소스를 생성합니다',
  })
  @ApiResponse({ status: 201, description: '생성 성공', type: ExampleResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async create(@Body() dto: ExampleRequestDto): Promise<ExampleResponseDto> {}
}
```

## Validator-Swagger 매핑

| Validator | Swagger 속성 | 예시 |
|-----------|-------------|------|
| `@IsIn([...OPTIONS])` | `enum: OPTIONS` | `enum: SUPPORTED_SYMBOLS` |
| `@Min(n)` | `minimum: n` | `minimum: 0` |
| `@Max(n)` | `maximum: n` | `maximum: 100` |
| `@IsOptional()` | `@ApiPropertyOptional()` | 필수 → 선택 |
| `@IsISO8601()` | ISO 8601 example | `example: '2024-01-01T00:00:00Z'` |
| `@IsPositiveInteger()` | 양의 정수 example | `example: 1` |
| `@IsSimilarityRange()` | 0~1 범위 | `minimum: 0, maximum: 1` |

## 상세 가이드

- DTO 템플릿: [references/dto-templates.md](references/dto-templates.md)
- Controller 패턴: [references/controller-patterns.md](references/controller-patterns.md)
- 커스텀 밸리데이터: [references/custom-validators.md](references/custom-validators.md)
