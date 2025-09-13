# Contributing to AI Style Editor (Morpho)

Thank you for your interest in contributing to Morpho! We welcome contributions from the community and are grateful for your help in making this project better.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/morpho.git
   cd morpho
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/originalowner/morpho.git
   ```
4. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠 Development Setup

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   ```bash
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env
   # Edit the .env files with your actual values
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

## 📝 Making Changes

### Code Style

- **TypeScript**: We use TypeScript for type safety
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code formatting is handled by Prettier
- **Naming**: Use descriptive names for variables, functions, and components

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(frontend): add image upload progress indicator
fix(backend): resolve memory leak in image processing
docs: update API documentation
```

### Pull Request Process

1. **Ensure your branch is up to date**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and linting**:
   ```bash
   npm run build
   npm run lint
   ```

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub with:
   - A clear title and description
   - Reference to any related issues
   - Screenshots (if applicable)
   - Testing instructions

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run lint
npm run build
```

### Backend Testing
```bash
cd backend
npm test
npm run build
```

### Manual Testing
- Test your changes in different browsers
- Test responsive design on different screen sizes
- Verify accessibility features

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment details**:
   - OS and version
   - Browser and version
   - Node.js version

2. **Steps to reproduce**:
   - Clear, numbered steps
   - Expected vs actual behavior

3. **Additional context**:
   - Screenshots or videos
   - Console errors
   - Network requests (if relevant)

## ✨ Feature Requests

When suggesting features:

1. **Check existing issues** to avoid duplicates
2. **Provide clear use cases** and benefits
3. **Consider implementation complexity**
4. **Think about backward compatibility**

## 📚 Code Documentation

- **Comments**: Add comments for complex logic
- **JSDoc**: Document functions and components
- **README**: Update documentation for new features
- **API Docs**: Update API documentation for backend changes

## 🏗 Project Structure

```
morpho/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── handlers/     # Lambda function handlers
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
└── shared/            # Shared types and utilities
```

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

- **UI/UX Improvements**: Better user experience and design
- **Performance**: Optimizing image processing and loading
- **Testing**: Adding unit and integration tests
- **Documentation**: Improving guides and API docs
- **Accessibility**: Making the app more accessible
- **Mobile**: Improving mobile experience
- **Internationalization**: Adding multi-language support

## 🤝 Community Guidelines

- **Be respectful** and inclusive
- **Help others** learn and grow
- **Provide constructive feedback**
- **Follow the code of conduct**

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Discord**: For real-time chat and support

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Morpho! 🎨✨
