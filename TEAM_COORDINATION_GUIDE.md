# 🤝 Team Coordination Guide
## Parallel Development Strategy for 24-Hour Hackathon

---

## 👥 Team Structure

Recommended team breakdown for optimal parallel development:

### Backend Team (2-3 developers)
**Focus**: REST API endpoints, database queries, authentication  
**Tech Stack**: Node.js, Express, MySQL, JWT

**Sprint Assignment**:
- Dev 1: Authentication (Sprint 1) + Payments (Sprint 5)
- Dev 2: Master Data (Sprint 2) + Budgets (Sprint 4)
- Dev 3: Transactions (Sprint 3) + Dashboard (Sprint 6)

### Frontend Team (2-3 developers)
**Focus**: React components, UI/UX, API integration  
**Tech Stack**: React 18, Tailwind CSS, Axios

**Sprint Assignment**:
- Dev 1: Auth pages (Sprint 1) + Master Data pages (Sprint 2)
- Dev 2: Budget pages (Sprint 3) + Dashboard (Sprint 6)
- Dev 3: Invoice/Payment flows (Sprint 4-5) + Polish (Sprint 7)

---

## 📦 Dependency Graph

```
                    ┌─────────────────┐
                    │  Database Setup │
                    │  (Schema + Seed)│
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Auth Endpoint  │
                    │  (Login/Register)
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
        ┌───────▼────┐  ┌────▼──────┐  ┌─▼──────────┐
        │  Master    │  │  Budgets  │  │ Invoices   │
        │  Data API  │  │   API     │  │  (CRUD)    │
        └───────┬────┘  └────┬──────┘  └─┬──────────┘
                │            │            │
        ┌───────▼────┐  ┌────▼──────┐  ┌─▼──────────┐
        │  Master    │  │  Budget   │  │ Invoice    │
        │ Data Pages │  │   Pages   │  │   Forms    │
        └────────────┘  └───────────┘  └────────────┘
                             │
                    ┌────────▼────────┐
                    │   Post Invoice  │
                    │ (Update Budget) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Payments API   │
                    │  & Dashboard    │
                    └────────────────┘
```

**Key Dependencies**:
- ✅ Database must exist before API endpoints
- ✅ Auth must work before other APIs can be protected
- ✅ Master Data CRUD before Transactions
- ✅ Budgets before Invoice posting (calculation)
- ✅ Payments before Dashboard (reporting)

---

## 🗓️ Sprint Timeline (24 Hours)

### Sprint 0: Foundation ✅ (DONE)
**Status**: Complete  
**Deliverables**: Database schema, seed data, documentation  
**Output**: 15 tables, 52 test records, API contracts

### Sprint 1: Authentication & Dashboard (2.5 hours)
**Time**: Hour 0-2.5 | **Both teams**

**Backend Deliverables**:
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] GET /auth/me
- [ ] POST /auth/logout
- [ ] JWT middleware
- [ ] GET /dashboard/summary (skeleton)

**Frontend Deliverables**:
- [ ] Login page component
- [ ] Register page component
- [ ] ProtectedRoute wrapper
- [ ] Dashboard skeleton (with title only)
- [ ] Token storage/retrieval

**Integration Point**: Frontend can log in and see authenticated endpoints

**Success Criteria**:
```
✅ Admin user can log in with Test@123
✅ JWT token stored in localStorage
✅ Dashboard page loads (auth required)
✅ Logout clears token
```

---

### Sprint 2: Master Data CRUD (3 hours)
**Time**: Hour 2.5-5.5 | **Backend completes, Frontend waits**

**Backend Deliverables**:
- [ ] POST /analytics (create event)
- [ ] GET /analytics (list with pagination)
- [ ] GET /analytics/:id (fetch one)
- [ ] POST /products (create)
- [ ] GET /products (list)
- [ ] POST /contacts (create)
- [ ] GET /contacts (list)

**Frontend Deliverables** (parallel with backend):
- [ ] Analytics list page
- [ ] Analytics creation form
- [ ] Products management page
- [ ] Contacts management page

