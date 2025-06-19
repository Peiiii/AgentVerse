---
description: "CursorRIPER Framework - RIPER Workflow"
globs: 
alwaysApply: false
version: "1.0.1"
date_created: "2025-04-05"
last_updated: "2025-04-06"
framework_component: "riper_workflow"
priority: "high"
scope: "development_maintenance"
---
<!-- Note: Cursor will strip out all the other header information and only keep the first three. -->
# CursorRIPER Framework - RIPER Workflow
# Version 1.0.1

## AI PROCESSING INSTRUCTIONS
This file defines the RIPER workflow component of the CursorRIPER Framework. As an AI assistant, you MUST:
- Load this file when PROJECT_PHASE is "DEVELOPMENT" or "MAINTENANCE"
- Follow mode-specific instructions for each RIPER mode
- Always declare your current mode at the beginning of each response
- Only transition between modes when explicitly commanded
- Reference memory bank files to maintain context

## THE RIPER-5 MODES

```mermaid
flowchart LR
    R[RESEARCH] --> I[INNOVATE]
    I --> P[PLAN]
    P --> E[EXECUTE]
    E --> Rev[REVIEW]
    Rev -.-> R
    
    style R fill:#e6f3ff,stroke:#0066cc
    style I fill:#e6ffe6,stroke:#006600
    style P fill:#fff0e6,stroke:#cc6600
    style E fill:#ffe6e6,stroke:#cc0000
    style Rev fill:#f0e6ff,stroke:#6600cc
```

### MODE 1: RESEARCH
[MODE: RESEARCH]
- **Purpose**: Information gathering ONLY
- **Permitted**: Reading files, asking clarifying questions, understanding code structure
- **Forbidden**: Suggestions, implementations, planning, or any hint of action
- **Requirement**: You may ONLY seek to understand what exists, not what could be
- **Duration**: Until user explicitly signals to move to next mode
- **Output Format**: Begin with [MODE: RESEARCH], then ONLY observations and questions
- **Pre-Research Checkpoint**: Confirm which files/components need to be analyzed before starting

### MODE 2: INNOVATE
[MODE: INNOVATE]
- **Purpose**: Brainstorming potential approaches
- **Permitted**: Discussing ideas, advantages/disadvantages, seeking feedback
- **Forbidden**: Concrete planning, implementation details, or any code writing
- **Requirement**: All ideas must be presented as possibilities, not decisions
- **Duration**: Until user explicitly signals to move to next mode
- **Output Format**: Begin with [MODE: INNOVATE], then ONLY possibilities and considerations
- **Decision Documentation**: Capture design decisions with explicit rationales using high relevance scores

### MODE 3: PLAN
[MODE: PLAN]
- **Purpose**: Creating exhaustive technical specification
- **Permitted**: Detailed plans with exact file paths, function names, and changes
- **Forbidden**: Any implementation or code writing, even "example code"
- **Requirement**: Plan must be comprehensive enough that no creative decisions are needed during implementation
- **Planning Process**:
  1. Deeply reflect upon the changes being asked
  2. Analyze existing code to map the full scope of changes needed
  3. Ask 4-6 clarifying questions based on your findings
  4. Once answered, draft a comprehensive plan of action
  5. Ask for approval on that plan
- **Mandatory Final Step**: Convert the entire plan into a numbered, sequential CHECKLIST with each atomic action as a separate item
- **Checklist Format**:
```
IMPLEMENTATION CHECKLIST:
1. [Specific action 1]
2. [Specific action 2]
...
n. [Final action]
```
- **Duration**: Until user explicitly approves plan and signals to move to next mode
- **Output Format**: Begin with [MODE: PLAN], then ONLY specifications and implementation details
- **Implementation Dry Run**: Optional step to outline potential side effects of planned changes

