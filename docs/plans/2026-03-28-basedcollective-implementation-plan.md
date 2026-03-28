# BasedCollective — Full Implementation Plan

## Overview

An invite-only web forum platform inspired by Reddit, with Worldcoin identity verification, a star-rank reputation system, structured moderation, and curated invite pipeline. Built for high-trust, high-quality community interaction.

## Confirmed Tech Stack

| Layer | Technology | Hosted on |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui | Vercel |
| Backend API | Express.js + Node.js | Railway |
| Database | PostgreSQL + Prisma ORM | Railway |
| Auth | NextAuth.js (Google OAuth + email/password) | — |
| Media storage | Cloudflare R2 (S3-compatible) | Cloudflare |
| Email | Resend | — |
| Identity verification | Worldcoin World ID | — |
| Monorepo tooling | Turborepo | — |
| CI/CD | GitHub Actions | GitHub (free tier) |
| Local database | Docker Compose (PostgreSQL) | Local machine |
| Testing | Vitest (backend unit tests) | — |

## Cost Estimate

| Service | Free tier | Estimated cost at launch | At scale (10k users) |
|---------|-----------|------------------------|----------------------|
| Vercel (frontend) | 100GB bandwidth/mo | $0/mo | ~$20/mo |
| Railway (API + DB) | $5 free credit/mo | ~$5-10/mo | ~$25-50/mo |
| Cloudflare R2 (media) | 10GB storage, no egress fees | ~$0-1/mo | ~$5-15/mo |
| Resend (email) | 3,000 emails/mo | $0/mo | $20/mo (50k emails) |
| Domain name | — | ~$12/year | ~$12/year |
| **Total** | | **~$5-15/month** | **~$70-100/month** |

## Design Direction

The v1 UI follows a **Reddit-inspired layout** with a clean, neutral aesthetic using shadcn/ui defaults. This is a deliberate placeholder — once the brand lead delivers a design identity, reskinning is a ~1-2 day effort (update theme colours, font, and logo in a single config file).

**v1 visual approach:**
- Card-based feed layout (post cards in a central column)
- Left sidebar for channel navigation
- Top navbar with search, notifications bell, user menu
- Threaded comment indentation (Reddit-style)
- Neutral colour palette: white/gray backgrounds, single accent colour for interactive elements
- System sans-serif font (Inter or similar)
- Minimal, content-first — no decorative elements

## Project Structure

