# Azure DevOps Work Items - Additional Recipient Configuration

## Epic

**Title:** Global Notification Recipients Configuration
**Type:** Epic
**Priority:** 2
**Description:**
Enable administrators to configure global email notification recipients per email template type. These recipients will automatically receive CC notifications whenever the corresponding template is triggered, regardless of the specific entity instance.

**Acceptance Criteria:**
- Administrators can configure recipients at the template level (e.g., PO_APPROVED)
- Recipients receive notifications for all entities of that type
- Complements existing per-instance recipient configuration
- Full CRUD operations available via API and UI

---

## Feature 1: Backend API

**Title:** Additional Recipient Configuration API
**Type:** Feature
**Parent:** Global Notification Recipients Configuration (Epic)
**Priority:** 2
**Description:**
Implement the backend API for managing global notification recipients per email template.

**Status:** ✅ COMPLETED

---

### User Story 1.1: Entity and Database

**Title:** Create AdditionalRecipientConfiguration Entity and Database Table
**Type:** User Story
**Parent:** Additional Recipient Configuration API (Feature)
**Priority:** 2
**Story Points:** 3
**Status:** ✅ COMPLETED

**Description:**
As a developer, I need the database table and EF Core entity for storing global notification recipient configurations.

**Acceptance Criteria:**
- [x] Create `additional_recipient_configuration` table in `common` schema
- [x] Entity with fields: TemplateCode, Email, RecipientName, RecipientType
- [x] Index on TemplateCode for efficient lookups
- [x] Soft delete support
- [x] EF Core entity configuration in DbContext

**Technical Notes:**
- SQL migration: `20260104_AddAdditionalRecipientConfiguration.sql`
- Entity: `SpaceLinx.Model/AdditionalRecipientConfiguration/`

---

### User Story 1.2: DTOs and AutoMapper

**Title:** Create DTOs and AutoMapper Mappings
**Type:** User Story
**Parent:** Additional Recipient Configuration API (Feature)
**Priority:** 2
**Story Points:** 2
**Status:** ✅ COMPLETED

**Description:**
As a developer, I need DTOs for API request/response handling.

**Acceptance Criteria:**
- [x] WriteModel for create operations
- [x] UpdateModel for update operations
- [x] ReadModel for responses (includes audit fields)
- [x] RefModel for lightweight lookups
- [x] AutoMapper mappings configured

---

### User Story 1.3: REST Controller

**Title:** Create AdditionalRecipientConfiguration Controller
**Type:** User Story
**Parent:** Additional Recipient Configuration API (Feature)
**Priority:** 2
**Story Points:** 3
**Status:** ✅ COMPLETED

**Description:**
As an API consumer, I need REST endpoints to manage global notification recipients.

**Acceptance Criteria:**
- [x] GET /api/additionalrecipientconfiguration - List all
- [x] GET /api/additionalrecipientconfiguration/{id} - Get by ID
- [x] POST /api/additionalrecipientconfiguration - Create
- [x] PUT /api/additionalrecipientconfiguration/{id} - Update
- [x] GET /api/additionalrecipientconfiguration/active - Active only
- [x] GET /api/additionalrecipientconfiguration/lookup - Lightweight list
- [x] GET /api/additionalrecipientconfiguration/template/{templateCode} - By template
- [x] Authorization via SpaceLinxAuthorize attribute

---

### User Story 1.4: Notification Service Integration

**Title:** Integrate Global Recipients into Notification Service
**Type:** User Story
**Parent:** Additional Recipient Configuration API (Feature)
**Priority:** 1
**Story Points:** 3
**Status:** ✅ COMPLETED

**Description:**
As a system, I need to include global recipients when sending notifications so they receive emails automatically.

**Acceptance Criteria:**
- [x] Modify GetRecipientsAsync to query AdditionalRecipientConfiguration
- [x] Query by template code (e.g., PO_APPROVED)
- [x] Include only active, non-deleted records
- [x] Deduplicate with other recipient sources
- [x] Pass template code to GetRecipientsAsync from all Notify methods

