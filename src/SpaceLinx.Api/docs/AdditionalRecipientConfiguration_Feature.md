# Additional Recipient Configuration Feature

## Overview

The Additional Recipient Configuration feature allows administrators to configure global email notification recipients per email template type. These recipients will automatically receive CC notifications whenever the corresponding template is triggered, regardless of the specific entity instance.

## Business Value

- **Centralized Notification Management**: Configure who receives notifications at the template level instead of per-entity
- **Role-Based Visibility**: Ensure key stakeholders (CEO, Operations Head, Supply Chain Manager) stay informed
- **Reduced Manual Configuration**: No need to add recipients to every PO, Requisition, or Tender individually

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Notification Trigger                              │
│                   (e.g., PO Approved, Requisition Submitted)            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ApprovalNotificationService                           │
│                       GetRecipientsAsync()                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────────────┐
            │  Entity   │   │ Approvers │   │ Per-Instance      │
            │  Owner    │   │           │   │ Recipients        │
            └───────────┘   └───────────┘   │ (ApprovalNotif... │
                                            │  Recipient)       │
                                            └───────────────────┘
                                                    │
                                                    ▼
                                    ┌───────────────────────────┐
                                    │  Global Recipients (NEW)  │
                                    │  (AdditionalRecipient     │
                                    │   Configuration)          │
                                    └───────────────────────────┘
                                                    │
                                                    ▼
                                    ┌───────────────────────────┐
                                    │   Deduplicated Recipients │
                                    │   → Email Queue           │
                                    └───────────────────────────┘