```
basedcollective/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── app/                      # App Router pages
│   │   │   ├── (public)/             # Public routes (landing, waitlist, apply)
│   │   │   │   ├── page.tsx          # Landing / waitlist page
│   │   │   │   ├── apply/
│   │   │   │   │   └── page.tsx      # Application form (unlocked by referral code)
│   │   │   │   └── auth/
│   │   │   │       ├── login/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── register/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── forgot-password/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── reset-password/
│   │   │   │           └── page.tsx
│   │   │   ├── (app)/                # Authenticated routes
│   │   │   │   ├── layout.tsx        # App shell (nav, sidebar, notifications)
│   │   │   │   ├── feed/
│   │   │   │   │   └── page.tsx      # Personalised feed (home)
│   │   │   │   ├── trending/
│   │   │   │   │   └── page.tsx      # Trending cross-channel
│   │   │   │   ├── all/
│   │   │   │   │   └── page.tsx      # Global front page
│   │   │   │   ├── c/
│   │   │   │   │   ├── page.tsx      # Channel directory
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx  # Request new channel
│   │   │   │   │   └── [slug]/
│   │   │   │   │       ├── page.tsx  # Channel feed
│   │   │   │   │       └── submit/
│   │   │   │   │           └── page.tsx  # Create post in channel
│   │   │   │   ├── post/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx  # Post detail + threaded replies
│   │   │   │   ├── u/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx  # User profile
│   │   │   │   ├── saved/
│   │   │   │   │   └── page.tsx      # Saved/bookmarked posts
│   │   │   │   ├── notifications/
│   │   │   │   │   └── page.tsx      # Notification inbox
│   │   │   │   ├── settings/
│   │   │   │   │   ├── page.tsx      # Account settings
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── notifications/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── sessions/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── privacy/
│   │   │   │   │       └── page.tsx  # Data export, account deletion
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx      # Private star score + referral codes
│   │   │   │   └── verify/
│   │   │   │       └── page.tsx      # Worldcoin verification flow
│   │   │   ├── (admin)/              # Admin/mod routes
│   │   │   │   └── mod/
│   │   │   │       ├── page.tsx      # Mod dashboard overview
│   │   │   │       ├── applications/
│   │   │   │       │   └── page.tsx  # Pending user applications
│   │   │   │       ├── posts/
│   │   │   │       │   └── page.tsx  # Post staging queue
│   │   │   │       ├── channels/
│   │   │   │       │   └── page.tsx  # Channel requests
│   │   │   │       ├── reports/
│   │   │   │       │   └── page.tsx  # Flagged content
│   │   │   │       ├── users/
│   │   │   │       │   └── page.tsx  # User management
│   │   │   │       ├── appeals/
│   │   │   │       │   └── page.tsx  # Appeals queue
│   │   │   │       └── settings/
│   │   │   │           └── page.tsx  # Admin config (weights, thresholds)
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui primitives
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── posts/
│   │   │   │   ├── PostCard.tsx
│   │   │   │   ├── PostForm.tsx
│   │   │   │   ├── VoteButtons.tsx
│   │   │   │   └── ReplyThread.tsx
│   │   │   ├── channels/
│   │   │   │   ├── ChannelCard.tsx
│   │   │   │   └── ChannelHeader.tsx
│   │   │   ├── users/
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   ├── StarBadge.tsx
│   │   │   │   └── VerifiedBadge.tsx
│   │   │   ├── moderation/
│   │   │   │   ├── ApplicationReview.tsx
│   │   │   │   ├── PostReview.tsx
│   │   │   │   └── ModActionLog.tsx
│   │   │   └── notifications/
│   │   │       ├── NotificationBell.tsx
│   │   │       └── NotificationItem.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                # API client (wraps fetch to backend)
│   │   │   ├── auth.ts               # NextAuth config
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useInfiniteScroll.ts
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # Express backend
│       ├── src/
│       │   ├── index.ts              # Express app entry point
│       │   ├── config/
│       │   │   ├── env.ts            # Environment variable validation
│       │   │   ├── cors.ts
│       │   │   └── database.ts       # Prisma client singleton
│       │   ├── middleware/
│       │   │   ├── auth.ts           # JWT verification middleware
│       │   │   ├── requireRole.ts    # Role-based access (admin, mod, user)
│       │   │   ├── rateLimiter.ts
│       │   │   └── errorHandler.ts
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── users.routes.ts
│       │   │   ├── channels.routes.ts
│       │   │   ├── posts.routes.ts
│       │   │   ├── replies.routes.ts
│       │   │   ├── votes.routes.ts
│       │   │   ├── moderation.routes.ts
│       │   │   ├── notifications.routes.ts
│       │   │   ├── referrals.routes.ts
│       │   │   ├── admin.routes.ts
│       │   │   └── compliance.routes.ts
│       │   ├── services/             # Business logic layer
│       │   │   ├── auth.service.ts
│       │   │   ├── user.service.ts
│       │   │   ├── channel.service.ts
│       │   │   ├── post.service.ts
│       │   │   ├── reply.service.ts
│       │   │   ├── vote.service.ts
│       │   │   ├── reputation.service.ts
│       │   │   ├── referral.service.ts
│       │   │   ├── feed.service.ts
│       │   │   ├── moderation.service.ts
│       │   │   ├── notification.service.ts
│       │   │   ├── media.service.ts
│       │   │   ├── email.service.ts
│       │   │   ├── worldcoin.service.ts
│       │   │   └── compliance.service.ts
│       │   ├── jobs/                 # Background jobs
│       │   │   ├── mediaProcessor.ts     # Image/video validation
│       │   │   ├── reputationRecalc.ts   # Daily score recalculation
│       │   │   ├── referralCodeExpiry.ts  # Monthly code refresh
│       │   │   ├── worldcoinLapseCheck.ts # 7-day grace period monitor
│       │   │   └── lowEffortPenalty.ts    # 48h post penalty (FR-07A)
│       │   └── utils/
│       │       ├── feedScoring.ts    # Post score formula (FR-08A)
│       │       ├── pagination.ts
│       │       └── validation.ts
│       ├── prisma/
│       │   ├── schema.prisma         # Database schema
│       │   └── seed.ts               # Seed data (admin user, default config)
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared between frontend and backend
│       ├── src/
│       │   ├── types/                # TypeScript interfaces
│       │   │   ├── user.ts
│       │   │   ├── post.ts
│       │   │   ├── channel.ts
│       │   │   ├── notification.ts
│       │   │   └── moderation.ts
│       │   ├── constants/
│       │   │   ├── reputation.ts     # Default weights, caps, thresholds
│       │   │   ├── roles.ts
│       │   │   └── notifications.ts  # Event type enums
│       │   └── validation/
│       │       ├── schemas.ts        # Zod schemas (shared input validation)
│       │       └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI pipeline (type-check, lint, test, build)
├── docker-compose.yml                # Local PostgreSQL for development
├── turbo.json                        # Turborepo config
├── package.json                      # Root workspace config
├── .env.example                      # Environment variable template
├── .gitignore
└── README.md
```

---

## Database Schema

This is the full PostgreSQL schema via Prisma. Every table maps to one or more functional requirements.

