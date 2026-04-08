# Tender/RFQ Core Management Requirements Document

## Feature Overview

**Feature 1833: Tender/RFQ Management System**

The Tender/RFQ (Request for Quotation) Management System enables procurement teams to create tenders, invite vendors, receive quotations, compare responses, and award contracts. This integrates with existing Requisition, Purchase Order, and Vendor Management modules.

---

## User Stories

### User Story 1839: Create and Manage Tenders
**As a** Procurement Officer
**I want to** create tenders from approved requisitions or manually
**So that** I can solicit competitive bids from vendors for required materials/services

### User Story 1840: Vendor Invitation Management
**As a** Procurement Officer
**I want to** invite vendors to respond to tenders
**So that** qualified suppliers can submit their quotations

### User Story 1841: Quotation Management
**As a** Procurement Officer
**I want to** receive and record vendor quotations with line-item pricing
**So that** I can compare offers and make informed decisions

### User Story 1842: Tender Award and PO Creation
**As a** Procurement Officer
**I want to** award tenders and automatically generate Purchase Orders
**So that** the procurement process flows seamlessly from RFQ to order

---

## Data Model

### Entity Relationship Diagram

```
┌─────────────────┐     1:N     ┌─────────────────────┐
│   Requisition   │◄────────────│       Tender        │
└─────────────────┘             └─────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼ 1:N                ▼ 1:N                ▼ 1:N
         ┌──────────────────┐   ┌─────────────────┐   ┌────────────────┐
         │ TenderLineItem   │   │  TenderVendor   │   │TenderQuotation │
         └──────────────────┘   └─────────────────┘   └────────────────┘
                    │                                          │
                    │                                          ▼ 1:N
                    │                            ┌─────────────────────────┐
                    └───────────────────────────►│TenderQuotationLineItem  │
                                                 └─────────────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │  PurchaseOrder  │
                                                  └─────────────────┘
```

---

## Tender Lifecycle / Status Flow

```
┌───────────┐     Submit      ┌───────────────┐     Approve     ┌───────────────┐
│   Draft   │────────────────►│   Submitted   │────────────────►│   Published   │
└───────────┘                 └───────────────┘                 └───────────────┘
      │                              │                                  │
      │ Cancel                       │ Reject                          │ Close
      ▼                              ▼                                  ▼
┌───────────┐                 ┌───────────────┐                 ┌───────────────┐
│ Cancelled │                 │     Draft     │                 │    Closed     │
└───────────┘                 │   (revised)   │                 └───────────────┘
                              └───────────────┘                         │
                                                                        │ Award
                                                                        ▼
                                                                ┌───────────────┐
                                                                │    Awarded    │
                                                                └───────────────┘
                                                                        │
                                                                        │ Create PO
                                                                        ▼
                                                                ┌───────────────┐
                                                                │ PurchaseOrder │
                                                                └───────────────┘
```

### Status Definitions

| Status | Description |
|--------|-------------|
| **Draft** | Initial state. Tender can be edited, line items added, vendors invited |
| **Submitted** | Tender submitted for approval. Pending approver action |
| **Published** | Approved and published. Vendors can view and respond |
| **Closed** | Closing date passed or manually closed. No more quotations accepted |
| **Awarded** | Winning vendor selected. Ready for PO creation |
| **Cancelled** | Tender cancelled before award |

### Vendor Status Definitions

| Status | Description |
|--------|-------------|
| **Invited** | Vendor invited to submit quotation |
| **Responded** | Vendor has submitted a quotation |
| **NoResponse** | Vendor did not respond by deadline |
| **Declined** | Vendor explicitly declined to quote |

---

## API Endpoints

### Tender Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Tender` | List all tenders |
| GET | `/api/Tender/{id}` | Get tender by ID |
| GET | `/api/Tender/{id}/details` | Get tender with all related data |
| GET | `/api/Tender/status?status={status}` | Filter tenders by status |
| POST | `/api/Tender` | Create tender (basic) |
| POST | `/api/Tender/tender-details` | Create tender with line items |
| POST | `/api/Tender/from-requisition/{requisitionId}` | Create from requisition |
| PUT | `/api/Tender/{id}` | Update tender |
| PUT | `/api/Tender/tender-details-update/{id}` | Update tender details |