```

### Database Schema

**Table:** `common.additional_recipient_configuration`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| template_code | VARCHAR(100) | Email template code (e.g., PO_APPROVED) |
| email | VARCHAR(255) | Recipient email address |
| recipient_name | VARCHAR(255) | Display name |
| recipient_type | VARCHAR(50) | Type (CC, Watcher, Stakeholder) |
| is_active | BOOLEAN | Active flag |
| created_at | TIMESTAMP | Created timestamp |
| created_by | VARCHAR(255) | Created by user |
| updated_at | TIMESTAMP | Updated timestamp |
| updated_by | VARCHAR(255) | Updated by user |
| deleted_at | TIMESTAMP | Soft delete timestamp |
| deleted_by | VARCHAR(255) | Deleted by user |

---

## Available Template Codes

| Template Code | Trigger Event |
|--------------|---------------|
| `REQUISITION_SUBMITTED` | Requisition submitted for approval |
| `REQUISITION_APPROVED` | Requisition fully approved |
| `REQUISITION_REJECTED` | Requisition rejected |
| `REQUISITION_STAGE_APPROVED` | Requisition stage approved |
| `PO_SUBMITTED` | Purchase Order submitted |
| `PO_APPROVED` | Purchase Order fully approved |
| `PO_REJECTED` | Purchase Order rejected |
| `PO_STAGE_APPROVED` | Purchase Order stage approved |
| `TENDER_SUBMITTED` | Tender submitted |
| `TENDER_APPROVED` | Tender approved |
| `TENDER_REJECTED` | Tender rejected |
| `TENDER_STAGE_APPROVED` | Tender stage approved |
| `TENDER_PUBLISHED` | Tender published to vendors |
| `TENDER_AWARDED` | Tender awarded |
| `ECO_SUBMITTED` | ECO submitted |
| `ECO_APPROVED` | ECO approved |
| `ECO_REJECTED` | ECO rejected |
| `ECO_RELEASED` | ECO released |

---

## API Endpoints

### Base URL: `/api/additionalrecipientconfiguration`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all configurations |
| GET | `/{id}` | Get by ID |
| POST | `/` | Create new configuration |
| PUT | `/{id}` | Update configuration |
| DELETE | `/{id}` | Soft delete configuration |
| GET | `/active` | List active configurations |
| GET | `/lookup` | Lightweight lookup list |
| GET | `/template/{templateCode}` | Get recipients for a template |

### Request/Response Models

**Create (POST) / Update (PUT) Request:**
```json
{
  "templateCode": "PO_APPROVED",
  "email": "finance@company.com",
  "recipientName": "Finance Team",
  "recipientType": "CC"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "templateCode": "PO_APPROVED",
  "email": "finance@company.com",
  "recipientName": "Finance Team",
  "recipientType": "CC",
  "isActive": true,
  "createdAt": "2026-01-04T10:30:00Z",
  "createdBy": "admin@company.com"
}
```

---

## UI Screens

### Screen 1: Additional Recipients Configuration List

**Navigation:** Settings → Notifications → Additional Recipients

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SpaceLinx                                    [User Menu ▼]                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Settings > Notifications > Additional Recipients                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Additional Recipient Configuration                    [+ Add Recipient]    │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌─────────────┐  Filter by Template: [All Templates        ▼]             │
│  │ Search...   │                                                            │
│  └─────────────┘                                                            │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Template Code     │ Email              │ Name           │ Type │ ⚙️  │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ PO_APPROVED       │ rupesh@xdlinx...   │ Rupesh Gandu...│ CC   │ ⋮  │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ PO_APPROVED       │ tarun@xdlinx...    │ Tarun Pandrangi│ CC   │ ⋮  │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ PO_APPROVED       │ sudheer@xdlinx...  │ Sudheer        │ CC   │ ⋮  │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ PO_SUBMITTED      │ tarun@xdlinx...    │ Tarun Pandrangi│ CC   │ ⋮  │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ REQUISITION_...   │ sudheer@xdlinx...  │ Sudheer        │ CC   │ ⋮  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Showing 1-5 of 34 entries                      [< 1 2 3 4 5 ... 7 >]      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- DataGrid with sorting, filtering, and pagination
- Search by email or name
- Filter dropdown for template codes
- Action menu (⋮) with Edit and Delete options
- "Add Recipient" button opens create dialog

---

### Screen 2: Add/Edit Recipient Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│  Add Additional Recipient                              [X]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Template Code *                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PO_APPROVED                                          ▼  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Email Address *                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ finance@company.com                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Recipient Name                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Finance Team                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Recipient Type                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ CC                                                   ▼  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Options: CC, Watcher, Stakeholder                              │
│                                                                 │
│                                    [Cancel]  [Save Recipient]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Validation Rules:**
- Template Code: Required, select from dropdown
- Email: Required, valid email format
- Recipient Name: Optional, max 255 characters
- Recipient Type: Optional, defaults to "CC"

---

### Screen 3: Template-Based View (Alternative Layout)

**Navigation:** Settings → Notifications → By Template

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SpaceLinx                                    [User Menu ▼]                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Settings > Notifications > By Template                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📧 PO_APPROVED - Purchase Order Approved                    [Edit]  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Recipients:                                                         │   │
│  │  • Rupesh Gandupalli <rupesh@xdlinx.space>                    [x]   │   │
│  │  • Tarun Pandrangi <tarun@xdlinx.space>                       [x]   │   │
│  │  • Sudheer <sudheer@xdlinx.space>                             [x]   │   │
│  │                                                  [+ Add Recipient]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📧 PO_REJECTED - Purchase Order Rejected                    [Edit]  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Recipients:                                                         │   │
│  │  • Rupesh Gandupalli <rupesh@xdlinx.space>                    [x]   │   │
│  │  • Sudheer <sudheer@xdlinx.space>                             [x]   │   │
│  │                                                  [+ Add Recipient]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📧 REQUISITION_SUBMITTED - Requisition Submitted            [Edit]  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Recipients:                                                         │   │
│  │  • Tarun Pandrangi <tarun@xdlinx.space>                       [x]   │   │
│  │  • Sudheer <sudheer@xdlinx.space>                             [x]   │   │
│  │                                                  [+ Add Recipient]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Grouped view by template code
- Quick add/remove recipients per template
- Expandable/collapsible sections
- Shows template description

---

## Frontend Implementation Guide

### Technology Stack
- React 18 with TypeScript
- MUI v5 DataGrid for list view
- React Hook Form for form handling
- Axios for API calls

### Recommended Components

```
src/
├── features/
│   └── Settings/
│       └── AdditionalRecipients/
│           ├── AdditionalRecipientsList.tsx      # Main list view
│           ├── AdditionalRecipientDialog.tsx     # Add/Edit dialog
│           ├── AdditionalRecipientsService.ts    # API service
│           ├── AdditionalRecipientsSlice.ts      # Redux slice
│           └── types.ts                          # TypeScript types
```

### Service Implementation

```typescript
// AdditionalRecipientsService.ts
import api from '../../../services/api';