**Integration Point**: Frontend shows real data from API

**Success Criteria**:
```
✅ Create analytics event via form
✅ List shows newly created event
✅ Create product → appears in list
✅ Filter/search working
```

---

### Sprint 3: Budgets Engine (3 hours)
**Time**: Hour 5.5-8.5 | **Backend + Frontend parallel**

**Backend Deliverables**:
- [ ] POST /budgets (create)
- [ ] GET /budgets (list)
- [ ] GET /budgets/:id (with metrics)
- [ ] PUT /budgets/:id (update)
- [ ] POST /budgets/:id/revise (create revision)
- [ ] GET /budgets/:id/alerts (fetch alerts)

**Frontend Deliverables**:
- [ ] Budget list page (show percentage_achieved)
- [ ] Budget creation form (link to analytics)
- [ ] Budget detail page (show metrics + alerts)
- [ ] Revision form

**Integration Point**: Budgets show calculated percentages in real-time

**Success Criteria**:
```
✅ Create budget linked to event
✅ Percentage shows as 0%
✅ Revise budget → new percentage calculated
✅ View alerts (if any)
```

---

### Sprint 4: Transactions - Invoices (3.5 hours)
**Time**: Hour 8.5-12 | **Backend critical, Frontend dependent**

**Backend Deliverables**:
- [ ] POST /invoices (create with line items)
- [ ] GET /invoices (list)
- [ ] GET /invoices/:id (fetch)
- [ ] POST /invoices/:id/post (update budget!)
- [ ] POST /invoices/:id/cancel (reverse budget)
- [ ] Auto-assignment logic via rules
- [ ] Budget update trigger

**Frontend Deliverables**:
- [ ] Invoice creation form (line items builder)
- [ ] Invoice list page
- [ ] Invoice detail page
- [ ] Post/Cancel buttons

**CRITICAL**: Post invoice must update budget.achieved_amount

**Integration Point**: Posting invoice immediately updates budget percentage

**Success Criteria**:
```
✅ Create invoice with 2 line items
✅ Total amount calculated correctly
✅ Post invoice → budget percentage increases
✅ Cancel invoice → budget percentage decreases
✅ Alerts trigger at 80%+ automatically
```

---

### Sprint 5: Payments & Reporting (3 hours)
**Time**: Hour 12-15 | **Backend + Frontend parallel**

**Backend Deliverables**:
- [ ] POST /payments (record payment)
- [ ] GET /payments (list)
- [ ] GET /payments/:id (fetch)
- [ ] Update invoice.payment_status
- [ ] POST /dashboard/summary (full)
- [ ] GET /dashboard/payment-report

**Frontend Deliverables**:
- [ ] Payment recording form
- [ ] Payment list page
- [ ] Dashboard summary cards (revenue, profit, etc.)
- [ ] Payment report charts

**Integration Point**: Dashboard shows aggregated financial metrics

**Success Criteria**:
```
✅ Record payment → invoice payment_status updates
✅ Dashboard shows total revenue
✅ Payment report shows collection rate
✅ Partial payment supported
```

---

### Sprint 6: Customer Portal (2.5 hours)
**Time**: Hour 15-17.5 | **Frontend focus**

**Backend Deliverables**:
- [ ] Portal-specific dashboard
- [ ] Customer invoice history
- [ ] Payment history read-only

**Frontend Deliverables**:
- [ ] Portal landing page
- [ ] Invoice history (for customers)
- [ ] Payment history view
- [ ] Role-based navigation

**Integration Point**: Portal users see limited data

**Success Criteria**:
```
✅ Portal user sees own invoices only
✅ Admin user sees all invoices
✅ Read-only access enforced
```

---

### Sprint 7: Polish & Fixes (1.5 hours)
**Time**: Hour 17.5-19 | **Both teams**

**Tasks**:
- [ ] Bug fixes from testing
- [ ] UI Polish (styling, responsiveness)
- [ ] Error message improvements
- [ ] Performance optimization
- [ ] Final testing

