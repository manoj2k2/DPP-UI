# DPP SaaS Design

## 1. Document Purpose

This document defines a comprehensive product, data, architecture, integration, and implementation design for a Digital Product Passport (DPP) SaaS platform targeting EU-market manufacturers and supply chains.

The platform is designed around:

- A reusable DPP Core
- Product-specific and industry-specific modules
- Structured customer data intake
- Supplier data collection
- Data provenance and evidence
- DPP readiness scoring
- Regulatory rules and versioning
- DPP lifecycle/version management
- EU DPP Registry integration
- ERP/PLM/MES/API integrations
- QR/Data Carrier publishing
- Auditability and continuous compliance

The design deliberately separates detailed DPP information held by the SaaS/customer from EU Registry registration information. Exact mandatory fields must always be driven by the applicable EU product-specific legislation/delegated act and its current technical specifications.

---

# 2. Product Vision

## 2.1 Vision

Build a DPP data management and compliance platform that allows manufacturers to:

1. Import product and supply-chain data.
2. Identify missing DPP information.
3. Collect data from suppliers.
4. Validate and enrich product data.
5. Calculate or integrate environmental metrics.
6. Generate versioned DPPs.
7. Publish customer-facing DPP experiences.
8. Register applicable DPPs with the EU Registry.
9. Maintain DPPs throughout the product lifecycle.
10. Continuously monitor regulatory changes.

## 2.2 Product Positioning

The platform should not be positioned as simply:

> "A form that generates a QR code."

It should be positioned as:

> "A product sustainability data and DPP compliance platform."

The DPP is the output of a broader product-data infrastructure.

## 2.3 Core Value Proposition

For manufacturers:

- Reduce DPP preparation effort.
- Identify missing data early.
- Reduce manual spreadsheet work.
- Create an auditable data trail.
- Collect supplier information systematically.
- Reuse data across products.
- Integrate with existing enterprise systems.
- Prepare for EU DPP registration.
- Maintain compliance as requirements evolve.

For suppliers:

- Provide data once.
- Reuse certificates and environmental information.
- Respond to structured data requests.
- Maintain their own data where appropriate.

For regulators/auditors:

- Trace data to sources.
- Review historical DPP versions.
- Validate evidence and provenance.
- Retrieve registration and audit information.

---

# 3. Design Principles

## 3.1 Regulatory-first, not regulation-hardcoded

Do not hard-code product requirements throughout the application.

Use a versioned rules engine:

```text
Product Category
      |
      v
Regulation Version
      |
      v
Requirement Rules
      |
      v
Conditional Logic
      |
      v
Validation
```

## 3.2 Common Core + Industry Packs

Use a shared DPP Core and modular industry schemas.

```text
DPP Core
  |
  +-- Furniture Pack
  +-- Textile Pack
  +-- Electronics Pack
  +-- Battery Pack
  +-- Steel Pack
  +-- Other Product Packs
```

## 3.3 Structured data first

Documents are useful evidence, but important DPP attributes should exist as structured fields.

Example:

```text
Bad:
  "Recycled content: see certificate.pdf"

Good:
  recycledContent = 35%
  evidence = CERT-123
```

## 3.4 Provenance by default

Every material data point should be traceable to a source where practical.

Example:

```text
Recycled content = 35%
Source = Supplier
Supplier = SUP-123
Evidence = CERT-456
Collected = 2026-09-20
Verified = true
```

## 3.5 Immutable published versions

Never silently overwrite a published DPP.

Use:

```text
Draft v4
   |
   v
Validated v4
   |
   v
Published v4
```

Previous published versions remain auditable.

## 3.6 API and UI use the same canonical model

Manual data entry, CSV import, ERP integration, PLM integration, MES integration, and supplier portals must ultimately populate the same canonical DPP model.

---

# 4. High-Level Architecture

```text
                         CUSTOMER SYSTEMS
       +-------------------+-------------------+----------------+
       |                   |                   |                |
      ERP                 PLM                 MES          Supplier APIs
       |                   |                   |                |
       +-------------------+-------------------+----------------+
                               |
                               v
                      +------------------+
                      | Integration Hub  |
                      +--------+---------+
                               |
                               v
                      +------------------+
                      | DPP Intake       |
                      | Engine           |
                      +--------+---------+
                               |
              +----------------+----------------+
              |                                 |
              v                                 v
      +---------------+                 +----------------+
      | Rules Engine  |                 | Data Quality   |
      |               |                 | Engine         |
      +-------+-------+                 +--------+-------+
              |                                  |
              +----------------+-----------------+
                               |
                               v
                      +------------------+
                      | Canonical DPP    |
                      | Data Model       |
                      +--------+---------+
                               |
              +----------------+----------------+
              |                |               |
              v                v               v
        DPP Portal       Evidence Store    Analytics
              |
              v
      +------------------+
      | DPP Publication  |
      +--------+---------+
               |
        +------+------+
        |             |
        v             v
   QR/Data Carrier   EU Registry
```

