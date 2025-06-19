---
description: "CursorRIPER Framework - Customization"
globs: 
alwaysApply: false
version: "1.0.1"
date_created: "2025-04-05"
last_updated: "2025-04-06"
framework_component: "customization"
priority: "medium"
scope: "optional"
---
<!-- Note: Cursor will strip out all the other header information and only keep the first three. -->
# CursorRIPER Framework - Customization
# Version 1.0.1

## AI PROCESSING INSTRUCTIONS
This file contains user-defined customizations for the CursorRIPER Framework. As an AI assistant, you MUST:
- Load this file after core framework components if it exists
- Apply these customizations to override default framework behavior
- Never modify this file unless explicitly requested by the user
- Acknowledge the active customizations in your first response of each session

## USER PREFERENCES

### Response Style
RESPONSE_VERBOSITY: "BALANCED"
# Possible values: "CONCISE", "BALANCED", "DETAILED"
# Controls the level of detail in AI responses

CODE_STYLE_PREFERENCES: ""
# Specify coding style preferences (indentation, naming conventions, etc.)

EXPLANATION_LEVEL: "MEDIUM"
# Possible values: "MINIMAL", "MEDIUM", "COMPREHENSIVE"
# Controls how much explanation is provided with code

### Mode Behavior
SUGGEST_MODE_TRANSITIONS: true
# If true, AI can suggest when a mode transition might be appropriate

AUTO_MODE_TRANSITION: false
# If true, AI can automatically transition between modes (except to EXECUTE)
# EXECUTE mode always requires explicit user authorization

PLAN_QUESTION_COUNT: 5
# Number of clarifying questions to ask in PLAN mode

### Memory Management
AUTO_UPDATE_MEMORY: true
# If true, AI will automatically update memory files after significant changes

MEMORY_UPDATE_FREQUENCY: "AFTER_COMPLETION"
# Possible values: "AFTER_EVERY_RESPONSE", "AFTER_COMPLETION", "MANUAL_ONLY"
# Controls when memory files are updated

REQUIRED_MEMORY_FILES: ["projectbrief.md", "activeContext.md", "progress.md"]
# List of memory files that must exist for the framework to function

### Archive Behavior
AUTO_ARCHIVE_START_PHASE: true
# If true, START phase will be automatically archived upon completion

BACKUP_FREQUENCY: "DAILY"
# Possible values: "NEVER", "DAILY", "WEEKLY", "BEFORE_CHANGES"
# Controls how often memory bank backups are created

KEEP_BACKUP_COUNT: 5
# Number of backup sets to retain before deleting oldest

## ADVANCED CUSTOMIZATION

### Command Aliases
CUSTOM_COMMANDS: {
  "/r": "/research",
  "/i": "/innovate",
  "/p": "/plan",
  "/e": "/execute",
  "/rev": "/review"
}
# Custom command shortcuts for mode transitions

### Mode Extensions
RESEARCH_MODE_EXTENSIONS: []
# Additional behaviors for RESEARCH mode

INNOVATE_MODE_EXTENSIONS: []
# Additional behaviors for INNOVATE mode

PLAN_MODE_EXTENSIONS: []
# Additional behaviors for PLAN mode

EXECUTE_MODE_EXTENSIONS: []
# Additional behaviors for EXECUTE mode

REVIEW_MODE_EXTENSIONS: []
# Additional behaviors for REVIEW mode

### Framework Extensions
CUSTOM_PHASES: []
# Additional project phases beyond standard ones

CUSTOM_WORKFLOWS: []
# Custom workflows for specific project types

## USER DOCUMENTATION PREFERENCES

### Documentation Format
DOCUMENTATION_STYLE: "MARKDOWN"
# Format for generated documentation

INCLUDE_CODE_COMMENTS: true
# Whether to include detailed comments in generated code

CODE_BLOCK_LANGUAGE_TAGS: true
# Whether to include language tags in code blocks

### AI Output Format
MODE_DECLARATION_FORMAT: "[MODE: {mode}]"
# Format string for mode declarations

PROGRESS_INDICATOR_FORMAT: "[{current_step}/{total_steps}]"
# Format for progress indicators in responses

## CUSTOM PROJECT STRUCTURE

PROJECT_TYPE: "DEFAULT"
# Identifies the type of project for specialized handling

CUSTOM_FOLDER_STRUCTURE: {}
# Custom folder structure definitions for project scaffolding

TECHNOLOGY_PRESETS: {}
# Predefined technology stacks for quick selection

---

*This file contains user-defined customizations for the CursorRIPER Framework. Edit these settings to adjust framework behavior to your preferences.*