### Line Item Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/Tender/{id}/line-items` | Add line items |
| PUT | `/api/Tender/{id}/line-items` | Replace all line items |
| DELETE | `/api/Tender/{id}/line-items/{lineItemId}` | Remove line item |

### Vendor Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Tender/{id}/vendors` | List invited vendors |
| POST | `/api/Tender/{id}/vendors` | Invite vendors |
| PUT | `/api/Tender/{id}/vendors/{vendorId}/status` | Update vendor status |

### Quotation Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Tender/{id}/quotations` | List quotations |
| GET | `/api/Tender/{id}/quotations/{quotationId}/details` | Get quotation details |
| POST | `/api/Tender/{id}/quotations` | Add quotation |
| PUT | `/api/Tender/{id}/quotations/{quotationId}` | Update quotation |

### Lifecycle Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/Tender/submit/{id}` | Submit for approval |
| PUT | `/api/Tender/approve/{id}` | Approve tender |
| PUT | `/api/Tender/reject/{id}` | Reject tender |
| PUT | `/api/Tender/close/{id}` | Close tender |
| PUT | `/api/Tender/award/{id}?quotationId={id}` | Award to vendor |
| PUT | `/api/Tender/cancel/{id}` | Cancel tender |
| POST | `/api/Tender/{id}/create-purchase-order` | Create PO from awarded tender |

### Approval Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/Tender/{id}/approvers` | Add approvers |
| PUT | `/api/Tender/{id}/approvers` | Update approvers |
| GET | `/api/Tender/{id}/approval-history` | Get approval history |
| POST | `/api/Tender/{id}/notification-recipients` | Add notification recipients |

---

## UI Screens Specification

### Screen 1: Tender List View

**Purpose:** Display all tenders with filtering and quick actions

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Tender Management                                        [+ Create Tender]  │
├──────────────────────────────────────────────────────────────────────────────┤
│  Status: [All ▼]  Project: [All ▼]  Buyer: [All ▼]  Date: [From] - [To]    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ # │ Tender No.    │ Title           │ Status    │ Close Date │ Actions│ │
│  ├───┼───────────────┼─────────────────┼───────────┼────────────┼────────┤ │
│  │ 1 │ TND-2026-00001│ Q1 Raw Materials│ Published │ 2026-01-31 │ ⋮      │ │
│  │ 2 │ TND-2026-00002│ Machining Tools │ Draft     │ 2026-02-15 │ ⋮      │ │
│  │ 3 │ TND-2025-00045│ Electronics     │ Awarded   │ 2025-12-15 │ ⋮      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Showing 1-10 of 45 tenders                           [< 1 2 3 4 5 >]       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Actions Menu (⋮):**
- View Details
- Edit (Draft only)
- Submit for Approval (Draft only)
- Close Tender (Published only)
- Cancel Tender
- Create PO (Awarded only)

---

### Screen 2: Create/Edit Tender Form

**Purpose:** Create new tender or edit existing draft tender

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Create Tender                                            [Save] [Cancel]    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ General Information ───────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │  Title *                    [                                        ]  ││
│  │  Description                [                                        ]  ││
│  │  Closing Date *             [📅 2026-01-31           ]                  ││
│  │                                                                         ││
│  │  ┌─ Optional ─────────────────────────────────────────────────────────┐ ││
│  │  │  Source Requisition      [ Select Requisition        ▼ ]           │ ││
│  │  │  Project                 [ Select Project             ▼ ]           │ ││
│  │  │  Buyer                   [ Select Buyer               ▼ ]           │ ││
│  │  │  Currency                [ USD                        ▼ ]           │ ││
│  │  │  Payment Terms           [ Net 30                     ▼ ]           │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                         ││
│  │  Terms & Conditions         [                                        ]  ││
│  │                             [                                        ]  ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─ Line Items ─────────────────────────────────────────── [+ Add Item] ───┐│
│  │                                                                         ││
│  │  # │ Part Number │ Part Name         │ Qty │ UOM  │ Specs      │ Action││
│  │  ──┼─────────────┼───────────────────┼─────┼──────┼────────────┼───────││
│  │  1 │ P-10234     │ Steel Rod 10mm    │ 500 │ PCS  │ Grade 304  │ 🗑️    ││
│  │  2 │ P-10567     │ Aluminum Sheet    │ 100 │ SHT  │ 2mm thick  │ 🗑️    ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Validation Rules:**
- Title is required (max 500 characters)
- Closing Date is required and must be future date
- At least one line item required before submission
- Line item quantity must be > 0

