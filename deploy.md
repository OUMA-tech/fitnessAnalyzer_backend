# 🚀 Fit Tracker – Backend Deployment Log

## 📦 Project Overview

- **Project Name**: Fit Tracker  
- **Type**: Full-stack fitness tracking app  
- **Backend Framework**: Node.js + Express  
- **Database**: MongoDB  
- **Infrastructure**: AWS Elastic Beanstalk, Cloudflare, Docker, Redis  
- **CI/CD**: GitHub Actions  
- **Frontend Deployment**: [Describe if applicable]

---

## 🎯 Deployment Objective

Migrate the backend from **Render** to **AWS Elastic Beanstalk**, allowing:

- Full control over the deployment pipeline  
- Custom Nginx + SSL configuration  
- Docker-managed Redis service  
- Better observability and performance tuning

---

## 🧰 Deployment Steps

### 1. Elastic Beanstalk Setup

- Created a new EB environment using the **Amazon Linux 2023 + Node.js** platform
- Used EB CLI for environment management
- Created `.platform/nginx/conf.d/ssl_site.conf` to handle HTTPS and reverse proxy

### 2. Docker + Redis Configuration

- Added a `.ebextensions/redis.config` file:
  ```yaml
  container_commands:
    01_run_redis_if_not_running:
      command: |
        if ! docker ps -q -f name=redis > /dev/null; then
          if docker ps -a -q -f name=redis > /dev/null; then
            echo "Redis container exists but is not running. Starting it..."
            docker start redis
          else
            echo "Redis container not found. Creating and starting..."
            docker run -d --name redis -p 6379:6379 redis:latest
          fi
        else
          echo "Redis container is already running."
        fi


## 3. SSL Setup

### 🔐 Configured SSL with Cloudflare & Nginx

- DNS proxied through Cloudflare
- SSL Certificate provided by Cloudflare (Full Strict mode)
- Nginx listens on `443` and proxies to Node.js backend
- Nginx config file `.platform/nginx/conf.d/ssl_site.conf` example:

```nginx
server {
  listen 443 ssl;
  server_name api.fit-tracker.fyi;

  ssl_certificate     /etc/pki/tls/certs/server.crt;
  ssl_certificate_key /etc/pki/tls/private/server.key;

  location / {
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## 4. GitHub Actions CI/CD Workflow

- Workflow file: `.github/workflows/deploy.yml`
- Trigger: Push to `main` branch
- Key steps:
  - Checkout code
  - Set up Node.js
  - Install dependencies (`npm ci`)
  - Compile with TypeScript (`npm run build`)
  - Zip deployment bundle manually:
    - `dist/`
    - `package.json`, `package-lock.json`
    - `.platform/`, `.ebextensions/`
  - Deploy to Elastic Beanstalk using:
    - `aws-actions/configure-aws-credentials`
    - `einaregilsson/beanstalk-deploy`

- Example zip command:

```bash
zip -r app.zip dist package.json package-lock.json .platform .ebextensions
```

## 5. ✅ Validation Checklist

- [x] App successfully deployed to Elastic Beanstalk
- [x] HTTPS (443) is correctly served via Nginx
- [x] Backend respects `process.env.PORT` (default 8080)
- [x] Redis container starts if not already running
- [x] Cloudflare SSL set to Full (Strict) and routing correctly
- [x] Postman returns 200 responses from API endpoints
- [x] Nginx properly proxies HTTPS traffic to backend
- [x] Environment variables like `TOKEN_SECRET_KEY` are loaded
- [x] GitHub Actions job completes end-to-end
- [x] Redis exposed on port 6379 and accessible internally

---

## 6. 📝 Notes and Lessons Learned

- Elastic Beanstalk automatically sets `PORT=8080`; hardcoding another port (e.g. 5000) will break routing unless manually adjusted.
- If Redis container is not found:
  - Check `.ebextensions` or `container_commands` syntax
  - Check EB logs: `/var/log/eb-engine.log`, `/var/log/nginx/error.log`, etc.
- `.platform` and `.ebextensions` directories must be included in the deployment `.zip` file.
- Redis will only auto-start if the `docker run` command is correctly written and the container is not already running.
- For SSL issues:
  - Ensure Nginx listens on port 443
  - Use Cloudflare “Full (Strict)” mode and match certificate
  - Check `ssl_site.conf` is correctly formatted and deployed
- If GitHub Actions run is cancelled mid-deploy:
  - Elastic Beanstalk may enter an inconsistent state
  - Trigger a clean deployment with a dummy commit
- Use `curl -v https://your-domain` to diagnose 502/521 errors
- Always verify reverse proxy routes: 443 → Nginx → 8080

---
