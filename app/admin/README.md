# Agentica Admin Dashboard

The **Agentica Admin Dashboard** is a standalone web application used to manage and monitor every aspect of the Agentica platform. It provides administrators with tools to manage products, inventory, orders, customers, AI services, and the Model Context Protocol (MCP) infrastructure.

Unlike the customer-facing website, this application is intended **only for authorized administrators**.

---

# 🎯 Objectives

The Admin Dashboard enables administrators to:

- Manage products
- Manage categories
- Manage inventory
- Manage orders
- Manage customer accounts
- Moderate product reviews
- Monitor AI activity
- Configure MCP tools
- View business analytics
- Manage system settings
- Monitor platform health

---

# 👥 Administrator Roles

## 👑 Super Admin

The Super Admin has complete access to the platform.

### Permissions

- Create, edit, suspend, and delete administrator accounts
- Assign administrator roles and permissions
- Configure AI settings
- Configure MCP tools
- Manage API keys
- Configure authentication
- Access system settings
- View audit logs
- Perform system maintenance
- Full access to every module

---

## 🛡 Admin

Administrators manage the day-to-day operation of the platform.

### Permissions

- Manage products
- Manage categories
- Manage inventory
- Manage customer accounts
- Manage orders
- Moderate reviews
- View analytics
- Monitor AI requests
- View MCP status
- Cannot modify Super Admin accounts
- Cannot access sensitive system configuration

---

# 🖥 Pages

## 1. Authentication

### Login

Features

- Email
- Password
- Remember Me
- Forgot Password
- Login Button

---

## 2. Dashboard

### Statistics

- Total Revenue
- Total Orders
- Total Products
- Total Customers
- Active Administrators
- Pending Orders
- Low Stock Products
- AI Requests Today

### Charts

- Revenue Overview
- Monthly Sales
- Orders by Status
- Product Categories
- AI Usage
- MCP Tool Usage

### Recent Activity

- Latest Orders
- Inventory Updates
- Administrator Activity
- AI Activity
- MCP Activity

---

# 📦 Catalog

## Products

Table

- Product Image
- Product Name
- SKU
- Category
- Price
- Stock
- Status
- Actions

Actions

- View
- Edit
- Delete

Features

- Search Products
- Filter Products
- Export Products
- Import Products
- Bulk Actions

---

## Add Product

Fields

- Product Name
- Description
- Brand
- SKU
- Barcode
- Category
- Price
- Discount
- Stock Quantity
- Images
- Specifications
- Product Status

Buttons

- Save Draft
- Publish

---

## Categories

Features

- Create Category
- Edit Category
- Delete Category
- Parent Categories
- Category Image

---

## Inventory

Table

- Product
- Current Stock
- Reserved Stock
- Available Stock
- Warehouse
- Last Updated

Actions

- Increase Stock
- Decrease Stock
- Stock History

---

# 🛒 Sales

## Orders

Table

- Order ID
- Customer
- Date
- Total
- Payment Status
- Order Status

Actions

- View
- Update Status
- Refund
- Cancel Order

Order Status

- Pending
- Confirmed
- Processing
- Shipped
- Delivered
- Cancelled

---

## Reviews

Features

- View Reviews
- Approve Review
- Reject Review
- Delete Review
- Reported Reviews

---

# 👥 User Management

## Customers

Table

- Avatar
- Full Name
- Email
- Phone
- Orders
- Registration Date
- Status

Actions

- View Profile
- Suspend Account
- Reset Password
- Delete Account

---

## Administrators

> **Visible only to Super Admin**

Table

- Avatar
- Name
- Email
- Role
- Status
- Last Login
- Created At

Actions

- Create Administrator
- Edit Administrator
- Suspend Administrator
- Reset Password
- Delete Administrator
- Assign Permissions

---

# 🤖 AI Management

Monitor and configure AI services.

Dashboard

- Total AI Requests
- Successful Responses
- Failed Requests
- Average Response Time
- Token Usage
- Estimated Cost

Charts

- Daily Requests
- Token Usage
- Model Usage
- Response Time

