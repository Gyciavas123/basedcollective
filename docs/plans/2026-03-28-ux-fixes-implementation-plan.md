# UX Fixes Implementation Plan

## Overview
Fix 20 product-level UX issues across the BasedCollective platform. All bugs and polish, no new features.

## Phase 1: Critical Data Fixes
1. Profile settings bio pre-fill from user data
2. Channel page — fetch actual membership status
3. VoteButtons — revert optimistic update on API failure
4. PostCard — accept saved status from parent, add report dialog
5. Search bar — wire up basic search with navigation

## Phase 2: Error States & Loading
6. Create reusable error/loading state patterns
7. Fix ~8 pages with eternal "Loading..." on API failure
8. Fix empty vs error distinction on feeds
9. Replace ~20 silent catch {} blocks with user-visible errors

## Phase 3: Navigation & Mobile
10. Add mobile hamburger menu to navbar
11. Fix auth dead ends (register, apply, reset password)
12. New channel creation confirmation
13. Notification click-through to relevant content

## Phase 4: Mod Area Polish
14. Replace prompt()/alert() in mod user management
15. Display channel rules on channel page
16. Wire up ModActionLog component
17. Fix dashboard reputation label formatting

## Phase 5: Small Fixes
18. Privacy page error message color
19. Sessions page — current session indicator + user agent parsing
20. Channel creation success state (already done in PostForm pattern)