```prisma
// ============================================================
// prisma/schema.prisma
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── FR-01, FR-02, FR-03: Users & Identity ──────────────────

enum UserStatus {
  PENDING_APPROVAL      // Application submitted, awaiting mod review
  PENDING_VERIFICATION  // Approved, awaiting Worldcoin verification
  ACTIVE                // Fully verified and active
  SUSPENDED             // Temporarily suspended (manual or Worldcoin lapse)
  BANNED                // Permanently banned
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
}

model User {
  id                  String      @id @default(cuid())
  email               String      @unique
  passwordHash        String?     // null if Google OAuth only
  displayName         String
  slug                String      @unique  // unique URL slug for profile
  avatar              String?     // URL to R2
  bio                 String?     @db.VarChar(500)
  role                UserRole    @default(USER)
  status              UserStatus  @default(PENDING_APPROVAL)
  googleId            String?     @unique

  // Worldcoin (FR-02.3–02.7)
  worldcoinHash       String?     @unique
  worldcoinVerifiedAt DateTime?
  worldcoinLapseNotifiedAt DateTime?  // when lapse warning was sent

  // Reputation (FR-07)
  reputationScore     Int         @default(0)
  starRank            Int         @default(1)  // 1–5

  // Timestamps
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  suspendedUntil      DateTime?   // for temporary suspensions
  bannedAt            DateTime?

  // Relations
  application         Application?
  posts               Post[]
  replies             Reply[]
  votesGiven          Vote[]
  referralCodesOwned  ReferralCode[]    @relation("CodeOwner")
  referralCodeUsed    ReferralCode?     @relation("CodeUsedBy", fields: [referralCodeUsedId], references: [id])
  referralCodeUsedId  String?           @unique
  channelMemberships  ChannelMember[]
  channelsOwned       Channel[]         @relation("ChannelOwner")
  notifications       Notification[]
  sessions            Session[]
  moderationActions   ModerationLog[]   @relation("ModActor")
  moderationTargets   ModerationLog[]   @relation("ModTarget")
  reports             Report[]          @relation("Reporter")
  reportsAgainst      Report[]          @relation("ReportTarget")
  appeals             Appeal[]
  savedPosts          SavedPost[]
  reputationEvents    ReputationEvent[]
  notificationPrefs   NotificationPreference[]
  dataRequests        DataRequest[]
  dailyReputation     DailyReputationLog[]

  @@index([status])
  @@index([starRank])
  @@index([reputationScore])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String   @unique
  userAgent    String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  @@index([userId])
}

// ─── FR-01: Applications & Onboarding ───────────────────────

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
}

model Application {
  id            String            @id @default(cuid())
  userId        String            @unique
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  email         String
  displayName   String
  reasonForJoining String         @db.Text
  socialLinks   String?           @db.Text  // JSON array of URLs
  referralCodeId String?
  referralCode  ReferralCode?     @relation(fields: [referralCodeId], references: [id])
  status        ApplicationStatus @default(PENDING)
  reviewedBy    String?           // mod/admin user ID
  reviewedAt    DateTime?
  rejectionReason String?
  createdAt     DateTime          @default(now())

  @@index([status])
}

// ─── FR-07: Referral Codes ──────────────────────────────────

model ReferralCode {
  id          String    @id @default(cuid())
  code        String    @unique  // unique, human-readable code
  ownerId     String
  owner       User      @relation("CodeOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  usedById    String?   @unique
  usedBy      User?     @relation("CodeUsedBy")
  application Application?
  usedAt      DateTime?
  expiresAt   DateTime  // 30 days after generation
  monthYear   String    // "2026-03" — for monthly allocation tracking
  createdAt   DateTime  @default(now())

  @@index([ownerId])
  @@index([code])
  @@index([expiresAt])
}

// ─── FR-04: Channels ────────────────────────────────────────

enum ChannelStatus {
  PENDING     // Requested, awaiting approval
  ACTIVE
  ARCHIVED
  DISABLED
}

model Channel {
  id          String        @id @default(cuid())
  name        String        @unique
  slug        String        @unique
  description String        @db.Text
  rules       String?       @db.Text  // channel-specific rules (markdown)
  status      ChannelStatus @default(PENDING)
  ownerId     String
  owner       User          @relation("ChannelOwner", fields: [ownerId], references: [id])
  postCount   Int           @default(0)
  memberCount Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  members     ChannelMember[]
  posts       Post[]

  @@index([slug])
  @@index([status])
}

model ChannelMember {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  channelId String
  channel   Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)
  joinedAt  DateTime @default(now())
  lastVisitedAt DateTime?  // for personalised feed freshness boost

  @@unique([userId, channelId])
  @@index([channelId])
}

// ─── FR-05: Posts ───────────────────────────────────────────

enum PostStatus {
  PROCESSING  // Media still being validated
  STAGING     // Awaiting moderator approval
  APPROVED
  REJECTED
  REMOVED     // Removed after approval by moderator
}

model Post {
  id          String     @id @default(cuid())
  channelId   String
  channel     Channel    @relation(fields: [channelId], references: [id])
  authorId    String
  author      User       @relation(fields: [authorId], references: [id])
  title       String     @db.VarChar(300)
  body        String     @db.Text
  status      PostStatus @default(PROCESSING)
  rejectionReason String?
  editedAfterApproval Boolean @default(false)

  // Computed engagement (denormalised for feed performance)
  upvoteCount   Int @default(0)
  downvoteCount Int @default(0)
  replyCount    Int @default(0)
  score         Float @default(0)  // computed feed score (FR-08A)

  // Reputation tracking (FR-07B)
  reputationContributed Int @default(0)  // current rep earned from this post (capped at 60)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  approvedAt  DateTime?

  // Relations
  media       PostMedia[]
  replies     Reply[]
  votes       Vote[]
  reports     Report[]
  savedBy     SavedPost[]

  @@index([channelId, status, createdAt])
  @@index([status])
  @@index([authorId])
  @@index([score])
  @@index([approvedAt])
}

model PostMedia {
  id         String   @id @default(cuid())
  postId     String
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  url        String   // R2 URL
  type       String   // "image" or "video"
  mimeType   String   // "image/jpeg", "video/mp4", etc.
  sizeBytes  Int
  isValid    Boolean  @default(false)  // set true after media processing
  createdAt  DateTime @default(now())

  @@index([postId])
}

// ─── FR-05: Replies (threaded) ──────────────────────────────

model Reply {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  parentId  String?  // null = top-level reply; set = nested reply
  parent    Reply?   @relation("ReplyThread", fields: [parentId], references: [id])
  children  Reply[]  @relation("ReplyThread")
  body      String   @db.Text

  upvoteCount   Int @default(0)
  downvoteCount Int @default(0)
  reputationContributed Int @default(0)  // capped at 30

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  votes     Vote[]
  reports   Report[]

  @@index([postId])
  @@index([parentId])
  @@index([authorId])
}

// ─── FR-05: Votes ───────────────────────────────────────────

enum VoteType {
  UPVOTE
  DOWNVOTE
}

enum VoteTarget {
  POST
  REPLY
}

model Vote {
  id        String     @id @default(cuid())
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      VoteType
  target    VoteTarget
  postId    String?
  post      Post?      @relation(fields: [postId], references: [id], onDelete: Cascade)
  replyId   String?
  reply     Reply?     @relation(fields: [replyId], references: [id], onDelete: Cascade)
  createdAt DateTime   @default(now())

  @@unique([userId, postId])    // one vote per user per post
  @@unique([userId, replyId])   // one vote per user per reply
  @@index([postId])
  @@index([replyId])
}

// ─── FR-05: Saved Posts ─────────────────────────────────────

model SavedPost {
  id      String   @id @default(cuid())
  userId  String
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId  String
  post    Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  savedAt DateTime @default(now())

  @@unique([userId, postId])
  @@index([userId])
}

// ─── FR-06: Moderation ──────────────────────────────────────

enum ModActionType {
  APPLICATION_APPROVED
  APPLICATION_REJECTED
  POST_APPROVED
  POST_REJECTED
  POST_REMOVED
  REPLY_REMOVED
  CHANNEL_APPROVED
  CHANNEL_REJECTED
  CHANNEL_ARCHIVED
  USER_SUSPENDED
  USER_UNSUSPENDED
  USER_BANNED
  USER_UNBANNED
  ROLE_ASSIGNED
  ROLE_REVOKED
  APPEAL_APPROVED
  APPEAL_REJECTED
}

model ModerationLog {
  id          String        @id @default(cuid())
  actionType  ModActionType
  actorId     String
  actor       User          @relation("ModActor", fields: [actorId], references: [id])
  targetUserId String?
  targetUser  User?         @relation("ModTarget", fields: [targetUserId], references: [id])
  targetPostId String?
  targetReplyId String?
  targetChannelId String?
  reason      String        @db.Text
  metadata    Json?         // additional context (suspension duration, etc.)
  createdAt   DateTime      @default(now())

  @@index([actorId])
  @@index([targetUserId])
  @@index([actionType])
  @@index([createdAt])
}

model Report {
  id          String   @id @default(cuid())
  reporterId  String
  reporter    User     @relation("Reporter", fields: [reporterId], references: [id])
  targetUserId String?
  targetUser  User?    @relation("ReportTarget", fields: [targetUserId], references: [id])
  postId      String?
  post        Post?    @relation(fields: [postId], references: [id])
  replyId     String?
  reply       Reply?   @relation(fields: [replyId], references: [id])
  reason      String   @db.Text
  resolved    Boolean  @default(false)
  resolvedBy  String?
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())

  @@index([resolved])
  @@index([createdAt])
}

enum AppealStatus {
  PENDING
  APPROVED
  REJECTED
}

model Appeal {
  id                String       @id @default(cuid())
  userId            String
  user              User         @relation(fields: [userId], references: [id])
  moderationLogId   String       // the original action being appealed
  reason            String       @db.Text
  status            AppealStatus @default(PENDING)
  reviewedBy        String?      // must be different from original mod
  reviewedAt        DateTime?
  reviewNote        String?
  createdAt         DateTime     @default(now())

  @@index([userId])
  @@index([status])
}

// ─── FR-07: Reputation Events ───────────────────────────────

enum ReputationEventType {
  POST_UPVOTE
  POST_DOWNVOTE
  COMMENT_UPVOTE
  COMMENT_DOWNVOTE
  REPLY_RECEIVED
  LOW_EFFORT_POST
  POST_REMOVED_BY_MOD
  REFERRAL_ACCEPTED
}

model ReputationEvent {
  id          String              @id @default(cuid())
  userId      String
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventType   ReputationEventType
  points      Int                 // actual points applied (after caps)
  sourcePostId   String?
  sourceReplyId  String?
  sourceUserId   String?          // e.g. the voter or the referred user
  createdAt   DateTime            @default(now())

  @@index([userId, createdAt])
  @@index([sourcePostId])
  @@index([sourceReplyId])
}

model DailyReputationLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date        DateTime @db.Date  // calendar date
  gainedToday Int      @default(0)  // positive points gained today (cap: 150)

  @@unique([userId, date])
  @@index([userId])
}

// ─── FR-09: Notifications ───────────────────────────────────

enum NotificationEventType {
  REPLY_TO_POST
  REPLY_TO_COMMENT
  UPVOTE_ON_POST
  UPVOTE_ON_COMMENT
  POST_APPROVED
  POST_REJECTED
  ACCOUNT_SUSPENDED
  APPEAL_OUTCOME
  REFERRAL_CODE_USED
  REFERRED_USER_ACCEPTED
  WORLDCOIN_LAPSE_WARNING
  SYSTEM_ANNOUNCEMENT
}

model Notification {
  id        String                @id @default(cuid())
  userId    String
  user      User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationEventType
  title     String
  body      String
  data      Json?                 // link to post, user, etc.
  read      Boolean               @default(false)
  emailSent Boolean               @default(false)
  createdAt DateTime              @default(now())

  @@index([userId, read, createdAt])
}

model NotificationPreference {
  id        String                @id @default(cuid())
  userId    String
  user      User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventType NotificationEventType
  inApp     Boolean               @default(true)
  email     Boolean               @default(true)

  @@unique([userId, eventType])
}

// ─── FR-10: Compliance ──────────────────────────────────────

enum DataRequestType {
  EXPORT
  DELETION
}

enum DataRequestStatus {
  PENDING
  PROCESSING
  COMPLETED
}

model DataRequest {
  id          String            @id @default(cuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id])
  type        DataRequestType
  status      DataRequestStatus @default(PENDING)
  completedAt DateTime?
  downloadUrl String?           // for exports, temporary signed URL
  createdAt   DateTime          @default(now())

  @@index([userId])
  @@index([status])
}

// ─── Admin-configurable settings (FR-07.11, FR-08.7) ────────

model PlatformConfig {
  id    String @id @default(cuid())
  key   String @unique
  value Json
  updatedAt DateTime @updatedAt

  // Keys include:
  // "reputation.weights" — { postUpvote: 4, commentUpvote: 3, ... }
  // "reputation.caps" — { perPost: 60, perComment: 30, dailyGain: 150 }
  // "reputation.thresholds" — [0, 100, 300, 700, 1500]
  // "reputation.referralAllocation" — [1, 3, 7, 15, -1]  (-1 = unlimited)
  // "feed.timeDecayHalfLife" — 21600 (seconds, default 6h)
  // "feed.posterMultiplier" — [1.0, 1.25, 1.5, 1.75, 2.0]
  // "feed.hotWindow" — 21600 (seconds)
  // "feed.trendingRefreshInterval" — 300 (seconds)
  // "session.expiryHours" — 168 (7 days)
}

// ─── Banned Identity Store (FR-06.7, FR-10.6) ───────────────

model BannedWorldcoinHash {
  id            String   @id @default(cuid())
  worldcoinHash String   @unique
  bannedAt      DateTime @default(now())
  reason        String
}
```