---

## Feature 2: Frontend UI

**Title:** Additional Recipient Configuration UI
**Type:** Feature
**Parent:** Global Notification Recipients Configuration (Epic)
**Priority:** 2
**Description:**
Implement the frontend UI for administrators to manage global notification recipients.

**Status:** 🔲 NOT STARTED

---

### User Story 2.1: Recipients List View

**Title:** Create Additional Recipients List Page
**Type:** User Story
**Parent:** Additional Recipient Configuration UI (Feature)
**Priority:** 2
**Story Points:** 5

**Description:**
As an administrator, I want to view all configured global notification recipients in a list so I can manage them.

**Acceptance Criteria:**
- [ ] DataGrid displaying all configurations
- [ ] Columns: Template Code, Email, Name, Type, Actions
- [ ] Sorting by any column
- [ ] Filter by template code dropdown
- [ ] Search by email or name
- [ ] Pagination (20 items per page)
- [ ] Navigate to: Settings → Notifications → Additional Recipients

**UI Reference:** See `AdditionalRecipientConfiguration_Feature.md` Screen 1

---

### User Story 2.2: Add Recipient Dialog

**Title:** Create Add Recipient Dialog
**Type:** User Story
**Parent:** Additional Recipient Configuration UI (Feature)
**Priority:** 2
**Story Points:** 3

**Description:**
As an administrator, I want to add a new global recipient for a specific email template.

**Acceptance Criteria:**
- [ ] Modal dialog with form
- [ ] Template Code dropdown (populated from TEMPLATE_CODES constant)
- [ ] Email input with validation
- [ ] Recipient Name input (optional)
- [ ] Recipient Type dropdown (CC, Watcher, Stakeholder)
- [ ] Cancel and Save buttons
- [ ] Success toast on save
- [ ] Error handling with validation messages

**UI Reference:** See `AdditionalRecipientConfiguration_Feature.md` Screen 2

---

### User Story 2.3: Edit Recipient Dialog

**Title:** Create Edit Recipient Dialog
**Type:** User Story
**Parent:** Additional Recipient Configuration UI (Feature)
**Priority:** 2
**Story Points:** 2

**Description:**
As an administrator, I want to edit an existing global recipient configuration.

**Acceptance Criteria:**
- [ ] Pre-populate form with existing values
- [ ] Same validation as Add dialog
- [ ] Update button instead of Save
- [ ] Success toast on update

---

### User Story 2.4: Delete Recipient

**Title:** Implement Delete Recipient Functionality
**Type:** User Story
**Parent:** Additional Recipient Configuration UI (Feature)
**Priority:** 2
**Story Points:** 2

**Description:**
As an administrator, I want to delete a global recipient configuration.

**Acceptance Criteria:**
- [ ] Delete option in action menu
- [ ] Confirmation dialog before delete
- [ ] Soft delete (calls DELETE API)
- [ ] Remove from list after deletion
- [ ] Success toast on delete

---

### User Story 2.5: API Service Integration

**Title:** Create Frontend Service for Additional Recipients API
**Type:** User Story
**Parent:** Additional Recipient Configuration UI (Feature)
**Priority:** 2
**Story Points:** 2

**Description:**
As a frontend developer, I need a service class to interact with the Additional Recipients API.

**Acceptance Criteria:**
- [ ] Create `additionalRecipientsService.ts`
- [ ] Methods: getAll, getById, getByTemplate, create, update, delete
- [ ] Use axios instance with MSAL authentication
- [ ] TypeScript interfaces for request/response types

---

### User Story 2.6: Redux State Management

**Title:** Create Redux Slice for Additional Recipients
**Type:** User Story
**Parent:** Additional Recipient Configuration UI (Feature)
**Priority:** 3
**Story Points:** 2

