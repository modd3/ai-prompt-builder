# AI Prompt Builder - Architecture Findings & Suggestions

## Executive Summary

The AI Prompt Builder is a Reddit-style platform for prompt engineers and AI enthusiasts. It enables users to create, test, share, and iterate on prompts while comparing responses across multiple AI models. The application is built with a React frontend and Express.js backend, using MongoDB for data persistence.

---

## 1. System Architecture Overview

### Technology Stack

| Layer | Technology | Version/Notes |
|-------|-----------|---------------|
| Frontend | React | 19.x with functional components |
| Styling | Tailwind CSS | With custom design system |
| State Management | React Context | AuthContext for authentication |
| Backend | Express.js | REST API on port 5000 |
| Database | MongoDB | With Mongoose ODM |
| Authentication | JWT | bcryptjs for password hashing |
| AI Integration | Multi-provider | Groq, HuggingFace, Gemini, Mistral |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  React 19 + Tailwind CSS (Port 3000)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  App.js → AuthProvider → HomePage                   │   │
│  │  Sections: home | create | test | login | register  │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/HTTPS (fetch + axios)
                            │ JWT Bearer Token
┌───────────────────────────▼─────────────────────────────────┐
│                   API SERVER (Express)                        │
│  Port 5000 | CORS enabled | JWT middleware                   │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ /api/auth    │ /api/prompts │ /api/test-prompt     │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Services: Groq | HuggingFace | Gemini | Mistral    │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌───────────────┐                    ┌──────────────────────┐
│   MongoDB     │                    │  External AI APIs    │
│ Users,Prompts │                    │  (Groq, HF, Google,  │
│ Comments,Votes│                    │   Mistral)           │
└───────────────┘                    └──────────────────────┘
```

---

## 2. Backend Architecture

### 2.1 Server Configuration (`server.js`)

**Strengths:**
- Multi-path `.env` loading for Docker compatibility
- CORS configured with origin whitelist
- Clean route organization

**Issues Found:**
```javascript
// CRITICAL: connectDB is imported but NEVER called
const connectDB = require('./config/db');
// Missing: connectDB();
```

### 2.2 Data Models

#### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, validated),
  password: String (required, min 6, bcrypt hashed),
  created_at: Date,
  avatar: String,
  bio: String,
  prompts: [ObjectId] (ref: Prompt),
  role: 'user' | 'admin'
}
```

#### Prompt Model
```javascript
{
  title: String (required),
  content: String (required),
  targetModel: Enum ['ChatGPT', 'Claude', 'Gemini', 'Llama', 'Midjourney', 'Other', 'HuggingFace'],
  tags: [String],
  isPublic: Boolean (default: false),
  author: ObjectId (ref: User, required),
  created_at: Date,
  updated_at: Date,
  rating: Number (0-5, average),
  ratingsCount: Number,
  ratedBy: [ObjectId],
  views: Number,
  upvotes: Number,
  downvotes: Number,
  commentCount: Number,
  hotScore: Number
}
```

**Indexes:**
- Text index on title, content, tags
- Index on author
- Compound index on hotScore, created_at

#### Comment Model
```javascript
{
  prompt: ObjectId (ref: Prompt, required),
  author: ObjectId (ref: User, required),
  body: String (required, max 2000),
  parentComment: ObjectId (ref: Comment, for nested replies),
  isDeleted: Boolean,
  timestamps: true
}
```

#### PromptVote Model
```javascript
{
  prompt: ObjectId (ref: Prompt, required),
  user: ObjectId (ref: User, required),
  value: Number (enum: [-1, 1]),
  timestamps: true,
  unique compound index: (prompt, user)
}
```

### 2.3 API Endpoints

#### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user, returns JWT |
| GET | `/me` | Protected | Get current user |