Logs

- User Prompt
- AI Response
- Tool Calls
- Execution Time
- Errors

Configuration

- LLM Provider
- Temperature
- Max Tokens
- Prompt Templates

---

# 🔌 MCP Management

Manage every MCP tool available to AI agents.

Tool Table

- Tool Name
- Description
- Status
- Permissions
- Last Used

Actions

- Enable Tool
- Disable Tool
- Edit Tool
- View Logs

Example MCP Tools

- search_products
- get_product_details
- compare_products
- add_to_cart
- remove_from_cart
- create_order
- track_order
- recommend_products

---

# 📊 Analytics

Business Analytics

- Revenue
- Sales
- Customer Growth
- Best Selling Products
- Product Performance
- Order Statistics

AI Analytics

- Tool Usage
- AI Conversations
- Model Performance
- Cost Analysis

---

# 📜 Audit Logs

Every administrative action should be recorded.

Examples

- Administrator Login
- Product Updated
- Product Deleted
- Order Updated
- User Suspended
- MCP Tool Executed
- AI Configuration Changed
- Settings Updated

Filters

- Date
- Administrator
- Module
- Severity

---

# ⚙ Settings

## General

- Platform Name
- Logo
- Currency
- Timezone
- Language

---

## Authentication

- JWT Configuration
- Session Timeout
- Password Policy
- Two-Factor Authentication

---

## AI Settings

- Default LLM
- Temperature
- Max Tokens
- Prompt Templates
- Rate Limits

---

## MCP Settings

- Enable MCP
- Tool Permissions
- Tool Configuration
- Rate Limiting

---

## Integrations

- OpenAI
- Gemini
- Email Service
- Payment Gateway
- Cloud Storage

---

## Security

- API Keys
- Access Control
- Allowed Origins
- Environment Variables

---

## Maintenance

- Backup
- Restore
- Cache Management
- Maintenance Mode

---

# 🎨 Layout

```text
+--------------------------------------------------------------------+
|                         Top Navigation                             |
|--------------------------------------------------------------------|
| Sidebar              |                                             |
|                      | Dashboard                                   |
| Dashboard            |---------------------------------------------|
|                      |                                             |
| Catalog              | Statistics Cards                            |
| ├── Products         | Revenue                                     |
| ├── Categories       | Orders                                      |
| ├── Inventory        | Customers                                   |
|                      | AI Requests                                 |
| Sales                |                                             |
| ├── Orders           |---------------------------------------------|
| ├── Reviews          | Charts                                      |
|                      |                                             |
| User Management      |---------------------------------------------|
| ├── Customers        | Recent Activity                             |
| ├── Administrators   |                                             |
|                      |                                             |
| AI                   |                                             |
| ├── AI Management    |                                             |
| ├── MCP Management   |                                             |
|                      |                                             |
| Monitoring           |                                             |
| ├── Analytics        |                                             |
| ├── Audit Logs       |                                             |
|                      |                                             |
| Settings             |                                             |
+--------------------------------------------------------------------+
```

---

# 🎨 Design Guidelines

Style

- Modern
- Clean
- Enterprise
- Minimal

Primary Color

- Blue

Secondary

- Slate

Success

- Green

Warning

- Orange

Danger

- Red

Typography

- Inter

Icons

- Lucide React

---

# 📱 Responsive Design

Desktop

- Full Sidebar

Tablet

- Collapsible Sidebar

Mobile

- Drawer Navigation

---

# 🚀 Future Features

- Coupons & Discounts
- Shipping Providers
- Warehouse Management
- Multi-Vendor Support
- AI Conversation History
- AI Recommendation Performance
- Sales Forecasting
- Fraud Detection
- Role-Based Access Control (RBAC)
- Real-Time Notifications

---

# 🛠 Development Order

1. Authentication
2. Dashboard
3. Products
4. Categories
5. Inventory
6. Orders
7. Customers
8. Administrators
9. Reviews
10. AI Management
11. MCP Management
12. Analytics
13. Audit Logs
14. Settings
