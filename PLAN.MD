You are a Senior React Architect and UI/UX Lead.

Design and develop a production-ready Digital Product Passport (DPP) web application frontend that integrates with an existing .NET 8 REST API backend.

DPP SaaS Platform
├─ Company Profile
├─ Product Repository
├─ PCF Management
├─ Supplier Data Collection
├─ Access Management
├─ QR Code Generation
├─ DPP Report Generation
├─ Catena-X Connector
└─ EU Registry Integration

## Technology Stack

- React 19+
- TypeScript
- Vite
- React Router
- Material UI (MUI) OR Ant Design
- React Query (TanStack Query)
- Axios
- Zustand (or Redux Toolkit)
- React Hook Form
- Yup Validation
- Recharts
- JWT Authentication
- Docker
- Responsive Design
- Dark/Light Theme

## Business Goal

Build a modern SaaS application allowing manufacturing companies and automotive suppliers to manage Digital Product Passport (DPP) information.

Users should be able to:

- Manage Companies
- Manage Products
- Manage Materials
- Manage Suppliers
- Manage Product Carbon Footprint (PCF)
- Upload Compliance Documents
- Generate Product Passports
- Perform DPP Readiness Assessments
- View Dashboards and Reports

## UI Architecture

Create the project structure:

src/
├── api/
├── components/
├── layouts/
├── pages/
├── routes/
├── hooks/
├── store/
├── services/
├── models/
├── forms/
├── utils/
├── theme/
├── assets/
└── App.tsx

Use feature-based modular architecture.

## Authentication

Implement:

### Login Page

Fields:

- Email
- Password

Features:

- JWT Login
- Remember Me
- Forgot Password
- Session Timeout
- Token Refresh

### User Profile

- View Profile
- Change Password
- Logout

## Layout

### Main Layout

Top Navigation:

- Logo
- Company Selector
- Notifications
- Profile Menu

Left Sidebar:

- Dashboard
- Companies
- Products
- Materials
- Suppliers
- PCF
- Compliance
- DPP Passports
- Assessment
- Reports
- Settings

## Dashboard

Create executive dashboard cards:

### KPI Cards

- Total Products
- DPP Generated
- Missing PCF
- Missing Compliance Documents
- Readiness Score
- Active Suppliers

### Charts

1. Product Status
2. Compliance Status
3. PCF Completion
4. Readiness Trend

Use Recharts.

### Dashboard Widgets

- Latest Products
- Upcoming Document Expiry
- Recent Activity
- Audit Events

## Company Management

### Company List

Features:

- Search
- Filter
- Sort
- Pagination

Actions:

- Add Company
- Edit Company
- View Company

Columns:

- Company Name
- Country
- Industry
- Employees
- Status

### Company Form

Fields:

- Company Name
- VAT Number
- Country
- Industry
- Employee Count

## Product Management

### Product List

Columns:

- Product Number
- Product Name
- Category
- Weight
- Status
- Passport Status

Actions:

- View
- Edit
- Delete
- Generate Passport

### Product Form

Fields:

- Product Number
- Product Name
- Category
- Weight
- Description

## Product Details Screen

Sections:

### Product Overview

### Materials Tab

Show bill of materials

### Suppliers Tab

Linked suppliers

### PCF Tab

Carbon footprint information

### Compliance Tab

Uploaded compliance documents

### Passport Tab

Generated DPP preview

## Material Management

### Material List

Columns:

- Material Name
- Type
- Weight
- Recycled Content %
- Country Of Origin

Features:

- Add
- Edit
- Delete

## Supplier Management

### Supplier List

Columns:

- Supplier Name
- Supplier Code
- Country
- Email

Features:

- Search
- Filter
- CRUD

## PCF Management

### Product Carbon Footprint

Fields:

- Product
- CO2 Equivalent
- Calculation Method
- Verification Status
- Calculation Date

### PCF Dashboard

Charts:

- CO2 By Product
- CO2 Trend
- Highest Emission Products

## Compliance Document Management

### Document Upload

Features:

- Drag and Drop Upload
- Multi File Upload
- Preview
- Download
- Delete

Supported:

- PDF
- DOCX
- XLSX
- Images

Columns:

- Document Name
- Type
- Product
- Upload Date
- Expiry Date

## Digital Product Passport

### Passport Generation

Button:

Generate DPP

Call:

POST /api/passports/generate

### Passport Viewer

Display:

- Product Information
- Materials
- Suppliers
- Carbon Footprint
- Compliance Documents

### Export Options

- JSON
- PDF
- QR Code

### QR Code View

Generate QR code for product passport.

## Readiness Assessment

### Assessment Wizard

Step 1

Company Information

Step 2

Sustainability Questions

Step 3

PCF Readiness

Step 4

Document Readiness

Step 5

Review

### Assessment Results

Display:

- Overall Score
- Readiness Percentage
- Compliance Level

Provide:

- Gap Analysis
- Recommended Actions

## Reports

Generate and download:

- DPP Report
- Readiness Report
- PCF Report
- Compliance Report

Formats:

- PDF
- Excel

## API Integration

Create reusable Axios API client.

Implement:

AuthApi
CompanyApi
ProductApi
MaterialApi
SupplierApi
PcfApi
DocumentApi
PassportApi
AssessmentApi
DashboardApi

Use React Query.

Example:

GET /api/products

POST /api/products

PUT /api/products/{id}

DELETE /api/products/{id}

## State Management

Use Zustand.

Store:

- Authentication
- User Details
- Selected Company
- Theme
- Notifications

## Error Handling

Implement:

- Global Error Boundary
- Toast Notifications
- Loading Indicators
- Retry Mechanism

## Security

Implement:

- Protected Routes
- Role Based Rendering
- JWT Interceptor
- Permission Guards

Roles:

- Super Admin
- Company Admin
- Supplier User
- Auditor
- Customer

## Theme

Create professional enterprise UI similar to:

- Salesforce
- SAP Fiori
- Microsoft Azure Portal

Support:

- Light Theme
- Dark Theme

## Responsive Design

Support:

- Desktop
- Tablet
- Mobile

## Sample Pages

1 Dashboard
2 Companies
3 Products
4 Product Details
5 Materials
6 Suppliers
7 PCF
8 Compliance Documents
9 Passport Viewer
10 Assessment Wizard
11 Reports
12 Settings

## Non Functional Requirements

- WCAG Accessibility
- Fast Performance
- Lazy Loading
- Code Splitting
- Localization Ready
- Multi Tenant Support

## Docker

Create:

Dockerfile

docker-compose.yml

Nginx Configuration

## Deliverables

Generate:

1 Complete folder structure
2 Routing configuration
3 Theme configuration
4 State management
5 API services
6 Reusable components
7 Page implementations
8 Form validation
9 Authentication flow
10 Dashboard charts
11 Data tables
12 Passport viewer
13 Assessment wizard
14 Docker deployment files
15 README deployment guide

Provide production-ready TypeScript code.