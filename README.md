<img width="1912" height="892" alt="image" src="https://github.com/user-attachments/assets/09bbac9c-8b44-4ab8-847a-2154e53d22da" />

# AquaLogix — Smart Supply Chain Analytics

AquaLogix is a web-based analytics platform designed to visualize and analyze supply chain operations in the fisheries industry.

The project focuses on transforming operational data such as shipments, inventory, vendors, fuel costs, and delivery performance into an interactive analytics dashboard.

It was built as a personal portfolio project to demonstrate practical skills in:

- Full-stack web development
- Data analytics and visualization
- Database design
- Authentication and RBAC
- API development
- AI-assisted insights
- Audit logging
- Security hardening
- Data export
- Production-oriented architecture

> **Project status:** Personal portfolio / demonstration project.
>
> AquaLogix is not currently connected to a real fisheries supply chain operation. The database is populated with generated/demo data designed to simulate realistic operational scenarios.

---

# Features

## Executive Dashboard

The main dashboard provides an overview of supply chain performance through:

- Shipment volume
- On-time delivery rate
- Inventory status
- Fuel cost monitoring
- Vendor performance
- AI-generated operational briefing
- Interactive analytics charts

The dashboard uses data from the application database rather than relying entirely on static frontend data.

---

# Authentication & Role-Based Access Control

AquaLogix implements authentication using JWT-based access and refresh tokens.

The system supports four roles:

```text
PARTNER
   ↓
ANALYST
   ↓
OPERATIONS_MANAGER
   ↓
ADMIN