#### Prompts (`/api/prompts`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all prompts (filterable, sortable, paginated) |
| GET | `/tags` | Public | Get unique tags |
| GET | `/mine` | Protected | Get user's prompts |
| GET | `/:id` | Public | Get single prompt |
| POST | `/` | Protected | Create prompt |
| PUT | `/:id` | Protected | Update prompt (owner only) |
| DELETE | `/:id` | Protected | Delete prompt (owner only) |
| POST | `/:id/rate` | Protected | Rate prompt (0-5) |
| POST | `/:id/vote` | Protected | Upvote/downvote |
| POST | `/:id/bookmark` | Protected | Bookmark (NOT IMPLEMENTED) |
| GET | `/:id/comments` | Public | Get prompt comments |
| POST | `/:id/comments` | Protected | Add comment |

#### Testing (`/api/test-prompt`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Public | Test prompt with AI model |

### 2.4 AI Model Integration

**Model Service Architecture:**
```
ModelService
├── providers: {
│   ├── groq → groqService.js
│   ├── huggingface → huggingFaceService.js
│   ├── gemini → geminiService.js
│   └── mistral → mistralService.js
│   }
└── generateResponse(modelId, prompt, params)
```

**Available Models (10 free models):**

| Provider | Model | Speed | Context | Best For |
|----------|-------|-------|---------|----------|
| Groq | Llama-3.1-8B-Instant | Fastest | Medium | Quick iterations |
| Groq | Llama-3.1-70B-Versatile | Fast | Large | High-quality reasoning |
| Groq | Mixtral-8x7b | Medium | XL | Complex tasks |
| HuggingFace | Qwen2.5-Coder-32B | Medium | XL | Code generation |
| HuggingFace | Llama-3.1-8B-Instruct | Medium | Large | General chat |
| HuggingFace | Mistral-7B-v0.3 | Fast | Medium | Instruction following |
| HuggingFace | DeepSeek-Coder-V2-Lite | Medium | Large | Coding tasks |
| Gemini | 1.5 Flash | Fast | XL (1M tokens) | Large context |
| Mistral | Small | Fast | Medium | Concise outputs |
| Mistral | Pixtral-12B | Medium | XL | Vision capabilities |

### 2.5 Hot Score Algorithm

```javascript
const calculateHotScore = (prompt) => {
    const voteScore = (prompt.upvotes || 0) - (prompt.downvotes || 0);
    const commentBonus = (prompt.commentCount || 0) * 0.5;
    const viewBonus = Math.log10((prompt.views || 0) + 1) * 0.2;
    const ageInHours = (Date.now() - new Date(prompt.created_at).getTime()) / 3600000;
    const timeDecay = ageInHours * 0.08;
    return Number((voteScore + commentBonus + viewBonus - timeDecay).toFixed(4));
};
```

---

## 3. Frontend Architecture

### 3.1 Component Hierarchy

```
App.js
└── AuthProvider (Context)
    └── HomePage (Main Orchestrator)
        ├── Navbar
        ├── HeroSection
        ├── PromptFilters
        ├── PromptCard (multiple)
        ├── CreatePromptForm
        ├── PromptTestForm
        │   ├── ModelCard (multiple)
        │   └── TestResultsDisplay
        ├── LoginForm
        ├── RegisterForm
        ├── UserProfile
        └── Footer
```

### 3.2 State Management

**AuthContext provides:**
- `user` - Current user object
- `token` - JWT token
- `isAuthenticated` - Boolean
- `loading` - Initial loading state
- `login(userData, token)` - Login function
- `logout()` - Logout function

**Persistence:** localStorage for user and token

### 3.3 Section-Based Navigation

The app uses a single-page architecture with `activeSection` state:
- `home` - Landing page with trending and explore sections
- `create` - Create/edit prompt form
- `test` - Prompt testing playground
- `login` - Login form
- `register` - Registration form
- `profile` - User profile with own prompts

### 3.4 Key Features in Frontend

#### Trending Sections
- **Hot Right Now** - Sorted by hotScore algorithm
- **Most Viewed** - Sorted by view count
- **Top-Rated** - Sorted by average rating

#### Prompt Testing Playground
- Model selection with search and filters (provider, speed, context size)
- Favorites system for quick model access
- Variable injection using `{{variableName}}` syntax
- Custom parameters (temperature, max tokens)
- Side-by-side comparison capability

#### Prompt Cards
- Upvote/downvote with score display
- Star rating (0-5) for non-authors
- Nested comments with reply support
- "Try It" button to load into test playground
- Bookmark and share buttons (UI only)