---

## API Endpoints

All endpoints are prefixed with `/api/v1`. Authentication is via JWT in the `Authorization: Bearer <token>` header.

### Auth (`auth.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| POST | `/auth/register` | Register with email/password | No | FR-02.1 |
| POST | `/auth/login` | Login with email/password | No | FR-02.1 |
| POST | `/auth/google` | Google OAuth login/register | No | FR-02.2 |
| POST | `/auth/forgot-password` | Request password reset email | No | FR-02.8 |
| POST | `/auth/reset-password` | Reset password with token | No | FR-02.8 |
| POST | `/auth/logout` | Invalidate current session | Yes | — |
| GET | `/auth/sessions` | List active sessions | Yes | FR-02.9 |
| DELETE | `/auth/sessions/:id` | Revoke a session | Yes | FR-02.9 |

### Applications (`auth.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| POST | `/applications` | Submit application (with optional referral code) | No | FR-01.3 |
| GET | `/applications` | List pending applications (mod) | Mod | FR-01.4 |
| PATCH | `/applications/:id` | Approve or reject application | Mod | FR-01.4 |
| POST | `/referral-codes/validate` | Check if a referral code is valid | No | FR-01.2 |

### Worldcoin Verification

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| POST | `/verify/worldcoin` | Submit Worldcoin proof for verification | Yes | FR-02.3 |
| GET | `/verify/status` | Check current verification status | Yes | FR-02.4 |

