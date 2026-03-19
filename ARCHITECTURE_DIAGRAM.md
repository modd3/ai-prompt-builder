# AI Prompt Builder - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           FRONTEND (React 19 + Tailwind CSS)             │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  Port: 3000                                              │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  App.js                                            │  │   │
│  │  │  ├─ AuthProvider (Context)                        │  │   │
│  │  │  ├─ Router (React Router v7)                      │  │   │
│  │  │  └─ Routes                                        │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                          │                                │   │
│  │  ┌─────────┬─────────────┼──────────┬─────────────────┐  │   │
│  │  │         │             │          │                 │  │   │
│  │  ▼         ▼             ▼          ▼                 ▼  │   │
│  │ Layout    Pages        Components  Services         Utils│  │
│  │ ├─Navbar │ ├─Home      │ ├─Button  │ ├─api.js       │  │   │
│  │ ├─Sidebar│ ├─Create    │ ├─Input   │ └─axios inst.  │  │   │
│  │ └─Layout │ ├─Test      │ ├─Card    │                │  │   │
│  │          │ ├─Profile   │ ├─Form    │                │  │   │
│  │          │ ├─Login     │ └─Modal   │                │  │   │
│  │          │ └─Register  │           │                │  │   │
│  │          └─────────────┴───────────┘                │  │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
                          HTTP
                        (Axios)
                           │
                    ┌──────▼──────┐
                    │ CORS Policy │
                    │ localhost:  │
                    │ 3000        │
                    └──────┬──────┘
                           │
                    (JWT Token Header)
                           │
┌──────────────────────────▼────────────────────────────────────────┐
│                    API GATEWAY (Express)                           │
├──────────────────────────────────────────────────────────────────┤
│  Port: 5000                                                       │
│  Base URL: http://localhost:5000/api                             │
│                                                                   │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │              │              │              │                 │
│  ▼              ▼              ▼              ▼                 │
│ /auth        /prompts       /test-prompt   Middleware           │
│ ├─POST reg   ├─GET list     ├─POST test   ├─Auth Check       │
│ ├─POST login ├─POST create  └─GET result  ├─CORS             │
│ └─GET me     ├─PUT update                  ├─Body Parser      │
│              ├─DELETE                      └─Error Handler    │
│              ├─PATCH rate                                      │
│              └─PATCH bookmark                                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Controllers                                            │    │
│  │  ├─ authController.js                                  │    │
│  │  │  ├─ registerUser()                                  │    │
│  │  │  ├─ loginUser() → JWT Token                         │    │
│  │  │  └─ getMe()                                         │    │
│  │  │                                                      │    │
│  │  └─ promptController.js                                │    │
│  │     ├─ getPrompts()                                    │    │
│  │     ├─ createPrompt()                                  │    │
│  │     ├─ editPrompt()                                    │    │
│  │     ├─ deletePrompt()                                  │    │
│  │     ├─ ratePrompt()                                    │    │
│  │     └─ bookmarkPrompt()                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Services (AI Model Integrations)                       │    │
│  │  ├─ openaiService.js         → GPT Models              │    │
│  │  ├─ geminiService.js         → Gemini Flash            │    │
│  │  ├─ groqService.js           → Llama, Mixtral          │    │
│  │  ├─ huggingFaceService.js    → Multiple models         │    │
│  │  └─ mistralService.js        → Mistral models          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└───────┬─────────────────────┬──────────────────┬────────────────┘
        │                     │                  │
        ▼                     ▼                  ▼
    ┌───────────┐        ┌──────────┐    ┌──────────────────┐
    │ MongoDB   │        │ Mongoose │    │ External AI APIs │
    │           │        │ ODM      │    │                  │
    │ Collections│◄──────│          │    │ ├─OpenAI         │
    │ ├─Users   │        │ Models:  │    │ ├─Google         │
    │ └─Prompts │        │ ├─User   │    │ ├─Groq           │
    │           │        │ └─Prompt │    │ ├─HuggingFace    │
    └───────────┘        └──────────┘    │ └─Mistral        │
                                         └──────────────────┘
```

---

## Data Flow Diagram

### User Authentication Flow
```
1. USER VISITS APP
   ├─ Frontend loads from React router
   └─ AuthContext checks for JWT token in localStorage

2. USER REGISTERS / LOGS IN
   ├─ Frontend: LoginForm/RegisterForm component
   │  └─ POST /api/auth/register or /api/auth/login
   │     └─ JSON: { email, password }
   │
   ├─ Backend: authController.js
   │  ├─ Hash password (bcryptjs)
   │  ├─ Store/verify in MongoDB
   │  └─ Generate JWT token
   │
   └─ Response: { token, user: { _id, name, email } }
      ├─ Frontend stores in AuthContext
      ├─ Axios adds Authorization header: "Bearer <token>"
      └─ Redirect to /home

3. ACCESSING PROTECTED ROUTES
   ├─ Frontend makes API call with Authorization header
   ├─ Backend authMiddleware validates JWT
   ├─ If valid: Route handler executes
   └─ If invalid: Return 401 Unauthorized
```

### Prompt Creation Flow
```
1. USER GOES TO /create
   └─ CreatePromptPage component loads

2. USER FILLS FORM & CLICKS "CREATE"
   └─ CreatePromptForm component
      ├─ Validates inputs (title, content, model)
      └─ POST /api/prompts
         └─ JSON: { title, content, targetModel, tags, isPublic }
         └─ Header: Authorization: Bearer <token>

