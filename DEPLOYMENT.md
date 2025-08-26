# 🚀 TAMVEMS Deployment Guide

## Overview
This guide covers deploying the TAMVEMS (Vehicle Management System) built with Next.js, Prisma, and MySQL.

## Tech Stack
- **Frontend**: Next.js 15 with App Router
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Flowbite React + Tailwind CSS
- **Image Storage**: Cloudinary

---

## 🌟 **Option 1: Vercel + PlanetScale (Recommended)**

### **Why This Combo?**
- ✅ Seamless Next.js deployment
- ✅ Automatic deployments from Git
- ✅ Built-in domain management
- ✅ Serverless MySQL database
- ✅ Free tier available

### **Step 1: Prepare Your Database (PlanetScale)**

1. **Create PlanetScale Account**
   ```bash
   # Visit: https://planetscale.com
   # Sign up and create a new database
   ```

2. **Get Database Connection String**
   ```bash
   # In PlanetScale dashboard:
   # 1. Go to your database
   # 2. Click "Connect"
   # 3. Select "Prisma" 
   # 4. Copy the DATABASE_URL
   ```

3. **Update Prisma Schema for PlanetScale**
   ```prisma
   // prisma/schema.prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider     = "mysql"
     url          = env("DATABASE_URL")
     relationMode = "prisma"
   }
   ```

### **Step 2: Deploy to Vercel**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Your App**
   ```bash
   # In your project root
   vercel

   # Follow the prompts:
   # - Link to existing project? N
   # - Project name: tamvems
   # - Directory: ./
   ```

4. **Set Environment Variables**
   ```bash
   # In Vercel dashboard or CLI:
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   ```

5. **Deploy Database Schema**
   ```bash
   # After setting DATABASE_URL
   npx prisma db push
   ```

---

## 🐳 **Option 2: Railway (All-in-One)**

### **Why Railway?**
- ✅ Integrated database + app hosting
- ✅ Simple deployment process
- ✅ Built-in database management
- ✅ Automatic SSL certificates

### **Step 1: Setup Railway**

1. **Create Account**: Visit [railway.app](https://railway.app)

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Initialize project
   railway init
   ```

3. **Add MySQL Database**
   ```bash
   # In Railway dashboard:
   # 1. Click "New"
   # 2. Select "Database"
   # 3. Choose "MySQL"
   ```

### **Step 2: Configure Environment**

1. **Get Database URL from Railway**
   ```bash
   # In Railway dashboard:
   # Go to MySQL service → Connect → Copy DATABASE_URL
   ```

2. **Set Environment Variables**
   ```bash
   railway variables set NEXTAUTH_SECRET=your-secret-here
   railway variables set NEXTAUTH_URL=https://your-app.railway.app
   railway variables set CLOUDINARY_CLOUD_NAME=your-name
   # ... add other variables
   ```

### **Step 3: Deploy**

1. **Deploy Application**
   ```bash
   railway up
   ```

2. **Deploy Database Schema**
   ```bash
   railway run npx prisma db push
   ```

---

## 💻 **Option 3: DigitalOcean App Platform**

### **Step 1: Prepare Database**

1. **Create Managed MySQL Database**
   - Go to DigitalOcean dashboard
   - Create → Databases → MySQL
   - Note the connection details

### **Step 2: Deploy App**

1. **Connect GitHub Repository**
   - Go to App Platform
   - Create App from GitHub repo

2. **Configure Build Settings**
   ```yaml
   # .do/app.yaml
   name: tamvems
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/tamvems
       branch: main
     run_command: npm start
     build_command: npm run build && npx prisma generate
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: DATABASE_URL
       value: your-database-url
     - key: NEXTAUTH_SECRET
       value: your-secret
   ```

---

## 🛠️ **Pre-Deployment Setup Commands**

### **1. Create Environment File**
```bash
cp .env.example .env.local
# Fill in your actual values
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Generate Prisma Client**
```bash
npx prisma generate
```

### **4. Test Build Locally**
```bash
npm run build
npm start
```

### **5. Run Database Migrations**
```bash
# For development
npx prisma db push

# For production
npx prisma migrate deploy
```

---

## 📝 **Environment Variables Guide**

### **Required Variables:**
```bash
# Database Connection
DATABASE_URL="mysql://user:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="generate-a-secure-random-string"
NEXTAUTH_URL="https://your-domain.com"

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### **Generate NEXTAUTH_SECRET:**
```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🔧 **Build Configuration**

### **Update package.json scripts:**
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

---

## 🚀 **Quick Start Deployment (Recommended)**

### **Fastest Way - Vercel:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy with Vercel**
   ```bash
   # Visit vercel.com
   # Click "New Project"
   # Import from GitHub
   # Add environment variables
   # Deploy!
   ```

3. **Setup Database**
   ```bash
   # Create PlanetScale database
   # Copy connection string to Vercel env vars
   # Run: npx prisma db push
   ```

---

## 📊 **Post-Deployment Checklist**

- [ ] Database is connected and migrations are applied
- [ ] Environment variables are set correctly
- [ ] Authentication is working
- [ ] Image uploads are functional
- [ ] All pages load without errors
- [ ] Admin and user roles work correctly
- [ ] SSL certificate is active
- [ ] Domain is configured (if custom domain)

---

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Build Fails**
   ```bash
   # Check if all env vars are set
   # Ensure Prisma client is generated
   npx prisma generate
   ```

2. **Database Connection Error**
   ```bash
   # Verify DATABASE_URL format
   # Check if database is accessible
   # Ensure Prisma schema is pushed
   ```

3. **Authentication Issues**
   ```bash
   # Verify NEXTAUTH_SECRET is set
   # Check NEXTAUTH_URL matches your domain
   # Ensure auth routes are working
   ```

---

## 📞 **Support**

If you encounter issues:
1. Check the platform-specific documentation
2. Verify all environment variables
3. Test locally with production build
4. Check logs in your deployment platform

---

*Happy Deploying! 🎉*