### Users (`users.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| GET | `/users/:slug` | Get public profile | Yes | FR-03.1 |
| GET | `/users/:slug/posts` | Get user's post history (paginated) | Yes | FR-03.3 |
| PATCH | `/users/me` | Update own profile (name, avatar, bio) | Yes | FR-03.6 |
| GET | `/users/me/dashboard` | Private dashboard (score breakdown, referral codes) | Yes | FR-03.8 |

### Channels (`channels.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| GET | `/channels` | List active channels | Yes | FR-04.5 |
| GET | `/channels/:slug` | Get channel details | Yes | FR-04.5 |
| POST | `/channels` | Request new channel | Yes | FR-04.1 |
| POST | `/channels/:slug/join` | Join a channel | Yes | FR-04.4 |
| DELETE | `/channels/:slug/join` | Leave a channel | Yes | FR-04.4 |
| PATCH | `/channels/:slug` | Update channel (owner) | Yes | FR-04.6 |

### Posts (`posts.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| POST | `/channels/:slug/posts` | Create post in channel | Yes | FR-05.1 |
| GET | `/posts/:id` | Get post with replies | Yes | FR-05.7 |
| PATCH | `/posts/:id` | Edit own post | Yes | FR-05.11 |
| DELETE | `/posts/:id` | Delete own post | Yes | FR-05.11 |
| POST | `/posts/:id/report` | Report a post | Yes | FR-05.10 |

### Replies (`replies.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| POST | `/posts/:id/replies` | Reply to post or reply (parentId in body) | Yes | FR-05.7 |
| PATCH | `/replies/:id` | Edit own reply | Yes | — |
| DELETE | `/replies/:id` | Delete own reply | Yes | — |
| POST | `/replies/:id/report` | Report a reply | Yes | FR-05.10 |

### Votes (`votes.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| POST | `/posts/:id/vote` | Upvote or downvote a post | Yes | FR-05.6 |
| POST | `/replies/:id/vote` | Upvote or downvote a reply | Yes | FR-05.8 |
| DELETE | `/posts/:id/vote` | Remove vote from post | Yes | — |
| DELETE | `/replies/:id/vote` | Remove vote from reply | Yes | — |

### Saved Posts

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| POST | `/posts/:id/save` | Bookmark a post | Yes | FR-05.9 |
| DELETE | `/posts/:id/save` | Remove bookmark | Yes | FR-05.9 |
| GET | `/saved` | List saved posts | Yes | FR-05.9 |

### Feeds (`posts.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| GET | `/feed/personalised` | Posts from joined channels, scored | Yes | FR-08.3 |
| GET | `/feed/trending` | Cross-channel trending | Yes | FR-08.2 |
| GET | `/feed/all` | Global front page | Yes | FR-08.4 |
| GET | `/channels/:slug/hot` | Hot feed for channel | Yes | FR-08.1 |
| GET | `/channels/:slug/new` | Chronological for channel | Yes | FR-08.5 |

### Moderation (`moderation.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| GET | `/mod/dashboard` | Dashboard summary counts | Mod | FR-06.2 |
| GET | `/mod/posts` | Staging queue | Mod | FR-06.3 |
| PATCH | `/mod/posts/:id` | Approve/reject post | Mod | FR-06.3 |
| DELETE | `/mod/posts/:id` | Remove approved post | Mod | FR-06.4 |
| DELETE | `/mod/replies/:id` | Remove reply | Mod | FR-06.4 |
| GET | `/mod/channels` | Pending channel requests | Mod | FR-04.2 |
| PATCH | `/mod/channels/:id` | Approve/reject channel | Mod | FR-04.2 |
| GET | `/mod/reports` | Flagged content | Mod | FR-06.2 |
| PATCH | `/mod/reports/:id` | Resolve report | Mod | — |
| POST | `/mod/users/:id/suspend` | Suspend user | Mod | FR-06.5 |
| POST | `/mod/users/:id/ban` | Ban user | Admin | FR-06.6 |
| POST | `/mod/users/:id/unsuspend` | Unsuspend user | Mod | — |
| GET | `/mod/appeals` | List appeals | Mod | FR-06.9 |
| PATCH | `/mod/appeals/:id` | Resolve appeal | Mod | FR-06.10 |
| GET | `/mod/log` | Moderation action log | Mod | FR-06.8 |