---

# 5. Core Platform Components

## 5.1 Tenant Management

Every customer is a tenant.

```text
Tenant
  |
  +-- Users
  +-- Roles
  +-- Economic Operators
  +-- Products
  +-- Suppliers
  +-- Sites
  +-- DPPs
  +-- Integrations
  +-- Regulatory Profiles
```

Requirements:

- Strong tenant isolation.
- Tenant-scoped IDs.
- Tenant-specific configuration.
- Tenant-specific rules where permitted.
- Tenant-specific branding.
- Tenant-specific API credentials.
- Tenant-specific data retention policies.

---

# 6. User Roles

Recommended roles:

### Platform Administrator

- Manage platform.
- Manage industry packs.
- Manage regulatory rules.
- Manage integrations.

### Customer Administrator

- Manage company profile.
- Manage users.
- Manage products.
- Configure integrations.

### DPP Manager

- Create/edit DPPs.
- Resolve readiness issues.
- Submit for approval.

### Compliance Manager

- Review regulatory readiness.
- Approve DPP publication.
- Review evidence.
- Manage regulatory changes.

### Sustainability Manager

- Manage PCF/LCA.
- Review environmental data.
- Manage sustainability evidence.

### Supplier

- Respond to data requests.
- Upload certificates.
- Maintain supplier data.

### Auditor/Reviewer

- Read-only access.
- Review versions.
- Review evidence.
- Review provenance.

---

# 7. DPP Data Architecture

The platform should divide data into:

1. Company
2. Economic Operator
3. Product
4. Product Identifier
5. BOM
6. Material
7. Supplier
8. Manufacturing
9. Environmental Data
10. Durability
11. Repairability
12. Circularity
13. Substances
14. Evidence
15. DPP Version
16. Registry Registration
17. Regulatory Rules

---

# 8. Data Intake Modules

## 8.1 Company / Economic Operator

### Core fields

| Field | Type | Default requirement |
|---|---|---|
| Legal name | String | Mandatory |
| Registered address | Address | Mandatory |
| Country | Country | Mandatory |
| VAT ID | String | Conditional |
| Economic operator identifier | String | Conditional |
| Operator role | Enum | Mandatory |
| Contact | Object | Mandatory |
| Authorised representative | Object | Conditional |

The application should collect this once and reuse it across products.

---

# 9. Product Master

### Fields

| Field | Type | Requirement |
|---|---|---|
| Product name | String | Mandatory |
| Brand | String | Conditional |
| Model | String | Mandatory |
| Product category | Enum | Mandatory |
| Product type | Enum | Mandatory |
| SKU | String | Conditional |
| GTIN/equivalent | String | Conditional |
| Batch/lot | String | Conditional |
| Serial number | String | Conditional |
| Production date | Date | Conditional |
| Country of manufacture | Country | Conditional |
| Product version | String | Optional |

The product schema must support model-, batch-, and item-level DPPs.

---

# 10. BOM / Composition

Use a hierarchical structure rather than a flat form.

```text
Product
 |
 +-- Component
 |     |
 |     +-- Material
 |
 +-- Component
       |
       +-- Material
```

### Component fields

- Component ID
- Component name
- Quantity
- Unit
- Mass
- Material
- Supplier
- Country of origin
- Recycled content
- Renewable content
- Critical raw material status
- Substance-of-concern reference
- Evidence

Support:

- Manual entry
- Excel/CSV
- API
- ERP/PLM import

---

# 11. Material Master

Material records should be reusable.

```text
Material
 |
 +-- Identifier
 +-- Name
 +-- Standard classification
 +-- Mass
 +-- Recycled content
 +-- Renewable content
 +-- Origin
 +-- Supplier
 +-- Substances
 +-- Certificates
 +-- Environmental data
```

Products reference material records instead of duplicating material attributes.

---

# 12. Supplier Module

Supplier entities should be first-class records.

```text
Supplier
 |
 +-- Legal information
 +-- Sites
 +-- Components
 +-- Materials
 +-- Environmental data
 +-- Certificates
 +-- Data validity
 +-- Contacts
```

