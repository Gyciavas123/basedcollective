import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Admin account ──
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_DISPLAY_NAME || 'Admin';

  if (adminEmail && adminPassword) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      const slug = adminName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-admin';
      await prisma.user.create({
        data: { email: adminEmail, passwordHash, displayName: adminName, slug, role: 'ADMIN', status: 'ACTIVE' },
      });
      console.log(`Admin account created: ${adminEmail}`);
    } else {
      console.log(`Admin account already exists: ${adminEmail}`);
    }
  }

  // ── Platform config ──
  const configs = [
    { key: 'reputation.weights', value: { postUpvote: 4, postDownvote: -2, commentUpvote: 3, commentDownvote: -1, replyReceived: 2, lowEffortPost: -1, postRemovedByMod: -5, referralAccepted: 20 } },
    { key: 'reputation.caps', value: { perPost: 60, perComment: 30, dailyGain: 150 } },
    { key: 'reputation.thresholds', value: [0, 100, 300, 700, 1500] },
    { key: 'reputation.referralAllocation', value: [1, 3, 7, 15, -1] },
    { key: 'feed.timeDecayHalfLife', value: 21600 },
    { key: 'feed.posterMultiplier', value: [1.0, 1.25, 1.5, 1.75, 2.0] },
    { key: 'feed.hotWindow', value: 21600 },
    { key: 'feed.trendingRefreshInterval', value: 300 },
    { key: 'session.expiryHours', value: 168 },
  ];
  for (const config of configs) {
    await prisma.platformConfig.upsert({ where: { key: config.key }, update: { value: config.value }, create: { key: config.key, value: config.value } });
  }
  console.log('Platform config seeded');

  // ── Check if demo data already exists ──
  const existingDemoUser = await prisma.user.findUnique({ where: { email: 'sarah.chen@demo.com' } });
  if (existingDemoUser) {
    console.log('Demo data already exists, skipping');
    return;
  }

  // ── Demo users ──
  const passwordHash = await bcrypt.hash('demo123', 12);

  const users = await Promise.all([
    prisma.user.create({ data: { email: 'sarah.chen@demo.com', passwordHash, displayName: 'Sarah Chen', slug: 'sarah-chen', bio: 'Product designer turned founder. Building tools for the next generation of creators.', role: 'MODERATOR', status: 'ACTIVE', reputationScore: 820, starRank: 4, worldcoinHash: 'mock_sarah', worldcoinVerifiedAt: new Date('2026-01-15') } }),
    prisma.user.create({ data: { email: 'marcus.johnson@demo.com', passwordHash, displayName: 'Marcus Johnson', slug: 'marcus-johnson', bio: 'Full-stack dev. Open source enthusiast. Coffee addict.', role: 'USER', status: 'ACTIVE', reputationScore: 450, starRank: 3, worldcoinHash: 'mock_marcus', worldcoinVerifiedAt: new Date('2026-02-01') } }),
    prisma.user.create({ data: { email: 'elena.rodriguez@demo.com', passwordHash, displayName: 'Elena Rodriguez', slug: 'elena-rodriguez', bio: 'Growth marketer at a B2B SaaS. Previously at Stripe.', role: 'USER', status: 'ACTIVE', reputationScore: 1650, starRank: 5, worldcoinHash: 'mock_elena', worldcoinVerifiedAt: new Date('2026-01-20') } }),
    prisma.user.create({ data: { email: 'james.wright@demo.com', passwordHash, displayName: 'James Wright', slug: 'james-wright', bio: 'Angel investor. Ex-Coinbase. Interested in DeFi and governance.', role: 'USER', status: 'ACTIVE', reputationScore: 180, starRank: 2, worldcoinHash: 'mock_james', worldcoinVerifiedAt: new Date('2026-03-01') } }),
    prisma.user.create({ data: { email: 'aisha.patel@demo.com', passwordHash, displayName: 'Aisha Patel', slug: 'aisha-patel', bio: 'Data scientist. Researching reputation systems and trust networks.', role: 'USER', status: 'ACTIVE', reputationScore: 350, starRank: 3, worldcoinHash: 'mock_aisha', worldcoinVerifiedAt: new Date('2026-02-10') } }),
    prisma.user.create({ data: { email: 'tom.baker@demo.com', passwordHash, displayName: 'Tom Baker', slug: 'tom-baker', bio: 'Indie hacker. Shipping fast, breaking things, fixing them.', role: 'USER', status: 'ACTIVE', reputationScore: 75, starRank: 1, worldcoinHash: 'mock_tom', worldcoinVerifiedAt: new Date('2026-03-10') } }),
    prisma.user.create({ data: { email: 'nina.kowalski@demo.com', passwordHash, displayName: 'Nina Kowalski', slug: 'nina-kowalski', bio: 'Community builder. Ran communities at Discord and Reddit.', role: 'MODERATOR', status: 'ACTIVE', reputationScore: 920, starRank: 4, worldcoinHash: 'mock_nina', worldcoinVerifiedAt: new Date('2026-01-25') } }),
    prisma.user.create({ data: { email: 'david.kim@demo.com', passwordHash, displayName: 'David Kim', slug: 'david-kim', bio: 'Blockchain developer. Working on decentralized identity.', role: 'USER', status: 'ACTIVE', reputationScore: 540, starRank: 3, worldcoinHash: 'mock_david', worldcoinVerifiedAt: new Date('2026-02-05') } }),
    // Pending users for mod queue testing
    prisma.user.create({ data: { email: 'pending1@demo.com', passwordHash, displayName: 'Alex Turner', slug: 'alex-turner', status: 'PENDING_APPROVAL', reputationScore: 0, starRank: 1 } }),
    prisma.user.create({ data: { email: 'pending2@demo.com', passwordHash, displayName: 'Mia Sanchez', slug: 'mia-sanchez', status: 'PENDING_APPROVAL', reputationScore: 0, starRank: 1 } }),
    prisma.user.create({ data: { email: 'pending3@demo.com', passwordHash, displayName: 'Ryan O\'Connor', slug: 'ryan-oconnor', status: 'PENDING_APPROVAL', reputationScore: 0, starRank: 1 } }),
  ]);

  const [sarah, marcus, elena, james, aisha, tom, nina, david, pendingAlex, pendingMia, pendingRyan] = users;
  console.log(`Created ${users.length} demo users`);

  // ── Applications for pending users ──
  await Promise.all([
    prisma.application.create({ data: { userId: pendingAlex.id, email: pendingAlex.email, displayName: pendingAlex.displayName, reasonForJoining: 'I\'m a startup founder looking to connect with other builders and share GTM learnings. Found this community through a friend.', socialLinks: 'twitter.com/alexturner_dev', status: 'PENDING' } }),
    prisma.application.create({ data: { userId: pendingMia.id, email: pendingMia.email, displayName: pendingMia.displayName, reasonForJoining: 'Product manager at a Series B fintech. Want to learn from others about community-driven growth and reputation systems.', socialLinks: 'linkedin.com/in/miasanchez', status: 'PENDING' } }),
    prisma.application.create({ data: { userId: pendingRyan.id, email: pendingRyan.email, displayName: pendingRyan.displayName, reasonForJoining: 'Web3 developer interested in decentralized governance. Building a DAO toolkit and want feedback from this community.', socialLinks: 'github.com/ryanoconnor', status: 'PENDING' } }),
  ]);
  console.log('Created 3 pending applications');

  // ── Channels ──
  const channels = await Promise.all([
    prisma.channel.create({ data: { name: 'Startups', slug: 'startups', description: 'Discuss startup strategy, fundraising, hiring, and building products from 0 to 1.', rules: '1. No self-promotion spam\n2. Share actionable insights, not just links\n3. Be constructive in feedback', status: 'ACTIVE', ownerId: sarah.id, postCount: 0, memberCount: 0 } }),
    prisma.channel.create({ data: { name: 'Engineering', slug: 'engineering', description: 'Software engineering discussions — architecture, tooling, best practices, and war stories.', rules: '1. Include code examples when possible\n2. No "just Google it" replies\n3. Beginner questions welcome', status: 'ACTIVE', ownerId: marcus.id, postCount: 0, memberCount: 0 } }),
    prisma.channel.create({ data: { name: 'Growth & Marketing', slug: 'growth-marketing', description: 'Strategies for user acquisition, retention, SEO, content marketing, and growth loops.', rules: '1. Share data and results, not just theory\n2. No affiliate link spam\n3. Respect NDA-level information', status: 'ACTIVE', ownerId: elena.id, postCount: 0, memberCount: 0 } }),
    prisma.channel.create({ data: { name: 'Crypto & Web3', slug: 'crypto-web3', description: 'DeFi, DAOs, tokenomics, smart contracts, and the decentralized future.', rules: '1. No shilling tokens\n2. Technical discussion preferred\n3. Label speculative takes as opinion', status: 'ACTIVE', ownerId: david.id, postCount: 0, memberCount: 0 } }),
    prisma.channel.create({ data: { name: 'Design', slug: 'design', description: 'UI/UX design, product design, design systems, and visual storytelling.', rules: '1. Include visuals when discussing design\n2. Constructive critique only\n3. Credit original work', status: 'ACTIVE', ownerId: sarah.id, postCount: 0, memberCount: 0 } }),
    prisma.channel.create({ data: { name: 'Community Building', slug: 'community-building', description: 'How to build, grow, and moderate online communities. Moderation strategies, engagement tactics, and tools.', rules: '1. Share real experiences\n2. No gatekeeping\n3. Be welcoming to newcomers', status: 'ACTIVE', ownerId: nina.id, postCount: 0, memberCount: 0 } }),
    // Pending channels for mod queue
    prisma.channel.create({ data: { name: 'AI & Machine Learning', slug: 'ai-ml', description: 'Discussions about AI, ML, LLMs, and their practical applications in products.', status: 'PENDING', ownerId: aisha.id } }),
    prisma.channel.create({ data: { name: 'Freelancing', slug: 'freelancing', description: 'Tips and discussion for freelancers and independent contractors.', status: 'PENDING', ownerId: tom.id } }),
  ]);

  const [startups, engineering, growthMarketing, cryptoWeb3, design, communityBuilding] = channels;
  console.log(`Created ${channels.length} channels (6 active, 2 pending)`);

  // ── Channel memberships ──
  const activeUsers = [sarah, marcus, elena, james, aisha, tom, nina, david];
  const activeChannels = [startups, engineering, growthMarketing, cryptoWeb3, design, communityBuilding];

  const memberships: { userId: string; channelId: string }[] = [];
  for (const user of activeUsers) {
    // Each user joins 3-5 random channels
    const shuffled = [...activeChannels].sort(() => Math.random() - 0.5);
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      memberships.push({ userId: user.id, channelId: shuffled[i].id });
    }
  }
  // Dedupe
  const uniqueMemberships = memberships.filter((m, i, arr) =>
    arr.findIndex((x) => x.userId === m.userId && x.channelId === m.channelId) === i
  );
  await Promise.all(uniqueMemberships.map((m) => prisma.channelMember.create({ data: m })));
  // Update member counts
  for (const ch of activeChannels) {
    const count = uniqueMemberships.filter((m) => m.channelId === ch.id).length;
    await prisma.channel.update({ where: { id: ch.id }, data: { memberCount: count } });
  }
  console.log(`Created ${uniqueMemberships.length} channel memberships`);

  // ── Posts ──
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);

  const postData = [
    // Startups
    { channelId: startups.id, authorId: sarah.id, title: 'We just hit $1M ARR — here\'s what actually moved the needle', body: 'After 18 months of grinding, we crossed the $1M ARR milestone last week. I want to share what actually worked vs. what we wasted time on.\n\n**What worked:**\n- Cold outbound with hyper-personalized emails (not templates)\n- Building in public on Twitter — our best leads came from people following our journey\n- A freemium tier that was actually useful, not crippled\n\n**What didn\'t work:**\n- Google Ads (CAC was 3x our target)\n- Attending conferences before we had product-market fit\n- Hiring a VP Sales too early\n\nHappy to answer questions about the journey.', status: 'APPROVED', approvedAt: hoursAgo(2), createdAt: hoursAgo(3), upvoteCount: 42, downvoteCount: 2, replyCount: 8, score: 38 },
    { channelId: startups.id, authorId: james.id, title: 'What\'s the best structure for a pre-seed round in 2026?', body: 'I\'m raising a pre-seed round (~$500k) and getting conflicting advice on structure. SAFE vs priced round? What cap is reasonable for a B2B SaaS with $5k MRR and 20% month-over-month growth?\n\nI\'ve talked to 3 angels so far and each has a different opinion. Would love to hear from founders who\'ve done this recently.', status: 'APPROVED', approvedAt: hoursAgo(5), createdAt: hoursAgo(6), upvoteCount: 15, downvoteCount: 1, replyCount: 12, score: 14 },
    { channelId: startups.id, authorId: tom.id, title: 'Launched my SaaS last week — 0 signups. What am I doing wrong?', body: 'Built a project management tool for small agencies (think Basecamp alternative). Launched on Product Hunt, got 50 upvotes, but zero actual signups.\n\nLanding page: clean, explains the value prop\nPricing: $29/mo\nTarget: small creative agencies (5-20 people)\n\nIs the market too crowded? Is $29/mo too much for agencies? Or is my positioning just off?\n\nWould really appreciate honest feedback.', status: 'APPROVED', approvedAt: hoursAgo(8), createdAt: hoursAgo(10), upvoteCount: 23, downvoteCount: 3, replyCount: 15, score: 19 },

    // Engineering
    { channelId: engineering.id, authorId: marcus.id, title: 'Why we migrated from microservices back to a monolith', body: 'I know this is a hot take, but hear me out.\n\nOur team of 6 was running 14 microservices. The operational overhead was killing us:\n- 14 separate CI/CD pipelines\n- Distributed tracing that never quite worked\n- Network latency issues between services\n- Deployment coordination nightmares\n\nWe spent a month migrating back to a modular monolith (Rails). Result: deployment time went from 45 min to 3 min, our P99 latency dropped 60%, and we could actually ship features again.\n\nMicroservices make sense at scale. For a small team, they\'re premature optimization. Fight me.', status: 'APPROVED', approvedAt: hoursAgo(1), createdAt: hoursAgo(2), upvoteCount: 67, downvoteCount: 8, replyCount: 24, score: 55 },
    { channelId: engineering.id, authorId: david.id, title: 'A practical guide to database indexing that I wish I had earlier', body: 'I see so many engineers slapping indexes on columns without understanding what they\'re doing. Here\'s the mental model that finally made it click for me:\n\n**Think of indexes like a book\'s index:**\n- A B-tree index is like an alphabetical index at the back\n- A hash index is like looking up a word in a dictionary\n- A composite index is like an index sorted by (last name, first name)\n\n**Rules of thumb:**\n1. Index columns you WHERE on frequently\n2. For composite indexes, order matters — most selective column first\n3. Don\'t index columns with low cardinality (boolean, status with 3 values)\n4. Every index slows down writes — be intentional\n5. Use EXPLAIN ANALYZE, not guesswork\n\nThe biggest win I ever got was adding a composite index on (user_id, created_at) to a notifications table. Query time went from 2.3s to 4ms.', status: 'APPROVED', approvedAt: hoursAgo(4), createdAt: hoursAgo(5), upvoteCount: 89, downvoteCount: 1, replyCount: 11, score: 82 },
    { channelId: engineering.id, authorId: aisha.id, title: 'How we handle rate limiting at scale without Redis', body: 'Everyone reaches for Redis when they need rate limiting, but we found a simpler approach using PostgreSQL\'s advisory locks and a sliding window counter.\n\nThe approach:\n1. Use a `rate_limits` table with (key, window_start, count)\n2. On each request, UPSERT with increment\n3. Use pg_advisory_xact_lock to prevent race conditions\n4. Clean up old windows with a periodic job\n\nPerformance: handles ~5k req/s on a single Postgres instance. Good enough for 95% of applications.\n\nThe code is surprisingly simple — about 30 lines of SQL. Happy to share if there\'s interest.', status: 'APPROVED', approvedAt: hoursAgo(12), createdAt: hoursAgo(14), upvoteCount: 34, downvoteCount: 2, replyCount: 7, score: 28 },

    // Growth & Marketing
    { channelId: growthMarketing.id, authorId: elena.id, title: 'The content strategy that grew us from 0 to 50k monthly visitors in 6 months', body: 'No tricks, no hacks. Just disciplined execution of a simple strategy:\n\n**1. Bottom-of-funnel first**\nWe wrote comparison pages (us vs competitor X) and "best tools for Y" roundups. These convert immediately because the reader already has intent.\n\n**2. Build topical authority**\nWe published 3 long-form guides per week in our core topic cluster. Each one internally linked to our product pages and to each other.\n\n**3. Distribution > Creation**\nFor every article we wrote, we spent 2x the time distributing it: posting snippets on LinkedIn, answering related questions on Reddit, creating Twitter threads.\n\n**Results:**\n- Month 1: 800 visitors\n- Month 3: 12k visitors\n- Month 6: 52k visitors\n- ~30% of signups now come from organic search\n\nThe key insight: most startups create content and pray. You need a distribution system.', status: 'APPROVED', approvedAt: hoursAgo(3), createdAt: hoursAgo(4), upvoteCount: 55, downvoteCount: 3, replyCount: 18, score: 48 },
    { channelId: growthMarketing.id, authorId: james.id, title: 'Is paid acquisition dead for bootstrapped startups?', body: 'CPMs on Meta are up 40% YoY. Google Ads CPCs in B2B SaaS are $15-30. TikTok ads feel like a lottery.\n\nAs a bootstrapped founder with a $2k/mo marketing budget, I\'m struggling to make paid work. Our LTV is around $500, so I need CAC under $100 to make the math work.\n\nHas anyone found channels that still work at small budgets? Or should I go all-in on organic and community?', status: 'APPROVED', approvedAt: hoursAgo(7), createdAt: hoursAgo(8), upvoteCount: 28, downvoteCount: 4, replyCount: 21, score: 22 },

    // Crypto & Web3
    { channelId: cryptoWeb3.id, authorId: david.id, title: 'A sober look at where DAOs actually work (and where they don\'t)', body: 'After working with 5 different DAOs over the past 2 years, here\'s my honest assessment:\n\n**Where DAOs work well:**\n- Treasury management (multi-sig + governance votes)\n- Grant allocation (Gitcoin model)\n- Protocol parameter changes (Uniswap governance)\n\n**Where DAOs struggle:**\n- Day-to-day operations (too slow for real-time decisions)\n- Hiring and firing (governance voting on personnel is awful)\n- Product development (design by committee = bad design)\n\n**The pattern I see working:** A small, empowered core team that executes, with DAO governance for high-stakes financial decisions. Basically a company with a decentralized board.\n\nPure "flat" DAOs with no hierarchy are mostly cosplay IMO.', status: 'APPROVED', approvedAt: hoursAgo(6), createdAt: hoursAgo(7), upvoteCount: 41, downvoteCount: 6, replyCount: 16, score: 31 },
    { channelId: cryptoWeb3.id, authorId: james.id, title: 'EIP-7702 is going to change how we think about wallets', body: 'Just spent the weekend diving into EIP-7702 and I think this is the most important Ethereum improvement since EIP-4337.\n\nTL;DR: It lets EOAs (regular wallets) temporarily delegate to smart contract code. This means:\n- Batch transactions without a separate smart wallet\n- Sponsored gas fees natively\n- Session keys for gaming/social apps\n- All without migrating to a new wallet address\n\nThe UX implications are massive. We can finally stop asking users to "approve" every single transaction. This could be the thing that makes crypto apps feel normal.', status: 'APPROVED', approvedAt: hoursAgo(10), createdAt: hoursAgo(11), upvoteCount: 19, downvoteCount: 2, replyCount: 9, score: 16 },

    // Design
    { channelId: design.id, authorId: sarah.id, title: 'The design system mistakes we made (so you don\'t have to)', body: 'We spent 6 months building a design system for our product. Here\'s what went wrong and what I\'d do differently:\n\n**Mistake 1: Building components nobody asked for**\nWe built 40+ components upfront. Engineers used maybe 15 of them. The rest rot.\n\n**Mistake 2: Too many variants**\nOur Button component had 12 variants. We used 4 in production. Simplify ruthlessly.\n\n**Mistake 3: Not involving engineers from day 1**\nDesigners designed tokens and components in Figma. Engineers couldn\'t implement half of them cleanly. Now we co-design everything.\n\n**Mistake 4: Perfecting before shipping**\nWe waited for the system to be "complete" before releasing it. Should have shipped incrementally.\n\n**What worked:** Treating the design system as a product with its own roadmap, backlog, and user feedback loops (the users being our own team).', status: 'APPROVED', approvedAt: hoursAgo(9), createdAt: hoursAgo(10), upvoteCount: 37, downvoteCount: 1, replyCount: 14, score: 33 },

    // Community Building
    { channelId: communityBuilding.id, authorId: nina.id, title: 'How we reduced toxic behavior by 80% without heavy-handed moderation', body: 'I\'ve been moderating online communities for 8 years. The biggest lesson I\'ve learned is that **architecture beats policing**.\n\nHere\'s what actually reduced toxicity in our 50k-member community:\n\n1. **Slow onboarding**: New members can only read for 24 hours, then comment for a week, before posting. This filters drive-by trolls.\n\n2. **Reputation-gated features**: You earn the ability to create threads, post links, and use reactions. This gives people something to lose.\n\n3. **Community-driven norms**: We let the top 1% of contributors help define the rules. When rules come from peers, compliance goes up.\n\n4. **Transparent moderation**: Every mod action is logged publicly with the reason. This builds trust and deters power trips.\n\n5. **De-escalation training**: Our mods are trained to de-escalate, not punish. First response is always a gentle redirect.\n\nResult: Reports dropped 80%, and member satisfaction (surveyed quarterly) went from 6.2 to 8.7/10.', status: 'APPROVED', approvedAt: hoursAgo(5), createdAt: hoursAgo(6), upvoteCount: 72, downvoteCount: 2, replyCount: 19, score: 64 },
    { channelId: communityBuilding.id, authorId: aisha.id, title: 'Research: reputation systems and their effect on contribution quality', body: 'I\'ve been researching reputation systems academically and wanted to share some findings that are relevant to platforms like this one.\n\n**Key findings from the literature:**\n\n1. **Visible reputation increases contribution quality** — but only up to a point. After ~Rank 3 equivalent, quality plateaus while gaming increases.\n\n2. **Daily caps work** — Stack Overflow\'s 200-rep daily cap is one of the best-studied mechanisms. It prevents runaway leaders and gives new users a chance.\n\n3. **Negative reputation is tricky** — Systems that penalize too aggressively see a chilling effect where people stop contributing rather than risk losing points.\n\n4. **Peer-awarded vs system-awarded** — Peer votes (like upvotes) correlate better with actual quality than automated metrics.\n\n5. **Decay matters** — Reputation that never decays creates permanent hierarchies. Some decay mechanism (even slow) keeps the system healthy.\n\nI think BasedCollective\'s system is well-designed. The per-post caps and daily limits address most of the known failure modes.', status: 'APPROVED', approvedAt: hoursAgo(15), createdAt: hoursAgo(18), upvoteCount: 45, downvoteCount: 0, replyCount: 8, score: 40 },

    // Staging posts for mod queue
    { channelId: startups.id, authorId: tom.id, title: 'Is it worth doing an accelerator in 2026?', body: 'YC acceptance rate is under 2%. Techstars has mixed reviews. There are dozens of smaller accelerators popping up.\n\nFor context: I have a working MVP, ~$2k MRR, and a small but engaged user base. Would an accelerator actually help, or am I better off just grinding?\n\nWould especially love to hear from founders who did an accelerator AND founders who chose not to.', status: 'STAGING', createdAt: hoursAgo(1), upvoteCount: 0, downvoteCount: 0, replyCount: 0, score: 0 },
    { channelId: engineering.id, authorId: marcus.id, title: 'TypeScript 6.0 first impressions — the good, the bad, the ugly', body: 'Spent the weekend migrating our codebase to TS 6.0. Here are my first impressions after converting ~200 files.\n\nThe good: built-in schema validation is a game changer. The new pattern matching syntax is clean.\nThe bad: some breaking changes in generic inference that required manual fixes.\nThe ugly: build times increased 30% — hoping this gets addressed.\n\nOverall worth the upgrade but budget a full sprint for migration.', status: 'STAGING', createdAt: hoursAgo(2), upvoteCount: 0, downvoteCount: 0, replyCount: 0, score: 0 },
    { channelId: growthMarketing.id, authorId: elena.id, title: 'Case study: how we used LinkedIn Creator Mode to generate $200k pipeline', body: 'Our CEO committed to posting on LinkedIn daily for 90 days. Here\'s exactly what happened, with real numbers.\n\nWeek 1-2: 200 impressions/post. Crickets.\nWeek 3-4: Started getting comments. 500-1k impressions.\nMonth 2: First inbound lead from a post. 2-5k impressions.\nMonth 3: Averaging 8k impressions. Generated 14 qualified leads.\n\nTotal pipeline attributed: $200k. Closed: $45k so far.\n\nThe key was consistency and being genuinely helpful, not selling. Every post either taught something or shared a real mistake.', status: 'STAGING', createdAt: hoursAgo(3), upvoteCount: 0, downvoteCount: 0, replyCount: 0, score: 0 },
  ];

  const posts = await Promise.all(postData.map((p) => prisma.post.create({ data: p })));
  console.log(`Created ${posts.length} posts (${posts.filter((p) => p.status === 'APPROVED').length} approved, ${posts.filter((p) => p.status === 'STAGING').length} in queue)`);

  // Update channel post counts
  for (const ch of activeChannels) {
    const count = posts.filter((p) => p.channelId === ch.id && p.status === 'APPROVED').length;
    await prisma.channel.update({ where: { id: ch.id }, data: { postCount: count } });
  }

  // ── Replies ──
  const approvedPosts = posts.filter((p) => p.status === 'APPROVED');

  const replyData = [
    // Replies to "We just hit $1M ARR"
    { postId: approvedPosts[0].id, authorId: elena.id, body: 'Congrats! The cold outbound insight resonates — we had the same experience. Templates get ignored, but a genuinely personalized email referencing something specific about the prospect\'s company gets 30%+ reply rates.' },
    { postId: approvedPosts[0].id, authorId: marcus.id, body: 'Curious about the freemium tier — what made it "actually useful" vs. the typical crippled version? This is something I struggle with in my own product.' },
    { postId: approvedPosts[0].id, authorId: james.id, body: 'Love this. The "don\'t hire VP Sales too early" point is so true. We made the same mistake and burned $150k on someone who couldn\'t sell a product that wasn\'t fully baked yet.' },

    // Replies to "Why we migrated from microservices back to a monolith"
    { postId: approvedPosts[3].id, authorId: elena.id, body: 'This is the kind of pragmatic engineering leadership that\'s rare. Too many teams adopt microservices because it\'s the "right" architecture, not because it solves their actual problems.' },
    { postId: approvedPosts[3].id, authorId: sarah.id, body: 'We\'re a team of 4 running 8 services and I feel this pain deeply. How long did the migration back to monolith actually take? And did you lose any functionality?' },
    { postId: approvedPosts[3].id, authorId: david.id, body: 'Controversial but correct. The rule I use: don\'t do microservices until you have at least 3 teams that need to deploy independently. Before that, it\'s just complexity for complexity\'s sake.' },
    { postId: approvedPosts[3].id, authorId: tom.id, body: 'Needed to hear this. I was about to split my monolith into services because that\'s what every blog post says to do. Staying monolithic for now.' },

    // Replies to "A practical guide to database indexing"
    { postId: approvedPosts[4].id, authorId: marcus.id, body: 'The (user_id, created_at) composite index is such a common win. Almost every app has a "show me this user\'s recent stuff" query pattern. Great writeup.' },
    { postId: approvedPosts[4].id, authorId: nina.id, body: 'Would love a follow-up on partial indexes and expression indexes. Those are the advanced features that can really save you when dealing with large tables.' },

    // Replies to "Content strategy that grew us to 50k visitors"
    { postId: approvedPosts[6].id, authorId: sarah.id, body: 'The "distribution > creation" ratio is so counterintuitive but so right. We used to publish and move on. Now we spend half our content time on distribution and it\'s made all the difference.' },
    { postId: approvedPosts[6].id, authorId: tom.id, body: 'Which tools do you use for content distribution? I\'m a solo founder and manually posting everywhere feels unsustainable.' },
    { postId: approvedPosts[6].id, authorId: aisha.id, body: 'The comparison pages strategy is underrated. We wrote 5 "us vs X" pages and they drive 40% of our trial signups. People searching for comparisons are already in buying mode.' },

    // Replies to "How we reduced toxic behavior by 80%"
    { postId: approvedPosts[11].id, authorId: sarah.id, body: 'The "slow onboarding" approach is brilliant. We tried this in a Slack community and the quality of first contributions went way up when people had time to observe norms first.' },
    { postId: approvedPosts[11].id, authorId: david.id, body: 'Transparent moderation logs are huge. Nothing erodes trust faster than opaque moderation. Even if people disagree with a decision, they respect the transparency.' },
    { postId: approvedPosts[11].id, authorId: elena.id, body: 'This maps well to what we see in growth — the communities with the highest retention are the ones with clear norms and low toxicity. Nobody wants to hang out in a toxic space.' },
    { postId: approvedPosts[11].id, authorId: james.id, body: 'De-escalation training for mods is something I\'ve never thought about but makes total sense. Most mod teams are just given a ban hammer and told to use their judgment.' },
  ];

  const replies = await Promise.all(replyData.map((r) => prisma.reply.create({ data: r })));
  console.log(`Created ${replies.length} replies`);

  // Update reply counts on posts
  const replyCounts: Record<string, number> = {};
  for (const r of replyData) {
    replyCounts[r.postId] = (replyCounts[r.postId] || 0) + 1;
  }
  await Promise.all(Object.entries(replyCounts).map(([postId, count]) =>
    prisma.post.update({ where: { id: postId }, data: { replyCount: count } })
  ));

  // ── Votes (upvotes on popular posts) ──
  const votesToCreate: { userId: string; type: 'UPVOTE' | 'DOWNVOTE'; target: 'POST'; postId: string }[] = [];
  for (const post of approvedPosts) {
    // Each active user randomly upvotes some posts
    for (const user of activeUsers) {
      if (user.id === post.authorId) continue; // Can't vote on own post
      if (Math.random() < 0.6) {
        votesToCreate.push({ userId: user.id, type: 'UPVOTE', target: 'POST', postId: post.id });
      }
    }
  }
  await Promise.all(votesToCreate.map((v) => prisma.vote.create({ data: v }).catch(() => {}))); // catch dupes
  console.log(`Created ${votesToCreate.length} votes`);

  // ── Reports (for mod queue) ──
  await Promise.all([
    prisma.report.create({ data: { reporterId: james.id, targetUserId: tom.id, postId: approvedPosts[2].id, reason: 'This feels like self-promotion / spam. The poster is just advertising their own product.', resolved: false } }),
    prisma.report.create({ data: { reporterId: nina.id, postId: approvedPosts[9].id, targetUserId: james.id, reason: 'Potentially misleading financial claims about EIP-7702. Should be labeled as speculative.', resolved: false } }),
  ]);
  console.log('Created 2 reports');

  // ── Notifications ──
  await Promise.all([
    prisma.notification.create({ data: { userId: sarah.id, type: 'UPVOTE_ON_POST', title: 'Your post is getting traction', body: 'Your post "We just hit $1M ARR" received 42 upvotes', read: false } }),
    prisma.notification.create({ data: { userId: sarah.id, type: 'REPLY_TO_POST', title: 'New reply on your post', body: 'Elena Rodriguez replied to "We just hit $1M ARR"', read: false } }),
    prisma.notification.create({ data: { userId: marcus.id, type: 'UPVOTE_ON_POST', title: 'Your post is trending', body: 'Your post "Why we migrated from microservices back to a monolith" received 67 upvotes', read: true } }),
    prisma.notification.create({ data: { userId: marcus.id, type: 'REPLY_TO_POST', title: 'New reply on your post', body: 'David Kim replied to "Why we migrated from microservices"', read: false } }),
    prisma.notification.create({ data: { userId: nina.id, type: 'UPVOTE_ON_POST', title: 'Your post is popular', body: 'Your post "How we reduced toxic behavior" received 72 upvotes', read: false } }),
    prisma.notification.create({ data: { userId: elena.id, type: 'POST_APPROVED', title: 'Post approved', body: 'Your post "The content strategy that grew us from 0 to 50k monthly visitors" has been approved', read: true } }),
    prisma.notification.create({ data: { userId: david.id, type: 'REPLY_TO_POST', title: 'New reply on your post', body: 'Marcus Johnson replied to "A practical guide to database indexing"', read: false } }),
  ]);
  console.log('Created 7 notifications');

  console.log('\nDemo data seeded successfully!');
  console.log('All demo users have password: demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