### Admin (`admin.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| PATCH | `/admin/users/:id/role` | Assign/revoke mod role | Admin | FR-06.1 |
| GET | `/admin/config` | Get all platform config | Admin | FR-07.11 |
| PATCH | `/admin/config/:key` | Update config value | Admin | FR-07.11 |
| POST | `/admin/channels/:id/archive` | Archive channel | Admin | FR-04.7 |

### Referrals (`referrals.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| GET | `/referrals/codes` | List my active referral codes | Yes | FR-07.9 |
| POST | `/referrals/codes/generate` | Generate new code (within monthly limit) | Yes | FR-07.6 |

### Notifications (`notifications.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| GET | `/notifications` | List notifications (paginated) | Yes | FR-09.5 |
| GET | `/notifications/unread-count` | Get unread badge count | Yes | FR-09.5 |
| PATCH | `/notifications/:id/read` | Mark one as read | Yes | FR-09.6 |
| POST | `/notifications/read-all` | Mark all as read | Yes | FR-09.6 |
| GET | `/notifications/preferences` | Get notification preferences | Yes | FR-09.2 |
| PATCH | `/notifications/preferences` | Update preferences | Yes | FR-09.2 |

### Compliance (`compliance.routes.ts`)

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| POST | `/compliance/export` | Request data export | Yes | FR-10.2 |
| POST | `/compliance/delete` | Request account deletion | Yes | FR-10.3 |
| GET | `/compliance/requests` | Check status of my requests | Yes | — |

### Media Upload

| Method | Path | Description | Auth | FR |
|--------|------|-------------|------|-----|
| POST | `/media/upload` | Upload image or video to R2 (returns URL) | Yes | FR-05.2/3 |

---

## Implementation Phases

The project is organised into 8 phases. Each phase produces a working, testable increment.

### Phase 1: Project Scaffolding & Infrastructure

**What gets built:** Empty project with all tooling, local development environment, database connection, CI/CD pipeline, and deploy pipeline working.

**Steps:**
1. Initialise Turborepo monorepo with `apps/web`, `apps/api`, `packages/shared`
2. Set up Next.js 14 (App Router) in `apps/web` with Tailwind + shadcn/ui
3. Set up Express app in `apps/api` with TypeScript
4. Add `docker-compose.yml` at project root — spins up local PostgreSQL (so developers never depend on Railway for local work)
5. Configure Prisma in `apps/api`, connect to local Docker PostgreSQL by default (Railway in production)
6. Run full database migration (schema above)
7. Seed `PlatformConfig` with default reputation weights, caps, thresholds
8. Set up environment variable templates (`.env.example`) with clear comments
9. Set up Vitest in `apps/api` for backend unit tests (test infrastructure only — actual tests written in Phases 4-7)
10. Add GitHub Actions CI pipeline (`.github/workflows/ci.yml`):
    - Runs on every push and pull request
    - Steps: install dependencies → type-check → lint → run tests → build
    - Blocks merging if any step fails
11. Configure Vercel deployment for `apps/web`
12. Configure Railway deployment for `apps/api`
13. Set up CORS so frontend can call backend
14. Create `README.md` with setup instructions (clone, `docker compose up`, copy `.env.example`, `turbo dev`)

**Success criteria:**
- `docker compose up` starts local PostgreSQL
- `turbo dev` starts both apps locally
- Frontend loads at `localhost:3000`
- Backend responds at `localhost:4000/api/v1/health`
- Prisma migration applies cleanly against local Docker database
- GitHub Actions CI runs green on push
- Vercel preview deploy works
- Railway deploy works

---

### Phase 2: Authentication & Access Control (FR-01, FR-02)

**What gets built:** Landing page, waitlist, application form, login/register, Google OAuth, password reset, session management. Users can apply, get approved, register, and log in.

**Steps:**
1. **Shared package:** Zod validation schemas for auth, application forms
2. **Backend:**
   - Auth routes: register, login, Google OAuth, password reset
   - Application routes: submit, list (mod), approve/reject
   - Referral code validation endpoint
   - JWT middleware, role-based middleware
   - Session management (create, list, revoke)
   - Email service (Resend) for approval/rejection/password reset emails
3. **Frontend:**
   - Landing page with waitlist form + referral code field
   - Application form (unlocked by valid referral code)
   - Login page (email/password + Google button)
   - Register page
   - Forgot/reset password pages
   - Auth context provider (useAuth hook)
   - Protected route wrapper (redirects unauthenticated users)

**Success criteria:**
- Visitor sees landing/waitlist page
- Valid referral code unlocks application form
- Application submits and appears in mod queue
- Mod can approve/reject applications
- Approved user can register and log in
- Google OAuth works
- Password reset flow works end to end
- Sessions can be listed and revoked

---

### Phase 3: Worldcoin Verification & User Profiles (FR-02.3–7, FR-03)

**What gets built:** Worldcoin verification step, user profiles, profile editing, "Verified Human" badge display.

**Steps:**
1. **Backend:**
   - Worldcoin verification endpoint (verify proof, store hash, check uniqueness)
   - User profile endpoints (get by slug, update, dashboard)
   - Worldcoin lapse check background job (7-day grace → suspend)
   - Stub Worldcoin integration (mock mode for development, real World ID for production)
2. **Frontend:**
   - Verification page (`/verify`) with World ID widget
   - Profile page (`/u/:slug`) — display name, avatar, star rank, post history, referral count, verified badge
   - Profile edit page
   - Private dashboard page (score breakdown, referral codes)