Supplier workflows:

```text
Customer requests data
       |
       v
Supplier receives invitation
       |
       v
Supplier completes structured form
       |
       v
Customer reviews
       |
       v
Data becomes approved/verified
```

---

# 13. Manufacturing Module

### Suggested fields

- Manufacturing site
- Country
- Production date
- Manufacturing process
- Energy consumption
- Renewable energy percentage
- Water consumption
- Production waste
- Scrap
- Relevant production emissions
- Production certifications

Connect to MES where possible.

---

# 14. Environmental Module

## 14.1 PCF

Capture:

- PCF value
- Unit
- Methodology
- System boundary
- Reference period
- Calculation date
- Primary/secondary data
- Data quality
- Verification status
- Verifier

## 14.2 Supporting environmental data

- Energy
- Water
- Waste
- Transport
- Packaging
- Supplier emissions
- End-of-life
- Other applicable environmental indicators

The system must distinguish:

```text
Reported
Calculated
Estimated
Verified
```

---

# 15. Durability / Performance Module

Potential fields:

- Expected lifetime
- Durability rating
- Performance characteristics
- Test standard
- Test result
- Testing laboratory
- Warranty
- Warranty period

The actual required fields must be driven by the applicable product-specific rules.

---

# 16. Repairability Module

Structure:

```text
Repairability
 |
 +-- Repair information
 +-- Disassembly
 +-- Tools
 +-- Spare parts
 +-- Availability
 +-- Repairer information
 +-- Safety instructions
 +-- Repair documentation
```

Spare parts should be separate entities and linked to products/components.

---

# 17. Circularity / End-of-Life Module

Capture where applicable:

- Reuse
- Refurbishment
- Remanufacturing
- Disassembly
- Recycling
- Recovery
- End-of-life treatment
- Recyclability
- Take-back scheme
- Recycling instructions

---

# 18. Substances of Concern

Use structured records:

```text
Substance
 |
 +-- Substance identifier
 +-- Component
 +-- Concentration
 +-- Function
 +-- Regulatory classification
 +-- Applicable threshold
 +-- Evidence
```

Do not use a single free-text field for regulatory substance information.

---

# 19. Evidence and Documents

Documents must be modelled as evidence objects.

```text
Evidence
 |
 +-- Document ID
 +-- Document type
 +-- Issuer
 +-- Issue date
 +-- Expiry date
 +-- Applicable product
 +-- Applicable component
 +-- Verification status
 +-- File/URL
 +-- Hash
```

Examples:

- Material certificate
- Test report
- Declaration
- Environmental declaration
- Repair manual
- Compliance document
- Sustainability certificate

---

# 20. Data Provenance

Every important structured value should optionally contain:

```text
source_type
source_id
source_document
supplier_id
collected_at
verified_at
verified_by
calculation_method
confidence
```

Example:

```json
{
  "value": 35,
  "unit": "percent",
  "source": {
    "type": "SUPPLIER",
    "supplierId": "SUP-123",
    "documentId": "CERT-456"
  },
  "verified": true
}
```

This enables audit-ready traceability.

---

# 21. Requirement Classification

Every field should be represented through a requirement engine.

### Mandatory

Required for the current product/regulatory context.

### Conditional

Required when a condition evaluates to true.

Example:

```text
IF hasBattery == true
THEN battery.module = REQUIRED
```

### Optional

Useful information that is not currently required.

---

# 22. Rules Engine

Do not implement:

```text
field.mandatory = true
```

Use versioned rules.

Example:

```json
{
  "ruleId": "FURN-REPAIR-001",
  "productCategory": "FURNITURE",
  "field": "repair.instructions",
  "requirement": "CONDITIONAL",
  "condition": "product.isRepairable == true",
  "effectiveFrom": "2028-01-01",
  "legalSource": "APPLICABLE_DELEGATED_ACT"
}
```

Rules should contain:

- Rule ID
- Product category
- Regulation
- Regulation version
- Field
- Requirement type
- Condition
- Validation expression
- Severity
- Effective date
- Expiry date
- Legal source
- Explanation

---

# 23. Canonical DPP API Model

UI, imports and integrations should populate one canonical model.

Example:

```json
{
  "product": {
    "id": "PROD-123",
    "name": "Chair X200",
    "brand": "Example",
    "model": "X200",
    "category": "furniture"
  },
  "components": [],
  "materials": [],
  "suppliers": [],
  "manufacturing": {},
  "environment": {},
  "durability": {},
  "repairability": {},
  "circularity": {},
  "substances": [],
  "evidence": []
}
```