---

## 4. Identified Issues

### 4.1 Critical Issues

| Issue | Location | Impact | Priority |
|-------|----------|--------|----------|
| Database never connects | `server.js` | App cannot persist data | 🔴 Critical |
| API layer inconsistency | Frontend | Mixed fetch/axios usage | 🟡 Medium |
| No token refresh | AuthContext | Users logged out on expiry | 🟠 High |
| Missing error boundaries | React components | App crashes on errors | 🟠 High |

### 4.2 Security Concerns

1. **No Rate Limiting**
   - API endpoints vulnerable to abuse
   - No protection against brute force attacks
   - Recommendation: Add `express-rate-limit`

2. **Input Sanitization**
   - Basic validation only
   - No XSS protection on user content
   - Recommendation: Add `express-validator` and `xss-clean`

3. **CORS Configuration**
   - `credentials: true` without CSRF tokens
   - Recommendation: Add CSRF protection middleware

4. **JWT Security**
   - Secret should be stronger (currently placeholder)
   - No token rotation mechanism
   - Recommendation: Use strong secret, implement refresh tokens

### 4.3 Performance Issues

1. **No Caching**
   - Every request hits database
   - Recommendation: Add Redis or in-memory caching

2. **Missing Pagination UI**
   - Backend supports pagination
   - Frontend doesn't implement it
   - Recommendation: Add pagination controls

3. **No Debouncing**
   - Search input triggers API call on every keystroke
   - Recommendation: Add 300ms debounce

4. **Unnecessary Re-renders**
   - Multiple state updates in HomePage
   - Recommendation: Use `useMemo`, `useCallback`, or state batching

### 4.4 Missing Features

| Feature | Status | Notes |
|---------|--------|-------|
| Bookmark functionality | ❌ Not implemented | Returns 501 |
| Social sharing | ❌ UI only | No actual sharing logic |
| Test history | ❌ Not implemented | Route exists but no controller |
| Pagination UI | ❌ Missing | Backend ready |
| Password reset | ❌ Not implemented | No forgot password flow |
| Email verification | ❌ Not implemented | No verification system |
| Image uploads | ❌ Not implemented | Avatar field exists but unused |

### 4.5 Code Quality Issues

1. **Duplicate Files**
   - `createPromptPage.js` vs `CreatePromptPage.js`
   - `testPromptPage.js` vs `TestPromptPage.js`
   - Recommendation: Remove lowercase duplicates

2. **Console.log Statements**
   - Multiple debug logs in production code
   - Recommendation: Use proper logging library

3. **Inconsistent Error Handling**
   - Some use try/catch, others don't
   - Recommendation: Create error handling middleware

4. **Missing TypeScript**
   - No type safety
   - Recommendation: Migrate to TypeScript gradually

---

## 5. Suggestions for Improvement

### 5.1 Immediate Fixes (Week 1)