**Description:**
As a frontend developer, I need Redux state management for the Additional Recipients feature.

**Acceptance Criteria:**
- [ ] Create `additionalRecipientsSlice.ts`
- [ ] State: items, loading, error, selectedItem
- [ ] Actions: fetchAll, create, update, delete
- [ ] Async thunks for API calls

---

### User Story 2.7: Navigation and Routing

**Title:** Add Navigation Menu Item and Route
**Type:** User Story
**Parent:** Additional Recipient Configuration UI (Feature)
**Priority:** 2
**Story Points:** 1

**Description:**
As an administrator, I want to access the Additional Recipients page from the Settings menu.

**Acceptance Criteria:**
- [ ] Add menu item: Settings → Notifications → Additional Recipients
- [ ] Route: `/settings/notifications/additional-recipients`
- [ ] Protected route (admin only)
- [ ] Breadcrumb navigation

---

## Feature 3: Testing

**Title:** Additional Recipient Configuration Testing
**Type:** Feature
**Parent:** Global Notification Recipients Configuration (Epic)
**Priority:** 3
**Description:**
Comprehensive testing for the Additional Recipient Configuration feature.

---

### User Story 3.1: Backend Unit Tests

**Title:** Write Unit Tests for Backend
**Type:** User Story
**Parent:** Additional Recipient Configuration Testing (Feature)
**Priority:** 3
**Story Points:** 3

**Description:**
As a developer, I want unit tests to ensure the backend works correctly.

**Acceptance Criteria:**
- [ ] Test entity creation and mapping
- [ ] Test controller CRUD operations
- [ ] Test GetRecipientsAsync includes global recipients
- [ ] Test deduplication logic

---

### User Story 3.2: Integration Tests

**Title:** Write Integration Tests
**Type:** User Story
**Parent:** Additional Recipient Configuration Testing (Feature)
**Priority:** 3
**Story Points:** 3

**Description:**
As a QA engineer, I want integration tests to verify end-to-end functionality.

**Acceptance Criteria:**
- [ ] Test API endpoints with test database
- [ ] Test notification flow with global recipients
- [ ] Verify emails are sent to configured recipients

---

### User Story 3.3: Frontend Unit Tests

**Title:** Write Frontend Component Tests
**Type:** User Story
**Parent:** Additional Recipient Configuration Testing (Feature)
**Priority:** 3
**Story Points:** 2

**Description:**
As a frontend developer, I want unit tests for React components.

**Acceptance Criteria:**
- [ ] Test list component rendering
- [ ] Test dialog form validation
- [ ] Test API service methods

---

## Summary

| Work Item Type | Count | Status |
|---------------|-------|--------|
| Epic | 1 | In Progress |
| Features | 3 | 1 Complete, 2 Not Started |
| User Stories | 14 | 4 Complete, 10 Not Started |

### Completed (Backend)
- ✅ Entity and Database (Story 1.1)
- ✅ DTOs and AutoMapper (Story 1.2)
- ✅ REST Controller (Story 1.3)
- ✅ Notification Service Integration (Story 1.4)

### Remaining (Frontend & Testing)
- 🔲 Recipients List View (Story 2.1) - 5 SP
- 🔲 Add Recipient Dialog (Story 2.2) - 3 SP
- 🔲 Edit Recipient Dialog (Story 2.3) - 2 SP
- 🔲 Delete Recipient (Story 2.4) - 2 SP
- 🔲 API Service Integration (Story 2.5) - 2 SP
- 🔲 Redux State Management (Story 2.6) - 2 SP
- 🔲 Navigation and Routing (Story 2.7) - 1 SP
- 🔲 Backend Unit Tests (Story 3.1) - 3 SP
- 🔲 Integration Tests (Story 3.2) - 3 SP
- 🔲 Frontend Unit Tests (Story 3.3) - 2 SP

**Total Remaining Story Points:** 25