The exact EU Registry payload should be handled by a dedicated adapter rather than becoming the internal data model.

---

# 24. API Design

Suggested REST endpoints:

```text
POST   /v1/products
GET    /v1/products/{id}
PATCH  /v1/products/{id}

POST   /v1/products/{id}/components
POST   /v1/products/{id}/materials
POST   /v1/products/{id}/suppliers
POST   /v1/products/{id}/environment
POST   /v1/products/{id}/repairability
POST   /v1/products/{id}/circularity
POST   /v1/products/{id}/evidence

GET    /v1/products/{id}/readiness
GET    /v1/products/{id}/validation
GET    /v1/products/{id}/versions

POST   /v1/products/{id}/validate
POST   /v1/products/{id}/publish
POST   /v1/products/{id}/register

GET    /v1/registry/registrations/{id}
GET    /v1/registry/status/{id}
```

Use idempotency keys for write operations.

Example:

```text
Idempotency-Key: REG-tenant123-product456-v4
```

---

# 25. Import Interfaces

Support four main intake methods.

## 25.1 Manual

For small companies.

## 25.2 Excel/CSV

For initial migration.

## 25.3 API

For enterprise customers.

## 25.4 Supplier portal

For distributed data collection.

All four must converge into the canonical model.

---

# 26. Integration Hub

Architecture:

```text
ERP ----\
PLM -----\
MES ------> Integration Hub --> Canonical DPP Model
PIM -----/
Supplier/
CSV -----/
```

The Integration Hub should provide:

- Authentication
- Mapping
- Transformation
- Validation
- Error handling
- Retry
- Monitoring
- Versioning

---

# 27. DPP Readiness Scoring

Do not use one simplistic completion percentage.

Use three primary scores.

## 27.1 Completeness

"Have we collected the required information?"

## 27.2 Data Quality

"Is the information valid, current, consistent and supported?"

## 27.3 Regulatory Readiness

"Can this product satisfy the currently applicable DPP requirements?"

Example:

```text
DPP HEALTH

Completeness       91%
Data Quality       78%
Regulatory Ready   64%
```

---

# 28. Readiness Calculation

Example model:

```text
Completeness
  40%

Data Quality
  20%

Evidence
  15%

Supplier Data
  15%

Freshness
  10%
```

However, regulatory readiness should separately evaluate whether all currently mandatory requirements are satisfied.

A product should not be called "registration ready" merely because it has a high general data score.

---

# 29. User Experience

## 29.1 Progressive disclosure

Never show hundreds of fields by default.

Example:

```text
Does the product contain a battery?

[ No ] [ Yes ]
```

If Yes:

```text
Battery chemistry
Battery capacity
Manufacturer
Critical materials
Recycling information
...
```

## 29.2 Guided onboarding

Recommended sequence:

```text
1. Company
2. Product
3. BOM
4. Materials
5. Suppliers
6. Environmental
7. Repairability
8. Circularity
9. Evidence
10. Validation
11. Publication
12. Registry
```

## 29.3 Explain why information is required

Every field should provide:

- Requirement status
- Reason
- Regulatory source/reference
- Example
- Expected format

Example:

> Required because this field is mandatory for the applicable product category.

---

# 30. DPP Readiness Dashboard

Example:

```text
DPP READINESS
==========================

Product Identity        100%  ✓
Company                  100%  ✓
BOM                       95%  ✓
Materials                 80%  ⚠
Suppliers                 62%  ⚠
Environmental             70%  ⚠
Repairability            100%  ✓
Circularity               45%  ✕
Evidence                  76%  ⚠

EU REGISTRATION
==========================

Required identifiers      ✓
Required fields           ✓
Semantic validation       ✓
Evidence                  ⚠
Product-specific rules    ✕
```

Every warning should be clickable and take the user directly to the missing data.

---

# 31. DPP Lifecycle

Use explicit states:

```text
DRAFT
  |
  v
VALIDATING
  |
  v
VALIDATED
  |
  v
APPROVED
  |
  v
PUBLISHED
  |
  v
REGISTERED
  |
  v
SUPERSEDED
```

Failure states:

```text
VALIDATION_FAILED
REGISTRATION_FAILED
REGISTRY_REJECTED
REGISTRY_SYNC_ERROR
```

---

# 32. DPP Versioning

Never overwrite a published DPP.

Example:

```text
DPP-001

v1  Published
 |
 v
v2  Published
 |
 v
v3  Draft
```

Each version should contain:

```text
version_id
dpp_id
version_number
content_hash
created_at
published_at
published_by
registry_status
eu_registration_id
```

---

# 33. Content Hashing

For each published version:

```text
Canonical DPP JSON
       |
       v
Canonical serialization
       |
       v
SHA-256
       |
       v
Content hash
```

Store the hash with the version.

This provides a strong integrity/audit mechanism and aligns with the EU Registry's use of a DPP-version hash in registration proof.

---

# 34. EU Registry Connector

Treat the EU Registry as a separate integration adapter.

```text
Canonical DPP
      |
      v
EU Registry Adapter
      |
      v
EU Registry API
```

Do not couple your entire product model to the Registry API.

The connector should handle:

- Authentication/authorization
- Identifier registration
- Required metadata
- Product-specific registration data
- Submission
- Response parsing
- Registration ID
- Registration status
- Proof of registration
- Updates
- Error handling
- Retry

The EU Registry is not intended to become the full database for every detailed DPP attribute.

---

# 35. EU Registry Registration Workflow

```text
DPP validated
     |
     v
Create immutable version
     |
     v
Pre-registration validation
     |
     v
Submission job
     |
     v
EU Registry API
     |
     v
EU validation
     |
     +---- FAIL --> Error workflow
     |
     v
Registration successful
     |
     v
Receive EU registration identifier
     |
     v
Store registration proof
     |
     v
Mark DPP REGISTERED
```

The exact API fields and protocol must be taken from the current Commission technical documentation and semantic repository rather than hard-coded from unofficial examples.

---

# 36. Asynchronous Registry Integration

Do not make the browser wait for Registry operations.

Use a job queue.

```text
POST /products/{id}/register

        |
        v

REGISTRATION_JOB_CREATED
        |
        v
QUEUE
        |
        v
REGISTRY WORKER
        |
        v
EU REGISTRY
        |
        v
RESULT
```

Example response:

```json
{
  "status": "SUBMISSION_PENDING",
  "jobId": "REG-12345"
}
```

---

# 37. Registry Credentials

Store Registry credentials using a secrets-management system.

Do not store credentials as ordinary application fields.

Suggested entity:

```text
RegistryConnection
------------------
tenant_id
environment
credential_reference
scopes
status
created_at
expires_at
last_tested_at
```

Support separate:

- Test environment
- Production environment

---

# 38. Synchronization Strategy

Use event-driven synchronization.

```text
ERP/PLM/MES change
       |
       v
Change event
       |
       v
DPP impact analysis
       |
       +---- No DPP impact --> Ignore
       |
       v
Create new DPP version
       |
       v
Validate
       |
       v
Publish
       |
       v
Registry update if required
```

Do not synchronize every internal ERP change blindly.

---

# 39. Change Impact Matrix

Example:

| Change | New DPP Version | Registry Update |
|---|---:|---:|
| BOM change | Yes | If applicable |
| Material change | Yes | If applicable |
| PCF change | Yes | If applicable |
| Internal note | No | No |
| Product image | Maybe | Usually DPP-side |
| Regulatory attribute | Yes | Yes |
| Repair instruction | Yes | If applicable |
| Supplier contact | Usually no | Usually no |

The exact outcome must be controlled by the current product-specific rules.

---

# 40. Regulatory Update System

Regulatory updates should be treated as versioned product data.

```text
Regulation
   |
   +-- Product Category
          |
          +-- Version
                 |
                 +-- Rules
                 +-- Effective date
                 +-- Validation
```

When a new requirement is published:

```text
Regulatory update
      |
      v
Internal review
      |
      v
New rule version
      |
      v
Impact analysis
      |
      v
Affected products
      |
      v
Recalculate readiness
      |
      v
Customer notification
```

---

# 41. Regulatory Change Notifications

Customers should receive actionable notifications.

Bad:

> "New EU regulation available."

Good:

> "New furniture DPP requirement affects 83 of your products. 21 products are missing repair information. Complete these fields by the applicable effective date."

Dashboard:

```text
REGULATORY IMPACT

83 products affected
21 require action
42 already compliant
20 unaffected

[View affected products]
```

---

# 42. Industry Pack Architecture

An industry pack should contain:

```text
IndustryPack
 |
 +-- Product Categories
 +-- Data Schema
 +-- Vocabulary
 +-- Rules
 +-- Validation
 +-- UI Components
 +-- Calculators
 +-- Document Types
 +-- Registry Mapping
```

