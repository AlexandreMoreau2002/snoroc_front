# 🚀 CI/CD Deployment with GitHub Pages

## GitHub Pages Configuration

### 1. Enable GitHub Pages
1. Go to your GitHub repository **Settings**
2. Navigate to **Pages** section (left menu)
3. Under **Source**, select **GitHub Actions**
4. Save the changes

### 2. Branch Configuration
The workflow triggers on:
- `develop` (development environment)

### 3. Environment Variables (optional)
If you need environment variables:
1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Add your variables in **Variables** (for public values)
3. Add your secrets in **Secrets** (for sensitive values)

## 🔄 CI/CD Workflow

### Triggers
- **Push** to `develop`
- **Pull Request** to `develop`

### Workflow Steps
1. **Checkout** code
2. **Setup Node.js** (version 18)
3. **Install** dependencies (`npm ci`)
4. **Build** the application
5. **Deploy** to GitHub Pages (only on develop)

### Deployment URL
- **Development** (develop): `https://[username].github.io/[repo-name]/`

## 🛠️ Available Scripts

```bash
# Local development
npm start

# Production build
npm run build
```

## 📁 Added Files Structure

```
.github/
└── workflows/
    └── deploy.yml          # CI/CD Workflow

public/
├── 404.html               # SPA routing handling
└── index.html             # Redirection script added
```

## 🔧 SPA Routing on GitHub Pages

The `404.html` file and the script in `index.html` allow React routing to work correctly on GitHub Pages by:
1. Intercepting 404s (routes not found)
2. Redirecting to `index.html` with route parameters
3. Reconstructing the correct URL on the client side

## 🚨 First Time Setup

1. **Commit and push** these files to your `develop` branch
2. The workflow will start automatically
3. Check the **Actions** tab on GitHub to ensure everything works
4. Once completed, your site will be available at the GitHub Pages URL

## 📊 Monitoring

- **Actions**: Build and deployment tracking
- **Environments**: Deployment history in Settings > Environments
- **Pages**: Status and URL in Settings > Pages

## 🔍 Troubleshooting

### Build Fails
- Check the logs in the Actions tab
- Make sure `npm run build` works locally

### Site Doesn't Load
- Verify that GitHub Pages is enabled
- Wait a few minutes after deployment
- Check the URL in Settings > Pages

### Routing Doesn't Work
- The `404.html` file and script in `index.html` are required
- Make sure you're using React Router correctly