**Success criteria:**
- New approved user is prompted to verify with Worldcoin before accessing the app
- Duplicate Worldcoin hash is rejected
- Profile page shows all required fields
- "Verified Human" badge displays correctly
- Profile editing works (name, avatar, bio)
- Dashboard shows score breakdown

---

### Phase 4: Channels & Posts (FR-04, FR-05)

**What gets built:** Channel creation requests, channel pages, post creation with media upload, post staging queue, threaded replies, voting, bookmarks.

**Steps:**
1. **Backend:**
   - Channel routes: create request, list, get by slug, join/leave
   - Media upload endpoint (R2 integration with presigned URLs)
   - Media processing job (validate format, size, set `isValid`)
   - Post routes: create (enters PROCESSING → STAGING), get with replies, edit, delete
   - Reply routes: create (threaded), edit, delete
   - Vote routes: upvote/downvote posts and replies (prevent self-voting)
   - Save/bookmark routes
   - Report routes
   - Denormalised count updates (upvoteCount, downvoteCount, replyCount on post/reply)
2. **Frontend:**
   - Channel directory page (`/c`)
   - Channel page (`/c/:slug`) with post feed
   - "Request new channel" form
   - Post creation form with image/video upload
   - Post detail page with threaded reply tree
   - Vote buttons component (upvote/downvote with counts)
   - Reply composer (nested)
   - Save/bookmark button
   - Report dialog

**Unit tests (written in this phase):**
- Vote service: self-vote prevention, vote toggling, one-vote-per-user enforcement
- Denormalised count updates: upvoteCount/downvoteCount/replyCount stay accurate

**Success criteria:**
- User can request a channel
- Approved channel appears in directory
- User can join/leave channels
- Post with images/videos uploads to R2 and enters staging
- Threaded replies render at unlimited depth
- Voting works (prevents self-voting, toggles)
- Bookmarking works
- Reporting flags content
- All unit tests pass in CI

---

### Phase 5: Moderation System (FR-06)

**What gets built:** Full moderation dashboard — application queue, post staging queue, channel requests, flagged content, user management, suspension/ban, appeals, audit log.

**Steps:**
1. **Backend:**
   - Mod dashboard summary endpoint (counts)
   - Post staging queue: approve/reject with mandatory reason
   - Post/reply removal with reason
   - Channel request approval/rejection
   - User suspension (with duration) and ban
   - Ban stores Worldcoin hash in `BannedWorldcoinHash`
   - Appeal submission and review (enforces different reviewer)
   - Full moderation audit log
2. **Frontend:**
   - Mod dashboard (`/mod`) with summary cards
   - Applications queue page
   - Post staging queue page (with media preview)
   - Channel requests page
   - Flagged content / reports page
   - User management page (search, suspend, ban)
   - Appeals queue page
   - Moderation log page (filterable)
   - Appeal form (user-facing, from notification or settings)

**Success criteria:**
- Mod sees all pending queues with accurate counts
- Post approval makes post public; rejection notifies author with reason
- Removed post/reply disappears from feeds
- Suspension prevents login for duration
- Ban blocks login + blocks Worldcoin hash from re-registration
- Appeal is routed to a different moderator
- All actions logged with timestamp, actor, reason

---

### Phase 6: Star Rank & Reputation System (FR-07)

**What gets built:** Full reputation scoring engine with signals, caps, daily ceiling, star rank derivation, and referral code allocation.

**Steps:**
1. **Backend:**
   - `reputation.service.ts`: Core scoring engine
     - On vote: calculate points (with per-content cap check), check daily gain ceiling, create ReputationEvent, update user score + rank
     - On reply received: +2 to post author (with daily cap check)
     - On post removed by mod: −5 (uncapped)
     - 48h low-effort check job: posts with <2 upvotes get −1
     - On referral accepted: +20 (uncapped per-referral, but subject to daily cap)
   - Star rank recalculation (on every score change)
   - Monthly referral code refresh job (expire old codes, allocate new based on rank)
   - Referral code generation (unique, single-use, 30-day expiry)
   - Admin config endpoints for weights/caps/thresholds
2. **Frontend:**
   - Star badge component (1–5 stars with label)
   - Dashboard: score history chart, breakdown by signal type, active referral codes with copy/share
   - Admin settings page: edit weights, caps, thresholds
   - Referral code management (view, copy, share)

**Unit tests (written in this phase):**
- Reputation service: all signal types apply correct weights
- Per-post cap: score stops at +60 regardless of additional upvotes
- Per-comment cap: score stops at +30
- Daily ceiling: positive gains stop at +150/day; negative penalties still apply
- Star rank derivation: correct rank at each threshold boundary (99→1, 100→2, etc.)
- Referral code generation: respects monthly allocation per rank
- Referral code expiry: codes expire after 30 days
- Low-effort penalty: post with <2 upvotes at 48h gets −1

