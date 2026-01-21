# Controller Swagger Patterns

## 기본 구조

```typescript
import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger'

@ApiTags('Analysis')  // Swagger UI 그룹화
@ApiBearerAuth()      // JWT 인증 필요 표시 (전역)
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}
}
```

## 엔드포인트 문서화

### POST 요청

```typescript
@Post()
@ApiOperation({
  summary: '패턴 분석 실행',
  description: '지정된 심볼과 타임프레임에 대해 유사 패턴을 분석합니다',
})
@ApiResponse({
  status: 201,
  description: '분석 성공',
  type: AnalysisResponseDto,
})
@ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
@ApiResponse({ status: 403, description: '인증 실패' })
async analyze(@Body() dto: AnalysisRequestDto): Promise<AnalysisResponseDto> {
  return this.analysisService.analyze(dto);
}
```

### GET with Query

```typescript
@Get()
@ApiOperation({
  summary: '뉴스 목록 조회',
  description: '필터 조건에 맞는 뉴스를 페이지네이션하여 반환합니다',
})
@ApiOkResponse({
  description: '조회 성공',
  type: NewsListResponseDto,
})
async findAll(@Query() query: NewsQueryDto): Promise<NewsListResponseDto> {
  return this.newsService.findAll(query);
}
```

### GET with Param

```typescript
@Get(':id')
@ApiOperation({ summary: '뉴스 상세 조회' })
@ApiParam({ name: 'id', description: '뉴스 ID', example: 1 })
@ApiOkResponse({ type: NewsItemResponseDto })
@ApiResponse({ status: 404, description: '뉴스를 찾을 수 없음' })
async findOne(@Param('id') id: number): Promise<NewsItemResponseDto> {
  return this.newsService.findOne(id);
}
```

## 커스텀 헤더 문서화

```typescript
@Get()
@ApiHeader({
  name: 'X-Request-ID',
  description: '요청 추적용 ID',
  required: false,
})
@ApiHeader({
  name: 'Accept-Language',
  description: '응답 언어 (ko, en)',
  required: false,
  example: 'ko',
})
async findAll() {}
```

## 응답 헤더 문서화

```typescript
@Get()
@ApiOperation({ summary: '캐시된 데이터 조회' })
@ApiOkResponse({
  description: '조회 성공',
  headers: {
    'X-Cache-Hit': {
      description: '캐시 히트 여부',
      schema: { type: 'boolean' },
    },
  },
})
async findCached() {}
```

## 페이지네이션 응답 (복합 스키마)

```typescript
@Get()
@ApiExtraModels(PagePaginatedResponseDto, NewsItemResponseDto, PagePaginationMetaDto)
@ApiOkResponse({
  description: '뉴스 목록',
  schema: {
    allOf: [
      { $ref: getSchemaPath(PagePaginatedResponseDto) },
      {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(NewsItemResponseDto) },
          },
        },
      },
    ],
  },
})
async findAll(@Query() query: NewsQueryDto) {}
```

## Public 엔드포인트 (인증 불필요)

```typescript
import { Public } from '@/common/decorators'

@Get('health')
@Public()  // JWT 인증 스킵
@ApiOperation({ summary: '헬스 체크' })
async healthCheck() {}
```

## @ApiQuery 상세 패턴

쿼리 파라미터를 명시적으로 문서화하여 Swagger UI에서 개별 파라미터로 표시합니다.

### 기본 패턴

```typescript
@Get()
@ApiQuery({
  name: 'search',
  description: '검색어 (제목, 내용에서 검색)',
  required: false,
  type: String,
  example: 'nestjs'
})
@ApiQuery({
  name: 'page',
  description: '페이지 번호 (1부터 시작, 기본값: 1)',
  required: false,
  type: Number,
  example: 1,
})
findAll(
  @Query('search') search?: string,
  @Query('page') page: number = 1
) {}
```

### Enum 쿼리 파라미터

```typescript
@Get()
@ApiQuery({
  name: 'status',
  description: '주문 상태 필터 (pending | processing | shipped | delivered | cancelled)',
  enum: OrderStatus,
  required: false,
  example: OrderStatus.PENDING
})
@ApiQuery({
  name: 'sortBy',
  description: '정렬 기준 (createdAt | updatedAt | price)',
  enum: ['createdAt', 'updatedAt', 'price'],
  required: false,
  example: 'createdAt'
})
findByStatus(
  @Query('status') status?: OrderStatus,
  @Query('sortBy') sortBy: string = 'createdAt'
) {}
```

### 범위 쿼리 파라미터

```typescript
@Get()
@ApiQuery({
  name: 'minPrice',
  description: '최소 가격 필터 (0 이상)',
  required: false,
  type: Number,
  example: 10000,
})
@ApiQuery({
  name: 'maxPrice',
  description: '최대 가격 필터',
  required: false,
  type: Number,
  example: 100000
})
@ApiQuery({
  name: 'minSimilarity',
  description: '최소 유사도 필터 (0~1, 기본값: 없음)',
  required: false,
  type: Number,
  example: 0.8,
})
filterProducts(
  @Query('minPrice') minPrice?: number,
  @Query('maxPrice') maxPrice?: number,
  @Query('minSimilarity') minSimilarity?: number
) {}
```

### DTO와 @ApiQuery 함께 사용

DTO 클래스를 사용하면서도 개별 파라미터를 명시적으로 문서화:

```typescript
@Get()
@ApiQuery({ name: 'page', description: '페이지 번호 (미지정 시 1)', required: false, example: 1 })
@ApiQuery({ name: 'limit', description: '페이지당 항목 수 (미지정 시 10)', required: false, example: 10 })
@ApiQuery({ name: 'sortBy', description: '정렬 기준 (createdAt | updatedAt)', required: false, example: 'createdAt' })
findAll(@Query() query: PaginationQueryDto) {}
```

> **Tip**: DTO만 사용해도 Swagger가 스키마를 생성하지만, @ApiQuery를 추가하면 Swagger UI에서 더 명확하게 표시됩니다.

## @ApiParam 상세 패턴

경로 파라미터를 문서화합니다.

### 기본 패턴

```typescript
@Get(':id')
@ApiParam({
  name: 'id',
  description: '리소스 고유 ID',
  type: Number,
  example: 1
})
findOne(@Param('id') id: number) {}
```

### UUID 파라미터

```typescript
@Get(':userId')
@ApiParam({
  name: 'userId',
  description: '사용자 고유 식별자 (UUID v4 형식)',
  type: String,
  example: '550e8400-e29b-41d4-a716-446655440000'
})
findUser(@Param('userId') userId: string) {}
```

### 다중 경로 파라미터

```typescript
@Get(':categoryId/products/:productId')
@ApiParam({
  name: 'categoryId',
  description: '카테고리 ID (GET /categories에서 조회 가능)',
  type: String,
  example: 'cat_electronics'
})
@ApiParam({
  name: 'productId',
  description: '상품 ID',
  type: Number,
  example: 123
})
findProduct(
  @Param('categoryId') categoryId: string,
  @Param('productId') productId: number
) {}
```

### Enum 경로 파라미터

```typescript
@Get(':status/orders')
@ApiParam({
  name: 'status',
  description: '주문 상태 (pending | completed | cancelled)',
  enum: ['pending', 'completed', 'cancelled'],
  example: 'pending'
})
findOrdersByStatus(@Param('status') status: string) {}
```