Example:

```text
Furniture Pack
 |
 +-- Furniture product attributes
 +-- Wood attributes
 +-- Textile attributes
 +-- Repairability
 +-- Spare parts
 +-- Disassembly
 +-- Circularity
 +-- Relevant environmental metrics
```

This lets the platform scale across sectors.

---

# 43. Furniture-X Strategy

For a furniture-focused launch, prioritize:

### Phase 1

- Product identity
- BOM
- Materials
- Suppliers
- Manufacturing
- Documents

### Phase 2

- Wood
- Textiles
- Coatings
- Adhesives
- Durability
- Repairability
- Spare parts

### Phase 3

- PCF
- Circularity
- Disassembly
- Reuse/refurbishment
- End-of-life

### Phase 4

- ERP/PLM/MES integration
- Supplier network
- Industry data-space integration
- EU Registry

This allows the product to generate value before all advanced functionality is implemented.

---

# 44. Security

Minimum requirements:

- Encryption in transit
- Encryption at rest
- Tenant isolation
- Role-based access control
- MFA
- SSO for enterprise customers
- Secrets management
- API authentication
- Audit logs
- Immutable DPP version records
- Document integrity hashes
- Backup and disaster recovery
- Data retention policies
- Data deletion workflows where legally appropriate

---

# 45. Audit Logging

Log:

```text
Who
What
When
Before
After
Source
Reason
Approval
```

Example:

```text
2026-10-04
USER: jane@company
ACTION: UPDATE
PRODUCT: PROD-123
FIELD: recycledContent
OLD: 30%
NEW: 35%
SOURCE: SUP-123
EVIDENCE: CERT-456
```

---

# 46. Data Quality Engine

Validate:

### Format

- Dates
- Units
- Identifiers
- URLs
- Country codes

### Semantic

- Allowed vocabulary
- Valid material
- Valid product category
- Valid units

### Cross-field

Example:

```text
recycledContent <= 100%
```

or:

```text
componentMass <= productMass
```

### Evidence

Example:

```text
certificate.expiryDate >= currentDate
```

where the applicable rule requires valid evidence.

---

# 47. Unit Management

Never store numeric environmental/material values without units.

Bad:

```text
mass = 8.4
```

Good:

```json
{
  "value": 8.4,
  "unit": "kg"
}
```

Use a controlled unit system and normalize internally.

---

# 48. Data Freshness

Add freshness metadata to important fields.

Example:

```text
Supplier PCF
Value: 42.6 kgCO2e
Collected: 2026-09-01
Valid until: 2027-09-01
```

Readiness can then fall automatically when important evidence expires.

---

# 49. Customer Onboarding Phases

## Phase 1 — Core DPP

Objective: First usable DPP.

Modules:

- Company
- Product
- Product identifier
- Basic BOM
- Materials
- Documents
- DPP version

Output:

> Draft DPP

---

## Phase 2 — Data Readiness

Objective: Reliable structured data.

Add:

- Supplier module
- Material master
- Evidence
- Provenance
- Data quality
- Readiness scoring
- CSV import
- Supplier portal

Output:

> Data-ready DPP

---

## Phase 3 — Industry-specific

Objective: Product-category completeness.

Add:

- Industry packs
- Conditional fields
- Industry vocabulary
- Product-specific rules
- Repairability
- Durability
- Circularity

Output:

> Industry-ready DPP

---

## Phase 4 — Advanced Sustainability

Objective: Sustainability intelligence.

Add:

- PCF
- LCA
- Energy
- Water
- Waste
- Transport
- Recycled content
- Supplier environmental data
- Circularity

Output:

> Sustainability-ready DPP

---

## Phase 5 — EU Registry

Objective: Regulatory registration.

Add:

- EU Registry connector
- Identifier registration
- Pre-validation
- Registration status
- Registration proof
- Registry synchronization

Output:

> Registration-ready / registered DPP

---

## Phase 6 — Continuous Compliance

Objective: Lifecycle management.

Add:

- ERP integration
- PLM integration
- MES integration
- Supplier APIs
- Change impact analysis
- Regulatory monitoring
- Automated readiness recalculation
- DPP versioning
- Continuous compliance

Output:

> Continuously managed DPP

---

# 50. Recommended MVP

Do not attempt to build every module for the first release.

## MVP

### Customer

- Multi-tenant accounts
- Company profile
- Product master

### Data

- BOM
- Materials
- Suppliers
- Evidence

### DPP

