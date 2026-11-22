# Supabase Security Hardening Guide

This document outlines the security hardening recommendations and step-by-step configurations for the Supabase managed PostgreSQL instance used by Hive.

---

## 1. SSL/TLS Connection Enforcement
Enforcing SSL ensures that all traffic between the Fastify API backend (running on GCP) and the Supabase database instance is encrypted in transit and protected against man-in-the-middle (MITM) attacks.

### Configuration Steps:
1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Click on the **Project Settings** (gear icon) in the bottom-left sidebar.
4. Click on **Database** under the Settings menu.
5. Scroll down to the **SSL Configuration** / **Enforce SSL** section.
6. Toggle **Enforce SSL** to **Enabled**.
   - *Note: Our Fastify backend connection string is already configured with `sslmode=require`, ensuring compatibility with this setting.*

---

## 2. Network Restrictions (IP Allowlisting)
Restricting access to the database ensures that only authorized clients (such as your GCP production VM) can connect to the PostgreSQL port (5432).

### Configuration Steps:
1. In the **Project Settings** sidebar, click on **API** or **Network** (available on Pro/Enterprise plans).
2. Scroll to **Network Restrictions** (IP Allowlist).
3. Enable restrictions and add the following IP address rules:
   - **GCP VM Production IP**: `<production-vm-ip>/32` (Allows your production API backend to connect).
   - **Your Local Development IP**: Add your local public IP address (allows migrations and local tests to run).
4. Save the configuration.

---

## 3. Database Secrets Management
To prevent accidental exposure of your database credentials:
- **Never commit credentials**: Ensure that the database password and full connection string (`postgresql://postgres:...`) are stored solely in the `/opt/hive/backend/.env` file on the VM.
- **Git Ignore**: Check that the `.env` file is listed in `.gitignore` at the project roots so it is never pushed to GitHub.
- **Supabase JWT Secret**: Ensure the JWT secret in Supabase matches the `JWT_SECRET` used by the Fastify backend for verifying client-side tokens.

---

## 4. Row Level Security (RLS)
By default, all tables created in Supabase should have Row Level Security enabled to protect the data if public API keys or client-side connections are configured.

### Configuration Steps:
For every table in your database schema, ensure RLS is enabled:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```
For tables that are only accessed by the service role (from the backend server using the direct connection string), write bypass rules or restrict all access to the public API.
