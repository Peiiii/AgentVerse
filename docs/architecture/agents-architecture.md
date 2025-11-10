# Agents Module Architecture (Resource-first + Repository)

Status: Adopted

## Goals
- Single source of truth for Agent data
- Pure-read queries (no side-effect on read)
- Unified write path with consistent cache invalidation
- Backward-compatible UI API during migration

## Layers and Responsibilities

- Service (IO only)
  - File: `src/core/services/agent.service.ts`
  - CRUD to storage/HTTP; no caching; no default seeding; no UI coupling.

- Resource (query + cache)
  - File: `src/core/resources/index.ts` (`agentListResource`)
  - Purely returns `agentService.listAgents()`; no write side-effects.
  - Consumable via `useResourceState(resource)` for Suspense-friendly reads.

- Repository (unified write facade)
  - Implemented via `AgentsManager`.
  - Write methods call Service, then `await agentListResource.reload()` to refresh the singleton cache.

- Bootstrap/Migrations (one-off, idempotent)
  - File: `src/core/bootstrap/agents.bootstrap.ts`
  - `ensureDefaultAgents()` creates/updates built-in defaults on app start.
  - Long-term: move to `slug + version` match; currently name-based for backward compatibility.

- Store
  - Removed for Agents domain to avoid double caching and drift.

- Hooks
  - `useAgents()` reads from `agentsResource.list` (resource-first). Prefer this everywhere.

## Data Flow
1. App start:
   - `PresenterProvider` calls `ensureDefaultAgents()` then `agentListResource.reload()`.
   - `AgentsManager` subscribes to `agentListResource` and mirrors its state into the store.
2. Write (create/update/delete):
   - Manager -> Service (CRUD) -> `agentListResource.reload()` -> UI hooks auto-refresh.
3. Read:
   - Prefer `useAgents()` hook which reads the Resource directly.
   - Legacy code paths still read `presenter.agents.store` (mirrored).

## Conventions
- No write side-effects in resources.
- All writes must reload the resource.
- Avoid name-based matching in business logic. Introduce `slug` (stable id) + `version` for default agents in future evolution.

## Migration Plan
1. (Done) Move default agents seeding into bootstrap and purify `agentListResource`.
2. (Done) Mirror resource into store; update manager to reload resource after writes.
3. (Done) Remove store from Agents domain; all consumers use resource hooks.
4. (Next) Introduce `slug + version` for default agents; update bootstrap matcher.

## Rationale
This design minimizes data duplication, improves predictability (pure reads), and provides a single invalidation point (`agentListResource.reload()`).

## Diagram

```mermaid
flowchart TD
  subgraph UI
    A[useAgents Hook]
    C[Chat/Pages]
  end

  subgraph App
    R[agentListResource]
    M[AgentsManager (Repository)]
    B[ensureDefaultAgents Bootstrap]
  end

  subgraph IO
    S[agent.service (CRUD)]
    LS[(localStorage/DB)]
  end

  A --> R
  C --> A
  M --> S
  S --> LS
  M --> R
  B --> S
  B --> R
```