3. BACKEND PROCESSES
   └─ promptController.createPrompt()
      ├─ Extract userId from JWT (middleware)
      ├─ Create prompt document: { title, content, author: userId, ... }
      └─ Save to MongoDB.Prompts collection

4. RESPONSE
   ├─ Backend returns: { _id, title, content, author, createdAt, ... }
   ├─ Frontend shows success toast
   └─ Navigate to /test or back to /home
```

### Prompt Testing Flow
```
1. USER CLICKS "TRY IT" OR GOES TO /test
   ├─ Select a prompt
   └─ Select an AI model (GPT, Gemini, Groq, etc.)

2. USER CLICKS "RUN TEST"
   └─ PromptTestForm component
      └─ POST /api/test-prompt/:promptId
         └─ JSON: { model: "gpt-4", variations?: [...] }
         └─ Header: Authorization: Bearer <token>

3. BACKEND PROCESSES
   └─ Middleware validates JWT
   └─ Route handler looks up prompt by ID
   └─ Calls appropriate service:
      ├─ If model === "gpt-4" → openaiService.testPrompt()
      ├─ If model === "gemini" → geminiService.testPrompt()
      ├─ If model === "groq" → groqService.testPrompt()
      └─ Each service calls its respective API

4. RESPONSE
   ├─ Backend waits for AI model response
   ├─ Includes metrics (response time, tokens, etc.)
   └─ Returns: { result, model, responseTime, tokensUsed, cost? }

5. FRONTEND DISPLAYS
   ├─ TestResultsDisplay component
   ├─ Shows: Model response, time taken, token count
   └─ Can compare multiple models side-by-side
```

### Prompt Retrieval Flow
```
1. USER LOADS HOME PAGE / EXPLORE
   └─ HomePage component mounts
      └─ GET /api/prompts
         └─ Query params: { category?, sortBy?, search?, page? }

2. OPTIONAL FILTERS
   ├─ GET /api/prompts?category=coding
   ├─ GET /api/prompts?search=javascript
   ├─ GET /api/prompts?sortBy=rating&order=desc
   └─ GET /api/prompts?page=1&limit=10 (pagination)

3. BACKEND RETRIEVES
   └─ promptController.getPrompts()
      ├─ Query MongoDB with filters
      ├─ Apply sorting & pagination
      └─ Return: [{ _id, title, content, author, rating, ... }, ...]

4. FRONTEND DISPLAYS
   ├─ PromptCard components in grid/list
   ├─ Shows: Title, excerpt, author, rating, model type
   └─ Actions: "Try It", Rate, Bookmark
```

---

## Environment Configuration

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_FRONTEND_API_URL=http://localhost:5000/api
REACT_APP_PRODUCTION=false
```

### Backend (.env)
```
# Database
MONGO_URI=mongodb://localhost:27017/ai-prompt-builder

# Server
PORT=5000
JWT_SECRET=your-secret-key-here

# AI APIs (get free keys from each service)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
HUGGINGFACE_TOKEN=hf_...
MISTRAL_API_KEY=...
```

---

## API Endpoints Reference

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
GET    /api/auth/me             - Get current user (protected)
```

### Prompts
```
GET    /api/prompts             - Get all prompts (public)
GET    /api/prompts/:id         - Get single prompt (public)
GET    /api/prompts/mine        - Get user's prompts (protected)
GET    /api/prompts/tags        - Get all tags (public)

POST   /api/prompts             - Create prompt (protected)
PUT    /api/prompts/:id         - Update prompt (protected, owner only)
DELETE /api/prompts/:id         - Delete prompt (protected, owner only)

PATCH  /api/prompts/:id/rate    - Rate prompt (protected)
PATCH  /api/prompts/:id/bookmark - Bookmark prompt (protected)
```

### Testing
```
POST   /api/test-prompt/:id     - Test prompt with AI model (protected)
GET    /api/test-prompt/history - Get test history (protected)
```

---

## Key Points About Connectivity

✅ **Frontend connects to Backend via HTTP (Axios)**
- Base URL: `http://localhost:5000/api`
- JWT token sent in Authorization header: `Bearer <token>`
- CORS enabled for localhost:3000

✅ **Authentication**
- JWT tokens stored in AuthContext (not localStorage currently)
- Protected routes validated by authMiddleware on backend
- Token expires (check JWT_SECRET setup)

✅ **Multiple AI Services**
- Backend acts as proxy to 5 different AI providers
- Frontend doesn't call AI APIs directly (security + cost control)

✅ **Database**
- All user data & prompts stored in MongoDB
- Mongoose schemas with relationships (User ↔ Prompt via author)

---

## Potential Issues to Address

⚠️ **Currently Found:**
1. No error handling in API calls (axios responses)
2. No request timeout configuration
3. No retry logic for failed requests
4. Token refresh strategy missing (tokens don't refresh)
5. No API rate limiting on frontend
6. No loading indicators during requests
7. No caching strategy (every request hits DB)

⚠️ **Frontend & Backend Sync:**
1. Environment variables must match on both sides
2. CORS whitelist on backend must include frontend URL
3. JWT_SECRET should be strong and consistent

---

## Modern Architecture Improvements (Future)

**Consider these enhancements:**
- 🔄 Implement React Query for better data fetching
- 📦 Add API response caching
- 🔑 Implement token refresh mechanism
- ⚡ Add request timeout & retry logic
- 📊 Add analytics/monitoring
- 🔐 Add rate limiting on backend
- 📱 Add offline support (Service Workers)
