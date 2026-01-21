#!/usr/bin/env node

/**
 * PostToolUse Hook: Swagger Documentation Reminder
 * Triggers when .dto.ts or .controller.ts files are modified
 */

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

function shouldRemind(filePath) {
  if (!filePath) return false;

  const patterns = [
    /\.dto\.ts$/,
    /\.controller\.ts$/,
  ];

  return patterns.some(pattern => pattern.test(filePath));
}

function generateReminder(filePath) {
  const isDtoFile = /\.dto\.ts$/.test(filePath);
  const isControllerFile = /\.controller\.ts$/.test(filePath);

  if (isDtoFile) {
    return `<swagger-checklist>
[DTO Swagger 문서화 체크리스트]
- [ ] 모든 필수 프로퍼티에 @ApiProperty({ description, example }) 추가
- [ ] 모든 선택 프로퍼티에 @ApiPropertyOptional({ description, example }) 추가
- [ ] enum 필드: enum 속성이 validator의 @IsIn() 값과 일치
- [ ] 숫자 필드: minimum/maximum이 validator의 @Min()/@Max()와 일치
- [ ] 배열/중첩 객체: type 명시 (type: [ItemDto] 또는 type: NestedDto)
- [ ] 기본값 있는 필드: default 속성 추가
</swagger-checklist>`;
  }

  if (isControllerFile) {
    return `<swagger-checklist>
[Controller Swagger 문서화 체크리스트]
- [ ] @ApiTags('TagName') 클래스 레벨에 추가
- [ ] @ApiOperation({ summary, description }) 각 엔드포인트에 추가
- [ ] @ApiResponse({ status: 200, type: ResponseDto }) 성공 응답 문서화
- [ ] @ApiResponse({ status: 400, description }) 에러 응답 문서화
- [ ] 인증 필요 시 @ApiBearerAuth() 추가
- [ ] 커스텀 헤더 있으면 @ApiHeader() 추가
</swagger-checklist>`;
  }

  return null;
}

async function main() {
  try {
    const input = await readStdin();
    const data = JSON.parse(input);

    const toolInput = data.toolInput || {};
    const filePath = toolInput.file_path || toolInput.filePath || '';

    if (shouldRemind(filePath)) {
      const reminder = generateReminder(filePath);
      if (reminder) {
        console.log(JSON.stringify({
          continue: true,
          message: reminder
        }));
        return;
      }
    }

    console.log(JSON.stringify({ continue: true }));
  } catch (error) {
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
