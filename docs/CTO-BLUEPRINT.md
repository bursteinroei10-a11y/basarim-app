# Basarim Al HaDerech – CTO Technical Blueprint

## 1. Tech Stack (Current & Proposed)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 16 (App Router) | SSR, API routes, Vercel-optimized |
| **Language** | TypeScript | Type safety, maintainability |
| **Database** | PostgreSQL (Supabase) | Hosted, scalable, Prisma-compatible |
| **ORM** | Prisma | Type-safe queries, migrations |
| **Auth** | NextAuth v5 (Credentials) | Admin-only, single-credential setup |
| **Styling** | Tailwind CSS + shadcn/radix | RTL support, accessible components |
| **State** | Zustand (cart) | Lightweight client state |
| **Hosting** | Vercel | Git-based deploys, edge, serverless |
| **Push** | web-push | Browser notifications |

**Recommendation:** Stack is solid. Consider adding structured error monitoring (e.g. Sentry) before scaling.

---

## 2. Data Schema (Summary)

```
User ──< Order (status, totalAmount, lastEditedBy/At)
  │           └──< OrderItem ──> MeatProduct ──> Category
  └── CustomerProfile

MeatProduct (pricePerKg, isActive, isBestSeller)
OrderCutoff (dayOfWeek, hour, minute) – one per delivery batch
FriendRecommendation, PushSubscription, AdminPushSubscription
```

**Design notes:**
- `Order.lockedAt` = cutoff lock
- `Order.lastEditedBy` = "admin" | "customer" for audit
- No `deliveryBatch` or `deliveryDate` on Order – consider adding if batching by date.

---

## 3. Edge Cases & Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Vercel dynamic routes** | Admin order detail failed in prod | Use static `/admin/order-detail?id=` + dynamic import `ssr:false` |
| **Single admin credential** | No per-user audit, no roles | Acceptable for MVP; add proper RBAC for multi-admin |
| **Supabase connection limits** | Pool exhaustion under load | Use connection pooling (Supabase PgBouncer); monitor |
| **Cutoff timezone** | Wrong cutoff in other zones | `OrderCutoff.timezone` = "Asia/Jerusalem" – validate on server |
| **Prisma `db push` vs migrations** | Schema drift, data loss risk | Prefer `prisma migrate` for production |
| **Client-side exceptions** | Generic "Application error" | Error boundaries per route; consider Sentry |
| **RTL layout** | Layout bugs on mixed content | Consistent `dir="rtl"`, test LTR embeds |

---

## 4. Technical Tasks (Implementation Order)

### Phase 1 – Stability (Done / In Progress)
1. ~~Fix admin order detail client-side error~~ ✓
2. ~~Dynamic import + error boundary for order-detail~~ ✓
3. Verify production after deploy

### Phase 2 – Data & Ops
4. Add `deliveryBatch` or `deliveryDate` to Order if needed for dashboard batching
5. Switch from `db push` to `prisma migrate` for production
6. Add error monitoring (Sentry or similar)

### Phase 3 – Scale & Security
7. Add rate limiting on admin APIs
8. Add admin audit log (who changed what, when)
9. Consider multi-admin with role-based access

---

## 5. Critical Questions (Before Locking Architecture)

**1. Delivery batching:** How exactly do delivery batches work? Is it “all orders before cutoff X are delivered together on date Y”? If yes, we should model `deliveryBatchId` or `scheduledDeliveryDate` on Order and design the dashboard around it.

**2. Multi-admin:** Will there be more than one admin? If yes, we need proper user/role tables instead of hardcoded credentials, plus per-user audit logs.

**3. Observability:** Are you planning to grow traffic? If yes, we should add error tracking (Sentry), basic metrics, and DB connection pooling checks before scaling.

---

*Last updated: Mar 2026*