```javascript
// 1. Fix database connection in server.js
const connectDB = require('./config/db');
connectDB(); // ADD THIS LINE

// 2. Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// 3. Add error boundary in React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### 5.2 Short-term Improvements (Month 1)

1. **Implement Token Refresh**
   ```javascript
   // Add to authController.js
   const refreshToken = async (req, res) => {
     const { token } = req.body;
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
         expiresIn: '7d'
       });
       res.json({ token: newToken });
     } catch (err) {
       res.status(401).json({ msg: 'Invalid token' });
     }
   };
   ```

2. **Add Pagination to Frontend**
   ```javascript
   // In HomePage.js
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   
   // Add pagination controls
   <div className="flex justify-center gap-2 mt-4">
     <button onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
     <span>Page {page} of {totalPages}</span>
     <button onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
   </div>
   ```

3. **Implement Bookmark Feature**
   ```javascript
   // In User model, add:
   bookmarks: [{ type: ObjectId, ref: 'Prompt' }]
   
   // In promptController.js:
   const bookmarkPrompt = async (req, res) => {
     const user = await User.findById(req.user.id);
     const promptId = req.params.id;
     
     if (user.bookmarks.includes(promptId)) {
       user.bookmarks = user.bookmarks.filter(id => id.toString() !== promptId);
     } else {
       user.bookmarks.push(promptId);
     }
     
     await user.save();
     res.json({ bookmarks: user.bookmarks });
   };
   ```

### 5.3 Long-term Enhancements (Quarter 1)

1. **Migrate to TypeScript**
   - Start with new files
   - Add types to existing files gradually
   - Use `any` initially, refine over time

2. **Add Real-time Features**
   - WebSocket support for live comments
   - Real-time vote updates
   - Notification system

3. **Implement Caching Layer**
   ```javascript
   const Redis = require('ioredis');
   const redis = new Redis();
   
   const cacheMiddleware = (duration) => async (req, res, next) => {
     const key = `cache:${req.originalUrl}`;
     const cached = await redis.get(key);
     
     if (cached) {
       return res.json(JSON.parse(cached));
     }
     
     res.sendResponse = res.json;
     res.json = (body) => {
       redis.setex(key, duration, JSON.stringify(body));
       res.sendResponse(body);
     };
     next();
   };
   ```

4. **Add Comprehensive Testing**
   - Unit tests for all controllers
   - Integration tests for API endpoints
   - E2E tests with Cypress

5. **Implement CI/CD Pipeline**
   ```yaml
   # .github/workflows/ci.yml
   name: CI
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
         - run: npm install
         - run: npm test
   ```

---

## 6. Database Schema Recommendations

### 6.1 Add Missing Indexes

```javascript
// User model
UserSchema.index({ email: 1 });
UserSchema.index({ created_at: -1 });

// Comment model
CommentSchema.index({ prompt: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });

// Add compound index for efficient queries
PromptSchema.index({ isPublic: 1, hotScore: -1 });
PromptSchema.index({ isPublic: 1, rating: -1 });
PromptSchema.index({ isPublic: 1, views: -1 });
```

### 6.2 Add TestResult Model (Future)

```javascript
const TestResultSchema = new mongoose.Schema({
  prompt: { type: ObjectId, ref: 'Prompt', required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  model: { type: String, required: true },
  response: { type: String, required: true },
  responseTime: { type: Number },
  tokensUsed: { type: Number },
  parameters: {
    temperature: Number,
    maxTokens: Number
  },
  createdAt: { type: Date, default: Date.now }
});
```

---

## 7. Environment Configuration

### 7.1 Required Environment Variables

**Backend (.env):**
```env
# Database
MONGO_URI=mongodb://localhost:27017/ai-prompt-builder

# Server
PORT=5000
JWT_SECRET=<strong-random-secret-min-32-chars>

# AI APIs
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
HUGGINGFACE_TOKEN=hf_...
MISTRAL_API_KEY=...
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_FRONTEND_API_URL=http://localhost:5000/api
REACT_APP_PRODUCTION=false
```

---

## 8. Deployment Considerations

### 8.1 Docker Setup (Already Exists)

The project includes Dockerfiles for both frontend and backend. Ensure:
- Environment variables are properly passed
- MongoDB is accessible from containers
- CORS is configured for production URLs

### 8.2 Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB Atlas or managed database
- [ ] Enable rate limiting
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure logging (e.g., Winston)
- [ ] Set up automated backups
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets

---

## 9. Summary

### Strengths
✅ Clean separation of concerns (MVC pattern)
✅ Multi-model AI integration with unified service
✅ Comprehensive prompt management features
✅ Reddit-style engagement (voting, rating, comments)
✅ Responsive UI with Tailwind CSS
✅ Docker support for deployment

### Weaknesses
❌ Database connection not initialized
❌ No rate limiting or caching
❌ Missing error boundaries
❌ Incomplete features (bookmarks, sharing)
❌ No TypeScript for type safety
❌ Limited test coverage

### Priority Actions
1. **Fix database connection** - App won't work without it
2. **Add rate limiting** - Security critical
3. **Implement token refresh** - User experience
4. **Add error boundaries** - Stability
5. **Complete bookmark feature** - Core functionality

---

*Document generated: 2026-03-19*
*Analysis based on codebase exploration of ai-prompt-builder repository*