---

### Screen 3: Tender Details View

**Purpose:** View complete tender information with tabs for different sections

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  TND-2026-00001: Q1 Raw Materials Procurement                                │
│  Status: [Published]   Created: 2026-01-04 by john@company.com               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [General] [Line Items] [Vendors (5)] [Quotations (3)] [Approvals] [History]│
│  ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│  ┌─ Tender Information ────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │  Tender Number:    TND-2026-00001                                       ││
│  │  Title:            Q1 Raw Materials Procurement                         ││
│  │  Status:           Published                                            ││
│  │  Closing Date:     2026-01-31                                           ││
│  │  Published Date:   2026-01-05                                           ││
│  │                                                                         ││
│  │  Project:          Project Apollo                                       ││
│  │  Requisition:      REQ-2026-00012                                       ││
│  │  Buyer:            John Smith                                           ││
│  │  Currency:         USD                                                  ││
│  │  Payment Terms:    Net 30                                               ││
│  │                                                                         ││
│  │  Description:                                                           ││
│  │  Procurement of raw materials for Q1 2026 production requirements.     ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  [Close Tender]  [Cancel Tender]                                             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 4: Vendor Invitation Tab

**Purpose:** Manage vendors invited to respond to tender

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [General] [Line Items] [Vendors (5)] [Quotations (3)] [Approvals] [History]│
│  ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│  ┌─ Invited Vendors ─────────────────────────────────── [+ Invite Vendor] ─┐│
│  │                                                                         ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │ Vendor Name        │ Contact      │ Invited    │ Status    │ Action│ ││
│  │  ├────────────────────┼──────────────┼────────────┼───────────┼───────┤ ││
│  │  │ ABC Metals Inc.    │ abc@metals.co│ 2026-01-05 │ Responded │ View  │ ││
│  │  │ Steel Corp         │ info@steel.co│ 2026-01-05 │ Invited   │ ⋮     │ ││
│  │  │ Allied Materials   │ sales@allied │ 2026-01-05 │ Declined  │ -     │ ││
│  │  │ Global Supplies    │ bid@global.co│ 2026-01-06 │ Responded │ View  │ ││
│  │  │ Pacific Traders    │ rfq@pacific  │ 2026-01-06 │ Invited   │ ⋮     │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                         ││
│  │  Legend: 🟢 Responded  🟡 Invited  🔴 Declined  ⚫ No Response          ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Invite Vendor Modal:**
```
┌─────────────────────────────────────────────────┐
│  Invite Vendors                          [X]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Select Vendors:                                │
│  ┌─────────────────────────────────────────┐   │
│  │ [ ] ABC Metals Inc.                     │   │
│  │ [✓] Steel Corp                          │   │
│  │ [✓] Global Supplies                     │   │
│  │ [ ] Pacific Traders                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Response Deadline: [📅 2026-01-28        ]    │
│                                                 │
│  Notes:                                         │
│  [                                          ]   │
│                                                 │
│              [Cancel]  [Send Invitations]       │
└─────────────────────────────────────────────────┘
```

---

### Screen 5: Quotations Tab

