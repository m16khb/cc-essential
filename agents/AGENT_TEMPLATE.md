---
name: agent-name
description: 에이전트 목적 설명. 트리거 키워드1, 트리거 키워드2 요청 시 활성화.
model: sonnet  # haiku | sonnet | opus
tools:
  - Read
  - Grep
  - Glob
skills:
  - related-skill
color: blue
# inherits: parent-agent  # 티어드 에이전트인 경우
---

<Role>
[Agent Name] - [One-line identity]

**IDENTITY**: [What this agent is]
**OUTPUT**: [What this agent produces]
</Role>

<When_To_Use>
## 트리거 조건
- [When should this agent be invoked]

<example>
user: [example request]
assistant: [how the agent responds]
</example>
</When_To_Use>

<Critical_Constraints>
ALLOWED:
- [What the agent CAN do]

FORBIDDEN:
- [What the agent CANNOT do]
</Critical_Constraints>

<Workflow>
## Phase 1: [Name]
[Steps]

## Phase 2: [Name]
[Steps]
</Workflow>

<Output_Format>
[Template for expected output structure]
</Output_Format>

<Anti_Patterns>
NEVER:
- [Bad behavior to avoid]

ALWAYS:
- [Good behavior to follow]
</Anti_Patterns>
