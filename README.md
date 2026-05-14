# Splitsy - Expense Splitting & Debt Management Platform

A full-stack TypeScript application for managing shared expenses among groups, tracking debts, and settling payments in real-time. Built with modern web technologies and real-time WebSocket communication.

---

## 🎯 Overview

Splitsy is an expense management platform that simplifies how groups split costs and track debts. Whether you're splitting rent with roommates, managing group trips, or tracking shared expenses, Splitsy provides an intuitive interface with real-time updates and intelligent debt calculation.

### Key Capabilities
- **User Authentication**: Secure JWT-based authentication with password hashing
- **Group Management**: Create groups, invite members, and manage group settings
- **Flexible Expense Splitting**: Support for equal, custom amount, and percentage-based splits
- **Smart Debt Calculation**: Automated balance computation with debt simplification algorithm
- **Settlement Tracking**: Record and track payments between group members
- **Real-Time Updates**: WebSocket-powered live notifications for all group activities
- **Debt Visualization**: Interactive graph showing money flow between members
- **Activity Timeline**: Unified feed of all expenses and settlements

---

## ✨ Features

### Authentication & Users
- User registration with email-based accounts
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Session management

### Groups & Members
- Create unlimited groups
- Add/remove members from groups
- Track who's in each group
- Manage group details and descriptions

### Expense Management
- Create expenses with multiple split options:
  - **Equal Split**: Distribute amount equally among members
  - **Custom Split**: Specify exact amount for each member
  - **Percentage Split**: Distribute by percentage
- Record who paid the expense
- Attach descriptions and details
- Delete expenses with automatic balance recalculation
- Filter and sort expenses by date and participant

### Balance & Settlement
- Automatic balance calculation per group
- View who owes whom and how much
- Debt graph visualization showing payment flows
- Record settlement payments between members
- Settlement history tracking

### Real-Time Features
- Socket.io integration for live updates
- Instant notifications when:
  - New expenses are added
  - Payments are recorded
  - Members join groups
- Room-based isolation (only group members see relevant updates)
- Toast notifications for user feedback

### User Interface
- Responsive React-based frontend
- Tailwind CSS for modern styling
- Interactive tabs (Expenses, Balances, Activity)
- Modal-based forms for adding data
- Real-time debt graph with vis-network library

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5.2
- **Database**: PostgreSQL with Prisma ORM v7.8
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Real-Time**: Socket.io v4.8
- **CORS**: Enabled for cross-origin requests

**Frontend:**
- **Library**: React 19
- **Language**: TypeScript
- **Routing**: React Router v7
- **State Management**: Zustand
- **Forms**: React Hook Form
- **HTTP Client**: Axios with interceptors
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Real-Time**: Socket.io-client
- **Visualization**: vis-network (graph library)
- **Icons**: Lucide React
- **Date Utils**: date-fns

---

## 📁 Project Structure