**Purpose:** View and manage vendor quotations

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [General] [Line Items] [Vendors (5)] [Quotations (3)] [Approvals] [History]│
│  ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│  ┌─ Vendor Quotations ────────────────────────────── [+ Add Quotation] ────┐│
│  │                                                                         ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │ Vendor         │ Quote #    │ Date       │ Total      │ Lead │ Sel │ ││
│  │  ├────────────────┼────────────┼────────────┼────────────┼──────┼─────┤ ││
│  │  │ ABC Metals     │ Q-2026-001 │ 2026-01-10 │ $45,250.00 │ 14d  │ ⭐  │ ││
│  │  │ Global Supplies│ GS-RFQ-456 │ 2026-01-12 │ $48,100.00 │ 21d  │     │ ││
│  │  │ Steel Corp     │ SC-Q-789   │ 2026-01-11 │ $46,800.00 │ 10d  │     │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                         ││
│  │  [Compare Quotations]                                                   ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─ Selected Quotation: ABC Metals - Q-2026-001 ───────────────────────────┐│
│  │                                                                         ││
│  │  Quotation Date:  2026-01-10         Valid Until:  2026-02-10          ││
│  │  Lead Time:       14 days            Currency:     USD                  ││
│  │                                                                         ││
│  │  Line Items:                                                            ││
│  │  ┌──────────────────────────────────────────────────────────────────┐  ││
│  │  │ Part           │ Qty  │ Unit Price │ Total      │ Lead Time     │  ││
│  │  ├────────────────┼──────┼────────────┼────────────┼───────────────┤  ││
│  │  │ Steel Rod 10mm │ 500  │ $45.50     │ $22,750.00 │ 14 days       │  ││
│  │  │ Aluminum Sheet │ 100  │ $225.00    │ $22,500.00 │ 10 days       │  ││
│  │  ├────────────────┼──────┼────────────┼────────────┼───────────────┤  ││
│  │  │ TOTAL          │      │            │ $45,250.00 │               │  ││
│  │  └──────────────────────────────────────────────────────────────────┘  ││
│  │                                                                         ││
│  │  [Award This Quotation]                                                 ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 6: Quotation Comparison View

**Purpose:** Side-by-side comparison of vendor quotations

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Quotation Comparison - TND-2026-00001                          [Close]      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                  │ ABC Metals    │ Global Supplies │ Steel Corp       │ │
│  ├──────────────────┼───────────────┼─────────────────┼──────────────────┤ │
│  │ Quote Number     │ Q-2026-001    │ GS-RFQ-456      │ SC-Q-789         │ │
│  │ Quote Date       │ 2026-01-10    │ 2026-01-12      │ 2026-01-11       │ │
│  │ Valid Until      │ 2026-02-10    │ 2026-02-15      │ 2026-02-01       │ │
│  │ Lead Time        │ 14 days       │ 21 days         │ 10 days          │ │
│  ├──────────────────┼───────────────┼─────────────────┼──────────────────┤ │
│  │ LINE ITEMS       │               │                 │                  │ │
│  ├──────────────────┼───────────────┼─────────────────┼──────────────────┤ │
│  │ Steel Rod 10mm   │ $45.50/pc     │ $48.00/pc       │ $46.25/pc        │ │
│  │ (500 pcs)        │ = $22,750 ✓   │ = $24,000       │ = $23,125        │ │
│  ├──────────────────┼───────────────┼─────────────────┼──────────────────┤ │
│  │ Aluminum Sheet   │ $225.00/sht   │ $241.00/sht     │ $236.75/sht      │ │
│  │ (100 sheets)     │ = $22,500 ✓   │ = $24,100       │ = $23,675        │ │
│  ├──────────────────┼───────────────┼─────────────────┼──────────────────┤ │
│  │ TOTAL            │ $45,250.00 ✓  │ $48,100.00      │ $46,800.00       │ │
│  │                  │ (Lowest)      │ (+6.3%)         │ (+3.4%)          │ │
│  └──────────────────┴───────────────┴─────────────────┴──────────────────┘ │
│                                                                              │
│  ✓ = Best price for line item                                               │
│                                                                              │
│  [Award: ABC Metals] [Award: Global Supplies] [Award: Steel Corp]           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 7: Add/Edit Quotation Form