**Demo Preparation**:
- [ ] Demo script: Login → Create → Post → Payment → Dashboard
- [ ] Test data created
- [ ] Screenshots captured

---

## 🔀 Parallel Work Strategy

### Before Development Starts

**Backend Team**:
1. Read API_CONTRACTS.md completely
2. Review BACKEND_IMPLEMENTATION_GUIDE.md
3. Setup local MySQL with schema + seed data
4. Test database connection with sample queries

**Frontend Team**:
1. Read API_CONTRACTS.md completely
2. Review FRONTEND_INTEGRATION_GUIDE.md
3. Setup React project with Tailwind + Axios
4. Create axios instance with JWT interceptors
5. Test axios with dummy data

### During Development

**Backend Developer Checklist**:
```javascript
// For each endpoint:
1. Define route in routes/file.js
2. Create controller function in controllers/file.js
3. Add validation in utils/validators.js
4. Test with curl/Postman
5. Log time spent
6. Commit with descriptive message
7. Update shared todo list
```

**Frontend Developer Checklist**:
```javascript
// For each page/component:
1. Create page in src/pages/file.jsx
2. Create API call with useApi hook or useEffect
3. Mock data while backend is incomplete
4. Build UI with Tailwind
5. Add error handling
6. Test with different loading states
7. Replace mock data with real API calls
8. Commit with descriptive message
```

### Integration Points

**Daily (or every few hours)**:
```
1. Backend commits to git
2. Frontend pulls latest
3. Frontend updates API_BASE_URL if changed
4. Both test together
5. Log issues in shared document
```

**Communication Channel**:
- Slack/Discord: Real-time questions
- Shared Git repo: Code synchronization
- Shared todo list: Status tracking
- Discord call: Daily sync (30 min)

---

## 🧪 Testing Strategy

### Unit Testing (Individual)

**Backend**:
```bash
# Test auth endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login_id":"admin_user","password":"Test@123"}'

# Test protected endpoint
curl -X GET http://localhost:5000/api/budgets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Frontend**:
```javascript
// Check localStorage has token
console.log(localStorage.getItem('shivbas_jwt_token'));