const BASE_URL = '/api/additionalrecipientconfiguration';

export const additionalRecipientsService = {
  getAll: () => api.get(BASE_URL),
  getById: (id: string) => api.get(`${BASE_URL}/${id}`),
  getByTemplate: (templateCode: string) => api.get(`${BASE_URL}/template/${templateCode}`),
  create: (data: AdditionalRecipientWrite) => api.post(BASE_URL, data),
  update: (id: string, data: AdditionalRecipientUpdate) => api.put(`${BASE_URL}/${id}`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/${id}`),
};
```

### TypeScript Types

```typescript
// types.ts
export interface AdditionalRecipientConfiguration {
  id: string;
  templateCode: string;
  email: string;
  recipientName?: string;
  recipientType?: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AdditionalRecipientWrite {
  templateCode: string;
  email: string;
  recipientName?: string;
  recipientType?: string;
}

export interface AdditionalRecipientUpdate extends AdditionalRecipientWrite {
  id: string;
}

export const TEMPLATE_CODES = [
  { code: 'PO_SUBMITTED', label: 'Purchase Order Submitted' },
  { code: 'PO_APPROVED', label: 'Purchase Order Approved' },
  { code: 'PO_REJECTED', label: 'Purchase Order Rejected' },
  { code: 'PO_STAGE_APPROVED', label: 'Purchase Order Stage Approved' },
  { code: 'REQUISITION_SUBMITTED', label: 'Requisition Submitted' },
  { code: 'REQUISITION_APPROVED', label: 'Requisition Approved' },
  { code: 'REQUISITION_REJECTED', label: 'Requisition Rejected' },
  { code: 'REQUISITION_STAGE_APPROVED', label: 'Requisition Stage Approved' },
  { code: 'TENDER_SUBMITTED', label: 'Tender Submitted' },
  { code: 'TENDER_APPROVED', label: 'Tender Approved' },
  { code: 'TENDER_REJECTED', label: 'Tender Rejected' },
  { code: 'TENDER_STAGE_APPROVED', label: 'Tender Stage Approved' },
  { code: 'TENDER_PUBLISHED', label: 'Tender Published' },
  { code: 'TENDER_AWARDED', label: 'Tender Awarded' },
  { code: 'ECO_SUBMITTED', label: 'ECO Submitted' },
  { code: 'ECO_APPROVED', label: 'ECO Approved' },
  { code: 'ECO_REJECTED', label: 'ECO Rejected' },
  { code: 'ECO_RELEASED', label: 'ECO Released' },
] as const;

export const RECIPIENT_TYPES = ['CC', 'Watcher', 'Stakeholder'] as const;
```

---

## Testing Scenarios

### Unit Tests
1. Verify AdditionalRecipientConfiguration entity mapping
2. Verify CRUD operations in controller
3. Verify global recipients are included in GetRecipientsAsync

### Integration Tests
1. Create a global recipient for PO_APPROVED
2. Trigger a PO approval
3. Verify the global recipient receives the email

### E2E Tests
1. Navigate to Settings → Notifications → Additional Recipients
2. Add a new recipient for REQUISITION_SUBMITTED
3. Submit a requisition
4. Verify email is received by the configured recipient

---

## Permissions

| Permission | Description |
|------------|-------------|
| `AdditionalRecipientConfiguration.Read` | View configurations |
| `AdditionalRecipientConfiguration.Write` | Create/Update configurations |
| `AdditionalRecipientConfiguration.Delete` | Delete configurations |

Recommended Role Assignments:
- **System Admin**: Full access
- **Operations Manager**: Read/Write access
- **Regular Users**: No access (admin feature only)
