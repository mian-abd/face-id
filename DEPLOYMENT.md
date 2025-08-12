# 🚀 Face Academy - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Node.js 16+ installed
- [ ] Python 3.8+ with TensorFlow 2.x
- [ ] Git configured
- [ ] GitHub account ready
- [ ] Supabase project created

### ✅ Dependencies Check
```bash
# Install all dependencies
npm install

# Check for vulnerabilities
npm audit fix

# Verify TensorFlow.js compatibility
npm ls @tensorflow/tfjs
```

### ✅ Model Preparation
- [ ] Convert your `siamese_model.h5` to TensorFlow.js format
- [ ] Verify L1Dist layer compatibility
- [ ] Test model loading in browser environment

## 🏗️ Build Process

### 1. Development Build
```bash
# Start development server
npm start

# Run tests
npm test

# Lint and format code
npm run lint
npm run format
```

### 2. Production Build
```bash
# Create optimized production build
npm run build

# Analyze bundle size
npm run analyze

# Test production build locally
npx serve -s build -l 3000
```

## 🌐 Deployment Options

### Option 1: GitHub Pages (Recommended for Demo)

#### Setup Steps:
1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "🚀 Ready for deployment"
   git push origin main
   ```

2. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Custom Domain (Optional)**
   - Add `CNAME` file to `public/` folder
   - Configure DNS records
   - Enable HTTPS in GitHub Pages settings

#### GitHub Pages Configuration:
```json
// package.json
{
  "homepage": "https://mian-abd.github.io/face-id",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### Option 2: Vercel (Best Performance)

#### Setup Steps:
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   ```bash
   vercel env add REACT_APP_SUPABASE_URL
   vercel env add REACT_APP_SUPABASE_ANON_KEY
   ```

#### Vercel Configuration:
```json
// vercel.json
{
  "framework": "create-react-app",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "functions": {
    "app/**/*": {
      "runtime": "@vercel/node"
    }
  },
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": { "cache-control": "s-maxage=31536000,immutable" },
      "dest": "/static/$1"
    },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Option 3: Netlify (Great Features)

#### Setup Steps:
1. **Connect Repository**
   - Go to Netlify dashboard
   - Add new site from Git
   - Connect GitHub repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: build
   ```

3. **Environment Variables**
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   ```

#### Netlify Configuration:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  CI = "false"

[[headers]]
  for = "/static/*"
  [headers.values]
    cache-control = "max-age=31536000,immutable"
```

## 🗄️ Database Setup (Supabase)

### 1. Create Tables
Run the SQL from `supabase-setup.sql` in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  model_status TEXT DEFAULT 'not_trained',
  model_trained_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Training images table
CREATE TABLE training_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL,
  image_type TEXT DEFAULT 'positive',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Configure Row Level Security
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_images ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust for production security)
CREATE POLICY "Allow public access" ON users FOR ALL USING (true);
CREATE POLICY "Allow public access" ON training_images FOR ALL USING (true);
```

### 3. Get API Keys
- Go to Settings → API
- Copy your project URL and anon key
- Update `src/supabaseClient.js`

## 🔧 Environment Configuration

### Development (.env.local)
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=false
```

### Production
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
CI=false
```

## 📱 PWA Configuration

### 1. Service Worker Registration
Ensure `public/sw.js` is properly configured and registered in your app.

### 2. Manifest Validation
```bash
# Test PWA compliance
npm install -g lighthouse
lighthouse https://your-domain.com --view
```

### 3. HTTPS Requirement
PWA features require HTTPS. All recommended platforms provide this automatically.

## 🔒 Security Considerations

### 1. API Key Security
- **Never** commit private keys to Git
- Use environment variables for all secrets
- Rotate keys regularly

### 2. Content Security Policy
```html
<!-- Add to public/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' *.supabase.co;
  media-src 'self' blob:;
">
```

### 3. Input Validation
- Sanitize all user inputs
- Validate image file types and sizes
- Implement rate limiting

## 📊 Performance Optimization

### 1. Bundle Analysis
```bash
npm run analyze
# Optimize largest chunks
# Consider code splitting for components
```

### 2. Image Optimization
- Compress training images before storage
- Use WebP format when supported
- Implement lazy loading

### 3. Caching Strategy
- Static assets: Long-term caching
- API responses: Short-term caching
- User data: Session storage

## 🔍 Monitoring & Analytics

### 1. Error Tracking
Consider integrating:
- Sentry for error monitoring
- LogRocket for session replay
- Google Analytics for usage tracking

### 2. Performance Monitoring
```javascript
// Add to src/index.js
if (process.env.NODE_ENV === 'production') {
  // Initialize monitoring services
}
```

## 🧪 Testing Strategy

### 1. Unit Tests
```bash
npm test -- --coverage
```

### 2. E2E Tests
```bash
# Install Cypress
npm install --save-dev cypress

# Run tests
npx cypress open
```

### 3. Performance Tests
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TensorFlow.js Errors**
   - Ensure model format compatibility
   - Check browser WebGL support
   - Verify CORS headers for model files

3. **Supabase Connection**
   - Verify API keys and URL
   - Check network connectivity
   - Review browser console for errors

4. **PWA Not Installing**
   - Ensure HTTPS is enabled
   - Check manifest.json validity
   - Verify service worker registration

## 📚 Deployment Checklist

### Pre-Deploy:
- [ ] All tests passing
- [ ] No console errors
- [ ] Responsive design tested
- [ ] Accessibility verified
- [ ] Performance optimized
- [ ] Environment variables set

### Post-Deploy:
- [ ] Domain accessible
- [ ] HTTPS working
- [ ] PWA installable
- [ ] Database connected
- [ ] Error monitoring active
- [ ] Analytics configured

## 🎯 Next Steps

After successful deployment:

1. **Domain & Branding**
   - Configure custom domain
   - Add proper favicons
   - Update social media meta tags

2. **SEO Optimization**
   - Submit to search engines
   - Add structured data
   - Optimize meta descriptions

3. **User Feedback**
   - Add feedback forms
   - Monitor user behavior
   - Iterate based on usage

4. **Scaling Considerations**
   - CDN for global distribution
   - Database optimization
   - Load balancing if needed

---

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review browser console for errors
3. Open an issue on GitHub
4. Contact: [your-email@example.com]

**Happy Deploying!** 🚀✨
