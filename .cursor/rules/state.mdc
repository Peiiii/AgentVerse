---
description: "CursorRIPER Framework - State Management"
globs: 
alwaysApply: true
version: "1.0.2"
date_created: "2025-04-05"
last_updated: "2025-04-05"
framework_component: "state"
priority: "critical"
scope: "always_load"
---
<!-- Note: Cursor will strip out all the other header information and only keep the first three. -->
# CursorRIPER Framework - State Management
# Version 1.0.2

## AI PROCESSING INSTRUCTIONS
This file defines the current state of the project within the CursorRIPER Framework. As an AI assistant, you MUST:
- Always load this file after core.mdc but before other components
- Never modify state values without proper authorization via commands
- Validate state transitions against allowed paths
- Update this file when state changes occur
- Keep all state values consistent with each other

## CURRENT PROJECT STATE

PROJECT_PHASE: "UNINITIATED"
# Possible values: "UNINITIATED", "INITIALIZING", "DEVELOPMENT", "MAINTENANCE"

RIPER_CURRENT_MODE: "NONE"
# Possible values: "NONE", "RESEARCH", "INNOVATE", "PLAN", "EXECUTE", "REVIEW"

START_PHASE_STATUS: "NOT_STARTED"
# Possible values: "NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"

START_PHASE_STEP: 0
# Possible values: 0-6 (0=Not started, 1=Requirements, 2=Technology, 3=Architecture, 4=Scaffolding, 5=Environment, 6=Memory Bank)

LAST_UPDATE: "2025-04-05T00:00:00Z"
# ISO 8601 formatted timestamp of last state update

INITIALIZATION_DATE: ""
# When START phase was completed, empty if not completed

FRAMEWORK_VERSION: "1.0.0"
# Current version of the framework

## STATE TRANSITION RULES

```mermaid
stateDiagram-v2
    [*] --> UNINITIATED
    
    UNINITIATED --> INITIALIZING: /start
    INITIALIZING --> DEVELOPMENT: START phase complete
    DEVELOPMENT --> MAINTENANCE: User request
    MAINTENANCE --> DEVELOPMENT: User request
    
    state INITIALIZING {
        [*] --> NOT_STARTED
        NOT_STARTED --> IN_PROGRESS: Begin START
        IN_PROGRESS --> COMPLETED: All steps finished
        COMPLETED --> ARCHIVED: Enter DEVELOPMENT
    }
    
    state "DEVELOPMENT/MAINTENANCE" as DM {
        [*] --> RESEARCH
        RESEARCH --> INNOVATE: /innovate
        INNOVATE --> PLAN: /plan
        PLAN --> EXECUTE: /execute
        EXECUTE --> REVIEW: /review
        REVIEW --> RESEARCH: /research
    }
```

### Phase Transitions
- UNINITIATED → INITIALIZING
  - Trigger: "/start" or "BEGIN START PHASE"
  - Requirements: None
  
- INITIALIZING → DEVELOPMENT
  - Trigger: Automatic upon START phase completion
  - Requirements: START_PHASE_STATUS = "COMPLETED"
  
- DEVELOPMENT → MAINTENANCE
  - Trigger: Manual transition by user
  - Requirements: Explicit user request
  
- MAINTENANCE → DEVELOPMENT
  - Trigger: Manual transition by user
  - Requirements: Explicit user request

### Mode Transitions
- Any mode → RESEARCH
  - Trigger: "/research" or "ENTER RESEARCH MODE"
  - Requirements: PROJECT_PHASE in ["DEVELOPMENT", "MAINTENANCE"]
  
- Any mode → INNOVATE
  - Trigger: "/innovate" or "ENTER INNOVATE MODE"
  - Requirements: PROJECT_PHASE in ["DEVELOPMENT", "MAINTENANCE"]
  
- Any mode → PLAN
  - Trigger: "/plan" or "ENTER PLAN MODE"
  - Requirements: PROJECT_PHASE in ["DEVELOPMENT", "MAINTENANCE"]
  
- Any mode → EXECUTE
  - Trigger: "/execute" or "ENTER EXECUTE MODE"
  - Requirements: PROJECT_PHASE in ["DEVELOPMENT", "MAINTENANCE"]
  
- Any mode → REVIEW
  - Trigger: "/review" or "ENTER REVIEW MODE"
  - Requirements: PROJECT_PHASE in ["DEVELOPMENT", "MAINTENANCE"]

### START Phase Status Transitions
- NOT_STARTED → IN_PROGRESS
  - Trigger: "/start" or "BEGIN START PHASE"
  - Requirements: PROJECT_PHASE = "UNINITIATED"
  
- IN_PROGRESS → COMPLETED
  - Trigger: Completion of all START phase steps
  - Requirements: START_PHASE_STEP = 6
  
- COMPLETED → ARCHIVED
  - Trigger: Automatic after transition to DEVELOPMENT
  - Requirements: PROJECT_PHASE = "DEVELOPMENT"

## STATE UPDATE PROCEDURES

### Update Project Phase
1. Validate transition is allowed
2. Create backup of current state
3. Update PROJECT_PHASE value
4. Update LAST_UPDATE timestamp
5. Perform any phase-specific initialization

### Update RIPER Mode
1. Validate transition is allowed
2. Update RIPER_CURRENT_MODE value
3. Update LAST_UPDATE timestamp
4. Update activeContext.md to reflect mode change

### Update START Phase Status
1. Validate transition is allowed
2. Update START_PHASE_STATUS value
3. Update LAST_UPDATE timestamp
4. If transitioning to COMPLETED, set INITIALIZATION_DATE

### Update START Phase Step
1. Validate step increment is logical
2. Update START_PHASE_STEP value
3. Update LAST_UPDATE timestamp
4. If reaching step 6, trigger completion process

## AUTOMATIC STATE DETECTION

When determining current project state:
1. Check for existence of memory bank files
2. If complete memory bank exists but STATE_PHASE is "UNINITIATED":
   - Set PROJECT_PHASE to "DEVELOPMENT"
   - Set START_PHASE_STATUS to "COMPLETED"
   - Set START_PHASE_STEP to 6
   - Set INITIALIZATION_DATE based on file timestamps
3. If partial memory bank exists:
   - Set PROJECT_PHASE to "INITIALIZING"
   - Set START_PHASE_STATUS to "IN_PROGRESS"
   - Determine START_PHASE_STEP based on existing files

## RE-INITIALIZATION PROTECTION

If "/start" or "BEGIN START PHASE" is detected when PROJECT_PHASE is not "UNINITIATED":
1. Warn user about re-initialization risks
2. Require explicit confirmation: "CONFIRM RE-INITIALIZATION"
3. If confirmed:
   - Create backup of current memory bank
   - Reset state to PROJECT_PHASE = "INITIALIZING"
   - Reset START_PHASE_STATUS to "IN_PROGRESS"
   - Reset START_PHASE_STEP to 1

---

*This file automatically tracks the current state of the project. It should never be edited manually.*