**Purpose:** Record vendor quotation details

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Add Vendor Quotation                                     [Save] [Cancel]    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ Quotation Header ──────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │  Vendor *               [ ABC Metals Inc.              ▼ ]              ││
│  │  Quotation Number       [                                ]              ││
│  │  Quotation Date *       [📅 2026-01-10               ]                  ││
│  │  Valid Until            [📅 2026-02-10               ]                  ││
│  │  Lead Time (days)       [    14                      ]                  ││
│  │  Currency               [ USD                          ▼ ]              ││
│  │                                                                         ││
│  │  Attach Document        [📎 Choose File    ] quote_abc.pdf             ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─ Line Item Pricing ─────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │  ┌──────────────────────────────────────────────────────────────────┐  ││
│  │  │ Part             │ Req Qty │ Quoted Qty │ Unit Price │ Total    │  ││
│  │  ├──────────────────┼─────────┼────────────┼────────────┼──────────┤  ││
│  │  │ Steel Rod 10mm   │ 500     │ [  500  ]  │ [ 45.50 ]  │ $22,750  │  ││
│  │  │ Aluminum Sheet   │ 100     │ [  100  ]  │ [ 225.00]  │ $22,500  │  ││
│  │  ├──────────────────┼─────────┼────────────┼────────────┼──────────┤  ││
│  │  │ TOTAL            │         │            │            │ $45,250  │  ││
│  │  └──────────────────────────────────────────────────────────────────┘  ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─ Notes & Terms ─────────────────────────────────────────────────────────┐│
│  │                                                                         ││
│  │  Notes:               [                                              ]  ││
│  │  Terms & Conditions:  [                                              ]  ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 8: Approval Workflow Tab

**Purpose:** Manage approvers and view approval status

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [General] [Line Items] [Vendors (5)] [Quotations (3)] [Approvals] [History]│
│  ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│  ┌─ Approval Configuration ─────────────────────────── [+ Add Approver] ───┐│
│  │                                                                         ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │ Stage │ Approver           │ Status      │ Date       │ Comment   │ ││
│  │  ├───────┼────────────────────┼─────────────┼────────────┼───────────┤ ││
│  │  │ 1     │ Jane Doe (Manager) │ ✅ Approved │ 2026-01-05 │ LGTM      │ ││
│  │  │ 2     │ Bob Smith (Dir.)   │ ⏳ Pending  │ -          │ -         │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                         ││
│  │  Current Stage: 2 of 2                                                  ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─ Notification Recipients ───────────────────────── [+ Add Recipient] ───┐│
│  │                                                                         ││
│  │  • john@company.com (Requester)                                         ││
│  │  • procurement-team@company.com (CC)                                    ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  [Submit for Approval]                                                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 9: Approval Action Modal

**Purpose:** Approve or reject tender

```
┌─────────────────────────────────────────────────┐
│  Approve Tender: TND-2026-00001          [X]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Tender: Q1 Raw Materials Procurement           │
│  Total Requested: 2 line items                  │
│  Closing Date: 2026-01-31                       │
│                                                 │
│  Invited Vendors: 5                             │
│                                                 │
│  Comment (optional):                            │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│              [Reject]    [Approve]              │
└─────────────────────────────────────────────────┘
```

---

### Screen 10: Award Confirmation Modal

**Purpose:** Confirm tender award and PO creation

```
┌─────────────────────────────────────────────────┐
│  Award Tender                            [X]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ⚠️ You are about to award this tender to:     │
│                                                 │
│  Vendor: ABC Metals Inc.                        │
│  Quotation: Q-2026-001                          │
│  Total Amount: $45,250.00 USD                   │
│  Lead Time: 14 days                             │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [✓] Create Purchase Order automatically │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  This action will:                              │
│  • Mark tender as "Awarded"                     │
│  • Update vendor pricing in system              │
│  • Create PO (if selected)                      │
│                                                 │
│              [Cancel]    [Confirm Award]        │
└─────────────────────────────────────────────────┘
```