- Canonical model
- Versioning
- Validation
- DPP page
- QR/data carrier

### Intelligence

- Completeness score
- Basic quality checks
- Missing-data workflow

### Integration

- CSV import
- REST API

### Architecture

- Rules engine foundation
- Industry-pack foundation
- Audit logging

The EU Registry connector can follow once the current official API/semantic implementation needed for your target product category is fully mapped and tested.

---

# 51. Phase-by-Phase Product Roadmap

| Phase | Product capability | Customer value |
|---|---|---|
| P0 | Core data + DPP | First DPP |
| P1 | Supplier + evidence | Data completeness |
| P2 | Industry modules | Product-specific readiness |
| P3 | PCF + circularity | Sustainability intelligence |
| P4 | EU Registry | Regulatory registration |
| P5 | ERP/PLM/MES | Automation |
| P6 | Regulatory monitoring | Continuous compliance |

---

# 52. Recommended Technology Architecture

A possible implementation:

```text
Frontend
  React / Next.js

Backend
  TypeScript / Node.js
  or
  Java / Spring Boot/ .net

API
  REST + webhooks
  Optional GraphQL for internal UI queries

Database
  PostgreSQL

Object storage
  S3-compatible/ azure blob storage

Search
  OpenSearch / Elasticsearch where needed

Queue
  Kafka / RabbitMQ / message bus 

Cache
  Redis

Identity
  OAuth2 / OIDC

Secrets
  Cloud secrets manager / Vault /azure keyvault

Analytics
  Warehouse + BI layer

Rules
  Versioned rule service

Registry
  Dedicated EU Registry adapter
```

The specific technology stack is less important than preserving the architectural boundaries.

---

# 53. Multi-Tenant Data Model

Core entities:

```text
Tenant
User
Role
EconomicOperator
Site
Product
ProductIdentifier
Component
Material
Supplier
SupplierSite
EnvironmentalMetric
ManufacturingRecord
RepairRecord
CircularityRecord
Substance
Evidence
DPP
DPPVersion
RegulatoryRule
IndustryPack
ValidationResult
ReadinessScore
RegistryConnection
RegistrySubmission
RegistryRegistration
AuditEvent
```

---

# 54. Example End-to-End Customer Journey

```text
Customer signs up
      |
      v
Selects "Furniture"
      |
      v
Furniture industry pack activated
      |
      v
Imports 2,000 products
      |
      v
BOM automatically mapped
      |
      v
Material master created
      |
      v
Missing supplier data identified
      |
      v
Supplier invitations sent
      |
      v
Suppliers upload certificates
      |
      v
PCF imported
      |
      v
Repairability information collected
      |
      v
DPP readiness calculated
      |
      v
Customer resolves remaining issues
      |
      v
DPP validated
      |
      v
DPP version published
      |
      v
EU Registry registration where applicable
      |
      v
QR/Data Carrier deployed
      |
      v
ERP/MES changes monitored
      |
      v
DPP continuously maintained
```

---

# 55. Commercial Packaging

A potential SaaS pricing model:

## Starter

- Product master
- Basic DPP
- CSV import
- DPP pages
- QR codes

## Professional

- Supplier portal
- BOM
- Materials
- Evidence
- Readiness scoring
- Industry packs

## Enterprise

- ERP/PLM/MES integration
- Advanced PCF
- Regulatory engine
- EU Registry connector
- SSO
- Audit tools
- Advanced APIs

## Network / Ecosystem

- Supplier network
- Multi-tier data exchange
- Industry data spaces
- Data-sharing agreements
- Cross-company workflows

---

# 56. Key Product Metrics

Track:

### Customer onboarding

- Time to first product
- Time to first DPP
- Products imported
- Supplier invitations

### Data

- Completeness
- Quality
- Evidence coverage
- Supplier response rate
- Data freshness

### Compliance

- Registration readiness
- Registry submission success rate
- Validation failures
- Regulatory issues per product

### Platform

- API usage
- Integration errors
- DPP views
- QR scans
- Active products

---

# 57. Critical Design Decisions

## Decision 1

Use a **canonical DPP model**, not an EU Registry-specific database schema.

## Decision 2

Use **rules and schemas as versioned configuration**, not hard-coded application logic.

## Decision 3

Treat **supplier data as first-class data**, not attachments.

## Decision 4

Treat **evidence and provenance as first-class objects**.

## Decision 5

Use **immutable DPP versions**.

## Decision 6

Separate:

```text
Completeness
Quality
Regulatory readiness
```