// Check axios includes header
console.log(axios.defaults.headers.common);
```

### Integration Testing

**End-to-End Workflow**:
```
1. Frontend: Login → Get JWT
2. Frontend: Create Analytics Event
3. Backend: Query database → Verify created
4. Frontend: Create Budget
5. Backend: Query database → Verify created
6. Frontend: Create Invoice
7. Backend: Post invoice
8. Frontend: Check budget percentage updated
9. Frontend: Record payment
10. Frontend: View dashboard → See metrics
```

### Regression Testing (Hour 18)

**Before demo**, test these scenarios:
```
✅ Login (admin)
✅ Login (portal user)
✅ Create analytics event
✅ Create product
✅ Create contact
✅ Create budget
✅ Create invoice with 2 items
✅ Post invoice
✅ Record payment
✅ View dashboard
✅ Logout
```

---

## 📋 Shared Responsibility Matrix

### Backend Responsibilities
- ✅ Database stability (backups, migrations)
- ✅ API response formats (must match contracts)
- ✅ Error handling (consistent error codes)
- ✅ Performance (query optimization)
- ✅ Security (JWT, input validation)
- ✅ Documentation (in code comments)

### Frontend Responsibilities
- ✅ User experience (responsive design)
- ✅ Error display (user-friendly messages)
- ✅ Loading states (spinners, disabled buttons)
- ✅ Performance (component memoization)
- ✅ Accessibility (ARIA labels, keyboard nav)
- ✅ Cross-browser testing

### Shared Responsibilities
- ✅ API contract adherence
- ✅ Git commits (clear messages)
- ✅ Code review (peer review before merge)
- ✅ Bug reporting (detailed logs)
- ✅ Testing (before committing)
- ✅ Communication (sync daily)

---

## 🚨 Conflict Resolution

### If Backend is Behind Schedule
```
1. Frontend uses mock data instead of API
2. Backend prioritizes: Auth → Core CRUD → Edge cases
3. Skip email features (SMTP optional)
4. Use simpler validation temporarily
5. Implement refactoring after demo
```

### If Frontend is Behind Schedule
```
1. Backend provides API documentation (already done!)
2. Backend provides curl examples for testing
3. Frontend prioritizes: Login → Dashboard → Core pages
4. Skip responsive design initially (focus on desktop)
5. Use placeholder components (buttons, inputs)
```

### If Database Issues Occur
```
1. Restore from backup
2. Re-import schema.sql
3. Re-import seed.sql
4. Check error logs
5. Verify foreign key constraints
```

### If API Contract Changes
```
1. Update API_CONTRACTS.md IMMEDIATELY
2. Notify both teams
3. Update backend controller
4. Update frontend API call
5. Test integration point
6. Commit together
```

---

## 📊 Progress Tracking

### Use this table to track status:

| Sprint | Component | Backend | Frontend | Integration | Status |
|--------|-----------|---------|----------|-------------|--------|
| 1 | Auth | In Progress | Blocked | - | 🟡 |
| 1 | Dashboard | Not Started | Not Started | - | ⚫ |
| 2 | Analytics | In Progress | Blocked | - | 🟡 |
| 2 | Products | Backlog | Backlog | - | ⚫ |
| 3 | Budgets | Not Started | Not Started | - | ⚫ |

**Legend**:
- 🟢 Complete
- 🟡 In Progress (>50%)
- 🟠 In Progress (<50%)
- ⚫ Not Started
- 🔴 Blocked

---

## 🎯 Success Metrics

**By Hour 19 (Before Final 1-hour Polish)**:

| Metric | Target | Actual |
|--------|--------|--------|
| Auth endpoints working | 100% | __% |
| Database queries fast | <500ms avg | __ms |
| Frontend pages responsive | All breakpoints | __% |
| API contracts matched | 100% | __% |
| Test coverage | Login flow + 1 transaction | __% |
| Zero critical bugs | Yes | ____ |
| Demo scenario working | 100% | __% |

---

## 🎬 Demo Script (8 minutes)

```
1. Show login screen [30 sec]
2. Login as admin [20 sec]
3. Show dashboard [30 sec]
4. Create event [1 min]
5. Create budget [1 min]
6. Create invoice [1.5 min]
7. Post invoice [30 sec]
8. Show budget updated [30 sec]
9. Record payment [1 min]
10. Show final dashboard [1 min]
```

**Total: 8 minutes** ✅

---

## 📞 Communication Channels

**Real-time**:
- Slack/Discord channel: #shivbas-hackathon

**Code**:
- GitHub repo: main branch (protected)
- PR reviews: 2 approvals before merge

**Documentation**:
- Shared Google Doc: Sprint updates
- This file: Coordination guide

**Daily Standup**:
- Time: Every 4 hours
- Duration: 15 minutes
- Attendees: All
- Format: What done → What next → Blockers

---

## ✅ Final Checklist

**Before Demo (Hour 19)**:
- [ ] All endpoints return correct response format
- [ ] Frontend pages load without errors
- [ ] Login works with demo credentials
- [ ] Dashboard shows real data
- [ ] Invoice posting updates budget
- [ ] Payment recording works
- [ ] Logout clears token
- [ ] Error messages are helpful
- [ ] No console errors
- [ ] Database backups created

**During Demo (Hour 20-21)**:
- [ ] WiFi tested
- [ ] Both servers running (backend + frontend)
- [ ] Demo account ready (admin_user/Test@123)
- [ ] Screenshots captured for slides
- [ ] Talking points prepared
- [ ] Team members assigned (who speaks when)

---

**Last Updated**: 2026-01-31  
**Document Type**: Team Coordination Guide  
**Next Review**: After Sprint 1 (Hour 2.5)

🚀 **Ready to build together!**
