#!/bin/bash
set -e

# Redirect stdout/stderr to syslog for debugging
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "=== Starting Hive Provisioning ==="

# 1. Update OS packages
apt-get update -y
apt-get install -y git curl nginx build-essential

# 2. Install Node.js LTS (v20.x)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Clone repository
echo "Cloning repository..."
rm -rf /opt/hive
git clone ${REPO_URL} /opt/hive
cd /opt/hive

# 4. Build and configure frontend (Vite React app)
echo "Building frontend..."
cd /opt/hive/console-app
npm install
npm run build

# Copy build to Nginx web root
mkdir -p /var/www/console-app
cp -r dist/* /var/www/console-app/

# Configure Nginx site configuration
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -subj '/CN=console.m3hfil.com'

# Write rate limit zone config to conf.d
cat <<EOF > /etc/nginx/conf.d/rate-limit.conf
limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
EOF

cat <<EOF > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    root /var/www/console-app;
    index index.html;

    server_name console.m3hfil.com;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'; frame-ancestors 'self';" always;

    # Hide Nginx version details
    server_tokens off;

    location / {
        # Restrict HTTP methods
        if (\$request_method !~ ^(GET|POST|PATCH|DELETE|OPTIONS)$) {
            return 405;
        }
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        # Apply Rate Limiting
        limit_req zone=api_limit burst=20 nodelay;

        # Restrict HTTP methods on API
        if (\$request_method !~ ^(GET|POST|PATCH|DELETE|OPTIONS)$) {
            return 405;
        }

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;

        # Real IP headers for backend logging & validation
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Restart Nginx
systemctl restart nginx
echo "Nginx configured."

# 5. Build and start Fastify API backend
echo "Building backend..."
cd /opt/hive/backend

# Generate the backend .env from Secret Manager. This uses the shared script
# (scripts/write-backend-env.sh) so boot-time and deploy-time env generation
# stay identical — one source of truth for secrets + config.
echo "Writing backend .env from Secret Manager..."
PROJECT_ID="${PROJECT_ID}" bash /opt/hive/scripts/write-backend-env.sh

npm install
npm run build

# Run Drizzle database migrations
echo "Running migrations..."
NODE_TLS_REJECT_UNAUTHORIZED=0 node dist/db/migrate.js

# Create systemd service for Hive Backend
cat <<EOF > /etc/systemd/system/hive-backend.service
[Unit]
Description=Hive Fastify Backend API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/hive/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
User=root
Environment=NODE_ENV=production
Environment=NODE_TLS_REJECT_UNAUTHORIZED=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the backend service
systemctl daemon-reload
systemctl enable hive-backend
systemctl start hive-backend

# 6. Create Supabase keep-alive cron job
echo "Configuring Supabase keep-alive..."
cat <<'EOF' > /opt/hive/backend/keep_alive.js
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Client } = pg;

async function ping() {
  console.log(`[$${new Date().toISOString()}] Pinging database to keep it active...`);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT 1 as ping;');
    console.log(`[$${new Date().toISOString()}] Database ping successful:`, res.rows);
  } catch (err) {
    console.error(`[$${new Date().toISOString()}] Database ping failed:`, err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

ping();
EOF

cat <<EOF > /etc/cron.d/supabase-keep-alive
# Run daily at 03:00 AM UTC to prevent Supabase auto-pausing
0 3 * * * root NODE_TLS_REJECT_UNAUTHORIZED=0 /usr/bin/node /opt/hive/backend/keep_alive.js >> /var/log/supabase-keep-alive.log 2>&1
EOF

echo "=== Hive Provisioning Completed Successfully! ==="