## Decision 7

Make integrations asynchronous.

## Decision 7.2

Make integrations inbound and outbound mode as component mode. attachable and detachable.

## Decision 8

Make industry modules pluggable.

## Decision 9

Make regulatory changes capable of automatically recalculating product readiness.

## Decision 10

Keep the EU Registry as an integration boundary, not the core application database.

---

# 58. Key Risks

## Regulatory risk

EU requirements evolve by product category.

**Mitigation:** Versioned rules engine and regulatory monitoring.

## Data quality risk

Customers may provide incomplete or unsupported information.

**Mitigation:** Provenance, evidence, quality scoring and supplier workflows.

## Integration risk

ERP/PLM/MES data models differ.

**Mitigation:** Canonical model + mapping layer. Multi system integration plugins method.

## Registry dependency

Registry APIs/specifications can evolve.

**Mitigation:** Dedicated adapter, feature flags, test environment, contract tests.

## Customer adoption

Customers may be overwhelmed by data requirements.

**Mitigation:** Progressive disclosure, readiness dashboard and automated imports.

## Supplier participation

Suppliers may not respond.

**Mitigation:** Supplier portal, reusable supplier profiles, reminders and API support.

---

# 59. Implementation Priorities

The first engineering priorities should be:

1. Multi-tenant architecture.
2. Canonical DPP model.
3. Product/BOM/material data model.
4. Evidence/provenance model.
5. Rules engine foundation.
6. Validation engine.
7. Readiness scoring.
8. DPP versioning.
9. DPP publication.
10. CSV/API ingestion.
11. Supplier portal.
12. Industry-pack framework.
13. Regulatory update framework.
14. EU Registry adapter.
15. ERP/PLM/MES connectors.
16. Advanced environmental/circularity modules.

---

# 60. Final Target Architecture

```text
                           DPP SaaS
                              |
       +----------------------+----------------------+
       |                      |                      |
       v                      v                      v
  Data Intake            Rules Engine         Integration Hub
       |                      |                      |
       |                      |               +------+------+
       |                      |               |      |      |
       |                      |              ERP    PLM    MES
       |                      |
       +----------+-----------+
                  |
                  v
          Canonical DPP Model
                  |
      +-----------+-----------+
      |           |           |
      v           v           v
   Supplier    Evidence    Environmental
     Data        Data          Data
      |           |           |
      +-----------+-----------+
                  |
                  v
           Validation Engine
                  |
          +-------+-------+
          |               |
          v               v
   Readiness Engine   Version Manager
          |               |
          +-------+-------+
                  |
                  v
          DPP Publication
                  |
       +----------+----------+
       |                     |
       v                     v
 Customer DPP Portal     EU Registry
       |
       v
 QR / Data Carrier
       |
       v
 Product Lifecycle
       |
       +----------------------+
                              |
                              v
                    Continuous Compliance
```

# 61. Regulatory Operating Principle

The platform should always distinguish between:

**Platform capability**

What the SaaS can collect or calculate.

**Current legal requirement**

What the applicable EU product legislation currently requires.

**Future requirement**

What is expected based on legislation that is not yet applicable.

**Customer-specific requirement**

What the customer's product, materials, market or configuration triggers.

Never present an optional or anticipated field as legally mandatory without a current applicable legal basis.

The EU DPP framework is evolving through product-specific measures, so the platform's regulatory engine must be designed to absorb new requirements rather than assuming one permanent universal DPP schema.

---

# 62. Summary

The strongest implementation strategy is:

```text
CORE DPP
   +
DATA QUALITY
   +
SUPPLIER NETWORK
   +
INDUSTRY MODULES
   +
ENVIRONMENTAL DATA
   +
RULES ENGINE
   +
DPP VERSIONING
   +
EU REGISTRY CONNECTOR
   +
CONTINUOUS COMPLIANCE
```

The strategic asset is not the QR code and not the Registry connector.

The strategic asset is the **normalized, provenance-aware, versioned product data graph plus the regulatory rules engine** that turns fragmented ERP/PLM/MES/supplier data into an EU-ready DPP.

For a furniture-oriented launch, the recommended path is:

```text
Core DPP
   ↓
Furniture BOM & Materials
   ↓
Supplier Data
   ↓
Durability / Repair
   ↓
Circularity
   ↓
PCF / Environmental
   ↓
EU Regulatory Validation
   ↓
EU Registry
   ↓
Continuous Product Compliance
```

This architecture can later support other product categories without rebuilding the platform.
