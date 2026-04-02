# KEA - Knowledge Extraction Agent

## What is KEA?

KEA is an AI-powered platform that extracts structured business knowledge through natural conversations. Instead of filling out forms, users talk to an AI that asks targeted questions about their business and automatically organizes the answers into a structured database.

---

## Two types of users

### Admin (super admin)
- Creates and manages **clients** (organizations)
- Creates **templates** (the schema of what data to extract)
- Assigns templates to clients
- Creates **users** within each client
- Monitors extraction progress across all clients
- Exports extracted data (JSON / CSV)

### Knowledge Expert (domain_expert)
- Sees only their own organization's data
- Chats with the AI to provide business knowledge
- Sees their progress (% completion per track)
- That's it. No settings, no templates, no other clients.

---

## Core concepts

| Concept | What it is |
|---------|-----------|
| **Organization** | A client company (e.g. "Favorite Furniture") |
| **Template** | The extraction schema - defines what data to collect |
| **Track** | A major business area within a template (e.g. "Production & Operations", "Finance & Sales") |
| **Block** | A specific topic within a track (e.g. "Bill of Materials", "Warehouse Management") |
| **Field** | A single data point within a block (e.g. "number_of_warehouses", "main_raw_materials") |
| **Session** | One conversation between a user and the AI, focused on a specific track |
| **Extraction Instance** | The actual extracted data for a block, with completeness % |

### Hierarchy

```
Template
  -> Track 1: Production & Operations
       -> Block: BOM (Bill of Materials)
            -> Field: main_raw_materials
            -> Field: recipe_structure
            -> Field: cost_calculation_method
       -> Block: Production Planning
            -> Field: planning_method
            -> Field: capacity_management
       -> Block: Supply Chain
            -> ...
  -> Track 2: Finance, Sales & Administration
       -> Block: Financial Management
       -> Block: Sales Management
       -> Block: Users & Roles
```

---

## How it works (step by step)

### 1. Admin sets up a client

1. Go to **Dashboard > Clients**
2. Click **+ New Client** - enter name, slug, industry
3. **Assign a template** - the system deep-clones the master template so each client has their own copy
4. **Add users** - enter name, email, password, role (`domain_expert`)
5. Give the user their login credentials

### 2. User logs in for the first time

1. User goes to `/kea/login` and enters their email + password
2. They see a **5-step onboarding walkthrough**:
   - Welcome to KEA
   - How Smart Conversations work
   - Tracks & Blocks explained
   - Progress tracking
   - Ready to begin
3. They pick their preferred language (EN / BG / ES)
4. After onboarding, they land on their **dashboard**

### 3. User starts chatting

1. From the dashboard, click **Start New Session** (or go to Chat)
2. Select a **track** (e.g. "Production & Operations")
3. The AI starts asking questions about that business area
4. The user answers naturally - no forms, no dropdowns
5. The AI adapts: asks follow-ups, clarifies, moves to the next topic

### 4. Extraction happens automatically

After every message exchange:
1. The AI response is streamed to the user in real-time
2. In the background, a separate AI call analyzes the conversation
3. It extracts structured data points (field values) with confidence scores
4. Data is saved to `extraction_instances`
5. If a value contradicts a previous answer, an **alert** is created
6. Progress snapshots are updated (per-block and per-track)

### 5. Progress updates in real-time

- The chat sidebar shows **block-by-block completion bars** (refreshes every 10 seconds)
- The user's dashboard shows **overall % and per-track progress**
- The admin dashboard shows **per-client completion** across all organizations
- Colors: red (< 34%), amber (34-67%), blue (67-99%), green (100%)

### 6. Admin monitors and exports

- Admin dashboard shows all clients with progress rings
- Click into a client to see detailed track progress, users, sessions
- **Export** extracted data as JSON or CSV at any time

---

## The default template

**"ERP Manufacturing - Full Extraction"** has 2 tracks, 9 blocks, and 101 fields:

**Track 1: Production & Operations** (open-ended conversation style)
- BOM / Technologies (repeatable - one per product)
- Production Planning
- Production Execution
- Supply Chain
- Warehouse Management
- Logistics & Distribution

**Track 2: Finance, Sales & Administration** (guided conversation style)
- Financial Management
- Sales Management
- Users & Roles

The AI adjusts its conversation style per track:
- **Open-ended**: curious, exploratory - lets the user talk freely
- **Guided**: structured, offers common options - walks through a checklist

---

## Key URLs

| Page | URL | Who sees it |
|------|-----|-------------|
| Login | `/kea/login` | Everyone |
| Onboarding | `/kea/onboarding` | New users (first login) |
| Dashboard | `/kea/dashboard` | Admin sees client overview; Users see their progress |
| Chat Hub | `/kea/chat` | Everyone (pick a track, see sessions) |
| Chat Session | `/kea/chat/[sessionId]` | Everyone (active conversation + sidebar progress) |
| Clients | `/kea/dashboard/clients` | Admin only |
| Schemas | `/kea/dashboard/schemas` | Admin only |
| Export | `/kea/dashboard/export` | Admin only |

---

## Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | alex@blackwolfsec.io | BlackWolf88 |
| Knowledge Expert (Favorite) | expert@favorite.bg | Favorite88 |

---

## Languages

The entire app supports 3 languages, switchable from the header:
- English (EN)
- Bulgarian (BG)
- Spanish (ES)

The AI also responds in the user's selected language.
