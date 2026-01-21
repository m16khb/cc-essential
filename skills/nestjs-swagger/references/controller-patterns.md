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
