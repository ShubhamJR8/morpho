# 🚀 GitHub Repository Setup Guide

This guide will help you upload your Morpho project to GitHub and set up all the necessary configurations.

## 📋 Prerequisites

- Git installed on your machine
- GitHub account
- Your project ready for upload

## 🔧 Step-by-Step Setup

### 1. Initialize Git Repository (if not already done)

```bash
cd /Users/shubhamjunior/Documents/AI_Projects/morpho
git init
```

### 2. Add All Files to Git

```bash
git add .
git commit -m "feat: initial commit - AI Style Editor (Morpho) project setup"
```

### 3. Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the repository details:
   - **Repository name**: `morpho` (or `ai-style-editor`)
   - **Description**: `AI-powered image style editor with template gallery`
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

### 4. Connect Local Repository to GitHub

```bash
# Add the remote origin (replace 'yourusername' with your GitHub username)
git remote add origin https://github.com/yourusername/morpho.git

# Set the main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### 5. Configure GitHub Repository Settings

#### 5.1 Repository Settings
1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Configure the following:

**General:**
- Enable Issues
- Enable Projects
- Enable Wiki (optional)
- Enable Discussions (optional)

**Branches:**
- Set `main` as the default branch
- Add branch protection rules for `main` branch:
  - Require pull request reviews
  - Require status checks to pass
  - Require branches to be up to date

#### 5.2 Secrets Configuration (for CI/CD)

Go to Settings → Secrets and variables → Actions, and add these secrets:

**For Frontend Deployment (Vercel):**
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

**For Backend Deployment (AWS):**
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### 6. Set Up Branch Protection

1. Go to Settings → Branches
2. Click "Add rule"
3. Configure for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 or more)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### 7. Configure GitHub Pages (Optional)

If you want to host documentation:

1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `docs` folder
4. Save

### 8. Set Up Issue Templates

The issue templates are already created in `.github/ISSUE_TEMPLATE/`:
- `bug_report.md`
- `feature_request.md`

### 9. Configure Pull Request Template

The PR template is already created in `.github/pull_request_template.md`

## 🔄 Development Workflow

### Daily Development

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

### Syncing with Upstream

```bash
# Fetch latest changes
git fetch origin

# Merge or rebase
git rebase origin/main
# or
git merge origin/main
```

## 🚀 Deployment Setup

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your deployed API URL
3. Deploy automatically on push to main

### Backend (AWS Lambda)

1. Configure AWS CLI:
   ```bash
   aws configure
   ```
2. Deploy using GitHub Actions (automated) or manually:
   ```bash
   cd backend
   npm run deploy
   ```

## 📊 Repository Health

### Recommended GitHub Apps/Integrations

1. **Dependabot**: Automatically update dependencies
   - Go to Settings → Security → Dependabot alerts
   - Enable Dependabot security updates

2. **CodeQL**: Code analysis for security vulnerabilities
   - Already configured in `.github/workflows/`

3. **Stale**: Automatically close stale issues and PRs
   - Install from GitHub Marketplace

### Repository Insights

Monitor these metrics:
- **Insights → Pulse**: Overview of recent activity
- **Insights → Contributors**: Contribution statistics
- **Insights → Traffic**: Page views and clones
- **Insights → Community**: Repository health score

## 🎯 Next Steps

1. **Create your first issue** to test the templates
2. **Set up branch protection** rules
3. **Configure CI/CD** secrets
4. **Invite collaborators** if working in a team
5. **Set up project boards** for issue tracking
6. **Configure notifications** for important events

## 🔧 Troubleshooting

### Common Issues

**Push rejected:**
```bash
git pull origin main --rebase
git push origin main
```

**Large files:**
```bash
# Use Git LFS for large files
git lfs track "*.psd"
git lfs track "*.zip"
```

**Environment variables not working:**
- Check `.env` files are in `.gitignore`
- Verify environment variable names match exactly
- Restart development servers after changes

## 📞 Support

If you encounter any issues:

1. Check the [GitHub Documentation](https://docs.github.com/)
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Join our community discussions

---

🎉 **Congratulations!** Your Morpho project is now ready on GitHub with professional setup and CI/CD pipeline!