**Success criteria:**
- Upvoting a post gives author +4 (or less if daily cap reached)
- Per-post cap of +60 enforced (further upvotes don't add score)
- Daily cap of +150 enforced for positive events
- Negative penalties always apply in full
- Star rank updates immediately on score change
- Referral codes generated monthly based on rank
- Unused codes expire after 30 days
- Admin can change all weights/caps without code deploy
- All unit tests pass in CI

---

### Phase 7: Feed & Discovery Algorithm (FR-08)

**What gets built:** All five feed surfaces with the post score formula, time decay, and poster multiplier.

**Steps:**
1. **Backend:**
   - `feedScoring.ts`: Implement score formula `S = (Up − Down + (Replies × 0.5)) × PosterMultiplier × TimeDecay(t)`
   - Score recalculation (on each vote/reply, or periodic batch)
   - Hot feed: filter by channel, rank by velocity within configurable window
   - Trending feed: cross-channel velocity ranking, cached with configurable refresh interval
   - Personalised feed: joined channels, scored, with freshness boost for unvisited channels
   - Global feed: top-scoring across all channels
   - Chronological feed: simple reverse-chronological, no scoring
   - All feeds paginated with cursor-based pagination
2. **Frontend:**
   - Feed page (`/feed`) — personalised, default home
   - Trending page (`/trending`)
   - Global page (`/all`)
   - Channel page feed switcher (Hot / New tabs)
   - Infinite scroll on all feeds
   - Feed sorting controls

**Unit tests (written in this phase):**
- Feed scoring formula: correct output for known inputs (upvotes, downvotes, replies, poster rank, time)
- Time decay function: score decreases as post ages
- Poster multiplier: Rank 1 = 1.0×, Rank 5 = 2.0×, correct interpolation
- Personalised feed: excludes posts from non-joined channels

**Success criteria:**
- Personalised feed shows posts only from joined channels
- Hot feed reflects recent engagement velocity
- Trending surfaces top posts cross-channel
- Higher-ranked users' posts score higher (poster multiplier visible in ranking)
- Chronological feed ignores scoring
- All feeds paginate correctly under load
- Admin can adjust decay, multiplier, and window parameters
- All unit tests pass in CI

---

### Phase 8: Notifications & Compliance (FR-09, FR-10)

**What gets built:** Full notification system (in-app + email), user notification preferences, GDPR compliance features.

**Steps:**
1. **Backend — Notifications:**
   - `notification.service.ts`: Create notification on each event type
   - Check user preferences before sending (in-app and/or email)
   - Email sending via Resend (with unsubscribe link)
   - Notification list, unread count, mark read, mark all read
   - Default notification preferences on account creation
2. **Backend — Compliance:**
   - Data export job: compile user's data into JSON, upload to R2, generate temporary signed URL
   - Account deletion job: anonymise/delete personal data, retain pseudonymised mod logs for 12 months
   - Banned user hash retention (delete non-banned hashes on erasure)
   - Cookie consent tracking
3. **Frontend — Notifications:**
   - Notification bell in navbar with unread badge count
   - Notification inbox page (`/notifications`)
   - Notification preferences page (`/settings/notifications`)
   - Individual and bulk "mark as read"
4. **Frontend — Compliance:**
   - Cookie consent banner (granular accept/reject)
   - Privacy settings page (`/settings/privacy`) — data export request, account deletion request
   - Privacy Policy and Terms of Service pages (linked from landing, app form, settings)
   - Request status tracking

**Success criteria:**
- Notifications appear in-app for all event types
- Email notifications sent based on user preferences
- Emails include working unsubscribe link
- User can toggle each notification type independently
- Data export generates downloadable file within reasonable time
- Account deletion anonymises data (display name → "Deleted User", etc.)
- Mod logs retained with pseudonymised IDs after deletion
- Cookie consent banner appears for new visitors
- Privacy Policy / ToS pages accessible from all key pages

---

## Background Jobs Summary

| Job | Schedule | Purpose | FR |
|-----|----------|---------|-----|
| Media processor | On upload (queue) | Validate image/video format and size | FR-05.2/3 |
| Low-effort post penalty | Every hour | Check 48h-old posts with <2 upvotes, apply −1 | FR-07A |
| Worldcoin lapse checker | Daily | Notify users with lapsed verification; suspend after 7 days | FR-02.6/7 |
| Referral code monthly refresh | 1st of each month | Expire old codes, allocate new based on current rank | FR-07.6/7 |
| Feed score recalculation | Every 5 minutes | Batch recalculate post scores with time decay | FR-08A |
| Trending feed cache refresh | Configurable (default 5 min) | Rebuild trending feed cache | FR-08.2 |
| Data export processor | On request (queue) | Compile user data into downloadable JSON | FR-10.2 |
| Account deletion processor | On request (queue) | Anonymise/delete user data | FR-10.3 |

---

## What We're NOT Building (v1)

Per the requirements document, section 4:

- Polls, link posts, or long-form article post types
- Direct messaging between users
- Mobile native applications
- Premium subscriptions or monetisation
- Third-party API / developer integrations
- Automated AI content moderation
- Apple or GitHub OAuth

---

## Environment Variables

```bash
# apps/api/.env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Worldcoin
WORLDCOIN_APP_ID=...
WORLDCOIN_ACTION=verify-human
WORLDCOIN_MOCK=true  # set false in production

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=basedcollective-media
R2_PUBLIC_URL=...

# Resend
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@basedcollective.com

# Frontend URL (for CORS, email links)
FRONTEND_URL=http://localhost:3000

# apps/web/.env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_WORLDCOIN_APP_ID=...
```

---

## Deployment Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────────┐
│   User Browser  │ ──────────────→│  Vercel (Next.js)   │
│                 │                 │  apps/web            │
└─────────────────┘                └──────────┬──────────┘
                                              │ API calls
                                              ▼
                                   ┌─────────────────────┐
                                   │  Railway (Express)   │
                                   │  apps/api            │
                                   └──────┬───────┬──────┘
                                          │       │
                              ┌───────────┘       └──────────┐
                              ▼                              ▼
                   ┌──────────────────┐          ┌───────────────────┐
                   │ Railway Postgres │          │  Cloudflare R2    │
                   │ (database)       │          │  (media storage)  │
                   └──────────────────┘          └───────────────────┘
                                                          │
                              ┌────────────────────────────┘
                              ▼
                   ┌──────────────────┐
                   │  Resend          │
                   │  (email delivery)│
                   └──────────────────┘
```

---

## References

- Functional requirements: Notion document (basedspace/Functional-Requirements-basedcollective)
- Decision log: Section 5 of requirements document