```
splitsy/
├── backend/
│   ├── src/
│   │   ├── server.ts                 # Express server & Socket.io setup
│   │   ├── testDb.ts                 # Database connection test
│   │   ├── config/
│   │   │   └── constants.ts          # Shared constants (JWT_SECRET, etc.)
│   │   ├── controllers/
│   │   │   ├── authController.ts     # Authentication logic
│   │   │   ├── groupController.ts    # Group CRUD & member management
│   │   │   ├── expenseController.ts  # Expense creation & retrieval
│   │   │   └── balanceController.ts  # Balance calculation & settlement
│   │   ├── routes/
│   │   │   ├── authRoutes.ts         # /api/auth endpoints
│   │   │   ├── groupRoutes.ts        # /api/groups endpoints
│   │   │   └── expenseroutes.ts      # /api/expenses endpoints
│   │   ├── middleware/
│   │   │   └── auth.ts               # JWT verification middleware
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript type definitions
│   │   └── utils/
│   │       ├── auth.ts               # Auth helper functions
│   │       ├── balanceCalculation.ts # Debt calculation algorithm
│   │       ├── expenseValidation.ts  # Validation utilities
│   │       ├── validation.ts         # General validation
│   │       └── socketEmitter.ts      # Socket event broadcasting
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema (6 models)
│   │   └── migrations/               # Database migration history
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   # Main app component with routing
│   │   ├── main.tsx                  # React entry point
│   │   ├── App.css & index.css       # Global styles
│   │   ├── components/
│   │   │   ├── ActivityTimeline.tsx  # Activity feed
│   │   │   ├── AddExpenseModal.tsx   # Expense creation form
│   │   │   ├── AddMemberModal.tsx    # Member invitation
│   │   │   ├── BalanceView.tsx       # Balance details display
│   │   │   ├── DebtGraph.tsx         # Interactive debt visualization
│   │   │   ├── ExpensesList.tsx      # Expenses table/list
│   │   │   ├── ExpensesFilters.tsx   # Filter controls
│   │   │   ├── MembersList.tsx       # Group members display
│   │   │   ├── NotificationCenter.tsx # Toast notifications
│   │   │   ├── DeleteExpenseModal.tsx # Delete confirmation
│   │   │   ├── DeleteGroupModal.tsx  # Group deletion
│   │   │   ├── RecordSettlementModal.tsx # Payment recording
│   │   │   ├── RemoveMemberModal.tsx # Member removal
│   │   │   └── ui/
│   │   │       ├── button.tsx        # Button component
│   │   │       ├── card.tsx          # Card component
│   │   │       ├── input.tsx         # Input component
│   │   │       └── tabs.tsx          # Tabs component
│   │   ├── context/
│   │   │   └── authcontext.tsx       # Auth state & context provider
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx         # Login form
│   │   │   ├── RegisterPage.tsx      # Registration form
│   │   │   ├── DashboardPage.tsx     # Groups overview
│   │   │   ├── CreateGroupPage.tsx   # Group creation
│   │   │   └── GroupDetailPage.tsx   # Group detail with tabs
│   │   ├── services/
│   │   │   ├── api.ts                # Axios instance setup
│   │   │   ├── apiService.ts         # API wrapper methods
│   │   │   └── socket.ts             # Socket.io client setup
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript types
│   │   └── utils/
│   │       └── notifications.ts      # Toast notification system
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
└── README.md (this file)
```

---

## 🗄️ Database Schema

The application uses 6 interconnected Prisma models:

```
User (many-to-many → Group via GroupMember)
├── id: UUID
├── name: String
├── email: String (unique)
├── password_hash: String
└── Relations: group_memberships, expenses_paid, expense_splits, settlements

Group
├── id: UUID
├── name: String
├── description: String (optional)
└── Relations: members, expenses, settlements

GroupMember (junction table)
├── id: UUID
├── user_id: String (FK)
├── group_id: String (FK)
└── Constraint: unique(user_id, group_id)

Expense
├── id: UUID
├── group_id: String (FK)
├── paid_by: String (FK → User)
├── amount: Decimal(10,2)
├── description: String
└── Relations: group, payer, splits

ExpenseSplit
├── id: UUID
├── expense_id: String (FK)
├── user_id: String (FK)
└── amount: Decimal(10,2) [Amount owed by this user]

Settlement
├── id: UUID
├── group_id: String (FK)
├── from_user: String (FK → User)
├── to_user: String (FK → User)
├── amount: Decimal(10,2)
└── settled_at: DateTime
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 13+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd splitsy
```

2. **Backend Setup**
```bash
cd backend

# Install dependencies
npm install

# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/splitsy"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=5000
CLIENT_URL="http://localhost:5173"

# Start development server
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Create .env file (if needed)
VITE_API_URL="http://localhost:5000"

# Start development server
npm run dev
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login user |
| GET | `/me` | Get current user (requires auth) |

### Groups (`/api/groups`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create group |
| GET | `/` | List all user's groups |
| GET | `/:groupId` | Get group details |
| POST | `/:groupId/members` | Add member to group |
| DELETE | `/:groupId/members/:memberId` | Remove member |
| DELETE | `/:groupId` | Delete group |

### Expenses (`/api/expenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create expense |
| GET | `/:groupId` | List expenses for group |
| DELETE | `/:id` | Delete expense |
| GET | `/:groupId/balances` | Get balance sheet for group |

### Settlements (`/api/settlements`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Record settlement payment |
| GET | `/:groupId` | List settlements for group |

---


## 📚 Future Enhancements

Potential features for future versions:
- [ ] Recurring expenses (monthly bills, etc.)
- [ ] Expense editing/modification
- [ ] Payment method integrations (Stripe, PayPal)
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Export expenses as CSV/PDF
- [ ] Multi-currency support
- [ ] Budget tracking and alerts
- [ ] Automated settlement suggestions
- [ ] User profile customization

---