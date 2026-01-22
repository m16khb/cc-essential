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
[DTO Swagger 문서화 체크리스트 - 2026 표준]

**필수 항목:**
- [ ] @ApiProperty/@ApiPropertyOptional에 description + example
- [ ] enum 필드: \`enumName\` 속성 필수 지정
- [ ] 배열 필드: \`type: [ItemDto]\` 명시
- [ ] nullable 필드: \`nullable: true\` 명시

**Description 품질:**
- [ ] Why-first: 사용 목적이 먼저 설명됨
- [ ] enum/boolean 옵션을 마크다운 테이블로 표현
- [ ] 기본값을 \`**기본값:**\` 형식으로 명시
- [ ] 사용 예시 포함

**Validator 정합성:**
- [ ] minimum/maximum이 @Min/@Max와 일치
- [ ] enum이 @IsIn 값과 일치
</swagger-checklist>`;
  }

  if (isControllerFile) {
    return `<swagger-checklist>
[Controller Swagger 문서화 체크리스트 - 2026 표준]

**필수 항목:**
- [ ] @ApiTags('TagName') 클래스 레벨에 추가
- [ ] @ApiOperation({ summary, description }) 각 엔드포인트에 추가
- [ ] @ApiResponse 모든 상태 코드 문서화

**@ApiOperation description 품질:**
- [ ] 동작 방식을 마크다운 테이블로 설명
- [ ] 주요 Query Parameters 테이블로 정리
- [ ] 버전별 차이점 명시 (V2/V3 등)

**Query/Param 문서화:**
- [ ] 모든 @Query()에 대응하는 @ApiQuery 존재
- [ ] 모든 @Param()에 대응하는 @ApiParam 존재
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