---

## Business Rules

### Tender Creation
1. Tender Number is auto-generated: `TND-{YEAR}-{SEQ}` (e.g., TND-2026-00001)
2. Default closing date is 14 days from creation when created from requisition
3. Line items can only be added/modified in Draft status
4. At least one line item required before submission

### Vendor Invitation
1. Vendors can only be invited when tender is in Draft or Published status
2. Same vendor cannot be invited twice to the same tender
3. Response deadline defaults to tender closing date if not specified

### Quotation Management
1. Quotations can only be added to Published or Closed tenders
2. Adding a quotation automatically updates vendor status to "Responded"
3. Total price is auto-calculated from line items
4. Only one quotation can be marked as "selected" (winning)

### Approval Workflow
1. At least one approver must be assigned before submission
2. At least one vendor must be invited before submission
3. Rejection resets tender to Draft status
4. Full approval automatically publishes the tender

### Award Process
1. Tender must be in Closed status to award
2. Awarding updates vendor status and marks quotation as selected
3. Award process updates CompanyPart pricing automatically
4. PO can be created after award

### Status Transitions
```
Draft → Submitted (requires: approvers, line items, vendors)
Submitted → Published (after approval)
Submitted → Draft (after rejection)
Published → Closed (manually or auto on closing date)
Closed → Awarded (after selecting quotation)
Any (except Awarded) → Cancelled
```

---

## Integration Points

### 1. Requisition Integration
- Create tender directly from approved requisition
- Copy requisition line items to tender line items
- Link tender to source requisition for traceability

### 2. Company/Vendor Integration
- Select vendors from existing Company records
- Filter by vendor type (companies marked as vendors)
- Update CompanyPart pricing from awarded quotations

### 3. Purchase Order Integration
- Auto-generate PO from awarded tender
- Copy awarded quotation line items to PO line items
- Link PO to tender for audit trail

### 4. Approval System Integration
- Uses shared ApprovalService for workflow
- Supports multi-stage approval chains
- Email notifications for approval actions

### 5. Document Management
- Attach quotation documents to TenderQuotation
- Link to Document entity for file storage

---

## Database Tables

| Table | Schema | Description |
|-------|--------|-------------|
| `tender` | sc | Main tender header |
| `tender_line_item` | sc | Items being requested |
| `tender_vendor` | sc | Invited vendors |
| `tender_quotation` | sc | Vendor quotation responses |
| `tender_quotation_line_item` | sc | Quotation line item pricing |
| `company_part` | sc | Updated with awarded pricing |

---

## Security & Access Control

### Role Permissions

| Action | Procurement Officer | Procurement Manager | Approver | Viewer |
|--------|:------------------:|:-------------------:|:--------:|:------:|
| View Tenders | ✓ | ✓ | ✓ | ✓ |
| Create Tender | ✓ | ✓ | - | - |
| Edit Tender | ✓ | ✓ | - | - |
| Invite Vendors | ✓ | ✓ | - | - |
| Add Quotations | ✓ | ✓ | - | - |
| Submit for Approval | ✓ | ✓ | - | - |
| Approve/Reject | - | ✓ | ✓ | - |
| Award Tender | - | ✓ | - | - |
| Cancel Tender | - | ✓ | - | - |
| Create PO | ✓ | ✓ | - | - |

---

## Notifications

| Event | Recipients | Template |
|-------|------------|----------|
| Tender Submitted | Approvers | "Tender {number} awaiting your approval" |
| Tender Approved | Creator, CC list | "Tender {number} has been approved and published" |
| Tender Rejected | Creator | "Tender {number} was rejected: {comment}" |
| Tender Awarded | Winning vendor, CC list | "You have been awarded Tender {number}" |
| Tender Cancelled | Invited vendors | "Tender {number} has been cancelled" |
| Closing Date Reminder | Invited vendors | "Tender {number} closes in 3 days" |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-04 | SpaceLinx Team | Initial requirements based on Feature 1833 |