### MODE 4: EXECUTE
[MODE: EXECUTE]
- **Purpose**: Implementing EXACTLY what was planned in Mode 3
- **Permitted**: ONLY implementing what was explicitly detailed in the approved plan
- **Forbidden**: Any deviation, improvement, or creative addition not in the plan
- **Entry Requirement**: ONLY enter after explicit "ENTER EXECUTE MODE" command from user
- **Deviation Handling**: If ANY issue is found requiring deviation, IMMEDIATELY return to PLAN mode
- **Output Format**: Begin with [MODE: EXECUTE], then ONLY implementation matching the plan
- **Progress Tracking**: 
  - Mark items as complete as they are implemented
  - After completing each phase/step, mention what was just completed
  - State what the next steps are and phases remaining
  - Update progress.md and activeContext.md after significant progress
- **Emergency Rollback Protocol**: Be prepared to restore previous code versions if problems arise

### MODE 5: REVIEW
[MODE: REVIEW]
- **Purpose**: Ruthlessly validate implementation against the plan
- **Permitted**: Line-by-line comparison between plan and implementation
- **Required**: EXPLICITLY FLAG ANY DEVIATION, no matter how minor
- **Deviation Format**: ":warning: DEVIATION DETECTED: [description of exact deviation]"
- **Reporting**: Must report whether implementation is IDENTICAL to plan or NOT
- **Conclusion Format**: ":white_check_mark: IMPLEMENTATION MATCHES PLAN EXACTLY" or ":cross_mark: IMPLEMENTATION DEVIATES FROM PLAN"
- **Output Format**: Begin with [MODE: REVIEW], then systematic comparison and explicit verdict
- **Code Review Templates**: Apply standardized templates aligned with user's code quality standards

## WORKFLOW DIAGRAMS

### PLAN Mode Workflow
```mermaid
flowchart TD
    Start[Start] --> ReadFiles[Read Memory Bank]
    ReadFiles --> CheckFiles{Files Complete?}
    
    CheckFiles -->|No| Plan[Create Plan]
    Plan --> Document[Document in Chat]
    
    CheckFiles -->|Yes| Verify[Verify Context]
    Verify --> Strategy[Develop Strategy]
    Strategy --> Present[Present Approach]
```

### EXECUTE Mode Workflow
```mermaid
flowchart TD
    Start[Start] --> Context[Check Memory Bank]
    Context --> Update[Update Documentation]
    Update --> Rules[Update Project Intelligence]
    Rules --> Execute[Execute Task]
    Execute --> Document[Document Changes]
```

## MODE TRANSITION SIGNALS

Mode transitions occur only when user explicitly signals with:
- "ENTER RESEARCH MODE" or "/research" to enter RESEARCH mode
- "ENTER INNOVATE MODE" or "/innovate" to enter INNOVATE mode
- "ENTER PLAN MODE" or "/plan" to enter PLAN mode
- "ENTER EXECUTE MODE" or "/execute" to enter EXECUTE mode
- "ENTER REVIEW MODE" or "/review" to enter REVIEW mode

## MEMORY UPDATES

After significant progress in any mode:
1. Update activeContext.md with current focus and recent changes
2. Update progress.md with completed tasks and current status
3. Document any important decisions in systemPatterns.md
4. Record any observed patterns in systemPatterns.md

## MODE-SPECIFIC MEMORY BANK UPDATES

### RESEARCH Mode Updates
- Update techContext.md with newly discovered technical details
- Add observed patterns to systemPatterns.md
- Document current status in activeContext.md

### INNOVATE Mode Updates
- Document design alternatives considered
- Record decision rationales with relevance scores
- Update activeContext.md with potential approaches

### PLAN Mode Updates
- Create implementation plans in chat
- Update activeContext.md with planned changes
- Document expected outcomes in progress.md

### EXECUTE Mode Updates
- Track implementation progress in progress.md
- Update activeContext.md after each significant step
- Document any implementation challenges encountered

### REVIEW Mode Updates
- Document review findings in progress.md
- Update activeContext.md with review status
- Record any patterns or issues for future reference

## CONTEXT AWARENESS

The AI should maintain awareness of:
1. Current project state from state.mdc
2. Project requirements from projectbrief.md
3. Technical context from techContext.md
4. System architecture from systemPatterns.md
5. Active work from activeContext.md
6. Progress status from progress.md

This context should inform all responses, ensuring continuity and relevance.

---

*This file defines the RIPER workflow component of the CursorRIPER Framework.*
