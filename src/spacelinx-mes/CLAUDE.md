# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SpaceLinx MES is a React 18 frontend application for a Manufacturing Execution System / Product Lifecycle Management platform. It uses Vite for building, MUI v5 for UI components, and MSAL for Azure AD authentication.

## Build and Run Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (Vite)
npm run build        # Production build
npm run build:dev    # Development environment build
npm run build:uat    # UAT environment build
npm run build:demo   # Demo environment build
npm run lint         # ESLint with zero warnings tolerance
npm run preview      # Preview production build
```

## Architecture

### Project Structure

```
src/
├── Components/       # Shared UI components (Header, NavBar, Content, Loaders, etc.)
├── features/         # Feature modules organized by domain
├── services/         # API service layer (72 service files)
├── slices/           # Redux slices
├── constants/        # App constants including PERMISSIONS
├── app/store.js      # Redux store configuration
├── Theme.jsx         # MUI theme configuration (dark/light mode)
├── msalConfig.js     # MSAL authentication configuration
└── main.jsx          # App entry point with provider hierarchy
```

### Key Patterns

**API Service Pattern:**
- All API calls go through `src/services/api.js` which is an axios instance with MSAL token interceptor
- Each entity has its own service file (e.g., `partService.js`, `guideService.js`)
- Services export async functions that call the API and return `response.data`
- Example pattern:
```javascript
import api from "./api";
const apiUrl = "Part";

export const fetchParts = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
```

**Provider Hierarchy (main.jsx):**
```
Provider (Redux) → BrowserRouter → MsalProvider → UserContextProvider → AlertsContextProvider → ProductContextProvider → DrawerProvider → App
```

**Authentication Flow:**
- Azure AD authentication via MSAL React
- Token automatically attached to requests via axios interceptor
- `SPACELINX-TENANT-ID` and `SPACELINX-APP-NAME` headers added to all requests
- Token refresh handled automatically with background refresh when < 5 min remaining

**Permission System:**
- Permissions defined in `src/constants/PagePermissions.js` as nested objects
- Format: `ENTITY.ACTION` (e.g., `PARTS.VIEW`, `PARTS.MODIFY`, `PARTS.DELETE`)
- `UserContext` provides `hasPermission(permissionString)` function
- Routes use `renderProtectedComponent()` pattern in `Content.jsx`

**Context Providers:**
- `UserContext` - User data, roles, permissions, active role management
- `AlertsContext` - Application-wide alerts
- `ProductContext` - Product state management
- `GuideContext` - Guide-specific state (wrapped per route)
- `IssuesProvider` - Issues management
- `FeatureBitContext` - Feature flags
- `PartDetailsDrawerProvider` - Part details drawer state

**Theme System:**
- Light/dark mode toggle stored in `localStorage` as `MESAppTheme`
- Theme context exposes `theme` and `toggleTheme()`
- MUI theme generated via `GetTheme(themeMode)` in `Theme.jsx`

### Feature Modules (`src/features/`)

Major domains:
- `admin/` - Parts, BOM, ECO, Tools, Machines, Locations, PartTypes, PaymentTerms
- `Guides/` - Assembly guides and guide details
- `workOrder/` - Work packages, work orders, steps
- `materialKits/` - Material kit management
- `Procurement/` - Purchase orders, requisitions, goods receipts
- `Inventory/` - Parts inventory, goods, services, stock movements
- `ContactHub/` - Staff, organization, contacts, companies
- `ProgramManagement/` - Programs and projects
- `Roles/` - Role management
- `Settings/` - Application settings

### Routing

Routes defined in `src/Components/Content/Content.jsx` using React Router v6. All routes are permission-protected using the pattern:
```javascript
<Route path="/plm/parts" element={renderProtectedComponent(PERMISSIONS.PARTS.VIEW, Parts)} />
```

## Environment Variables

```
VITE_API_BASE_URL       # Backend API URL
VITE_MSAL_CLIENT_ID     # Azure AD client ID
VITE_MSAL_TENANT_ID     # Tenant identifier
VITE_APP_NAME           # Application name for headers
```

Environment files: `.env`, `.env.development`, `.env.uat`, `.env.demo`

## Key Dependencies

- **UI:** @mui/material, @mui/x-data-grid, @mui/x-date-pickers, antd
- **State:** @reduxjs/toolkit, react-redux
- **Auth:** @azure/msal-react
- **Routing:** react-router-dom v6
- **Charts:** @mui/x-charts, react-google-charts, d3
- **PDF:** @react-pdf/renderer
- **DnD:** @dnd-kit/core, react-beautiful-dnd
- **Dates:** dayjs
