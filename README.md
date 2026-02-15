# Angular Chatbot Interface

A minimalist Angular chatbot interface that integrates with the [go-function-calling-ai](../go-function-calling-ai) backend API. This application provides a clean, modern chat interface for interacting with an AI assistant powered by Google's Gemini AI with function calling capabilities.

## Features

- **Clean Chat Interface**: Minimalist design focused on conversation
- **Real-time AI Conversation**: Natural language interaction with AI assistant
- **Message History**: View complete conversation history within session
- **Typing Indicators**: Visual feedback while waiting for AI responses
- **Error Handling**: User-friendly error messages with retry capability
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Accessibility**: Full keyboard navigation and screen reader support
- **Dark Mode**: Automatic dark mode support
- **Session Management**: Maintains conversation context using session IDs

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.11.1 or higher (or v22.12+)
- **npm**: 8.0.0 or higher
- **Angular CLI**: 18.x (`npm install -g @angular/cli`)
- **go-function-calling-ai backend**: Running on http://localhost:8080

### Backend Setup

The chatbot requires the go-function-calling-ai backend to be running. See the [backend README](../go-function-calling-ai/README.md) for setup instructions.

Quick backend setup:
```bash
cd ../go-function-calling-ai
export GEMINI_API_KEY="your-gemini-api-key"
go run main.go
```

## Installation

1. Clone the repository (if not already cloned):
```bash
git clone <repository-url>
cd ts-chatbot-ai
```

2. Install dependencies:
```bash
npm install
```

3. Verify installation:
```bash
ng version
```

## Configuration

The application uses environment-based configuration for the API endpoint.

### Development Environment

The default configuration in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### Production Environment

Edit `src/environments/environment.prod.ts` for production deployment:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com'
};
```

### Environment Variables

No additional environment variables are required for the frontend. All configuration is managed through Angular environment files.

## Usage

### Starting the Application

1. **Start the backend** (in a separate terminal):
```bash
cd ../go-function-calling-ai
export GEMINI_API_KEY="your-api-key"
go run main.go
```

2. **Start the frontend**:
```bash
npm start
```

3. **Open your browser** and navigate to:
```
http://localhost:4200
```

The application will automatically reload when you make changes to source files.

### Using the Chat Interface

1. Type your message in the input field at the bottom
2. Press **Enter** or click the **Send** button
3. Wait for the AI response (typing indicator will appear)
4. Continue the conversation naturally

**Keyboard Shortcuts:**
- `Enter` - Send message
- `Shift + Enter` - Insert line break (multi-line messages)

### Example Conversations

Try these natural language queries:

```
"Show me all products"
"Search for laptops"
"What are the top selling products?"
"Create an order for customer cust-1 with product prod-2, quantity 2"
"Show me John Doe's order history"
"What's the total revenue?"
```

The AI assistant can:
- List and search products
- Manage customer information
- Create and track orders
- Provide sales analytics
- Answer questions about the system

## Building for Production

Build the project for production deployment:

```bash
npm run build
```

The build artifacts will be stored in the `dist/ts-chatbot-ai/` directory with:
- Minified JavaScript and CSS
- Optimized assets
- Production environment configuration

### Build Options

```bash
# Production build with optimization
npm run build

# Development build (faster, no optimization)
ng build --configuration development

# Build with source maps
ng build --source-map
```

## Testing

The project uses a dual testing approach for comprehensive coverage:

### Unit Tests

Unit tests verify specific examples, edge cases, and error conditions using Jasmine and Karma.

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:headless

# Run tests with coverage report
npm run test:coverage
```

### Property-Based Tests

Property-based tests verify universal correctness properties across all inputs using fast-check.

```bash
# Run all tests (includes property tests)
npm test

# Property tests run with 100+ iterations per property
```

### Test Coverage

Coverage goals:
- **Overall**: 80%+
- **Services**: 90%+ (critical business logic)
- **Components**: 75%+ (UI logic)
- **Models**: 100% (validation logic)

View coverage report:
```bash
npm run test:coverage
open coverage/ts-chatbot-ai/index.html
```

### Testing Strategy

The application implements both unit and property-based tests:

**Unit Tests** (`*.spec.ts`):
- Component initialization and lifecycle
- User interactions (clicks, keyboard events)
- Specific error scenarios
- Edge cases (empty inputs, special characters)

**Property Tests** (`*.property.spec.ts`):
- Message ordering correctness
- Input validation across all inputs
- Timestamp formatting consistency
- Session ID persistence
- Error handling completeness

## API Integration

### Backend API

The application integrates with the go-function-calling-ai backend API.

**Base URL**: `http://localhost:8080` (development)

### Chat Endpoint

**POST** `/api/chat`

Send a message to the AI assistant and receive a response.

**Request:**
```json
{
  "message": "What are the top selling products?",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "response": "Based on the sales data, the top selling products are..."
}
```

**Error Response:**
```json
{
  "error": "descriptive error message"
}
```

### Session Management

- **Session ID**: UUID v4 format, generated client-side
- **Lifecycle**: Generated on app start, persists during session
- **Context**: Backend maintains conversation context per session
- **Refresh**: New session ID generated on page refresh

### CORS Configuration

The backend must allow requests from the frontend origin:

**Development**: `http://localhost:4200`
**Production**: Your production domain

Ensure the backend has appropriate CORS headers configured.

### Error Handling

The application handles various error scenarios:

| Error Type | User Message | Action |
|------------|--------------|--------|
| Network Error | "Unable to connect to the server" | Check backend is running |
| Timeout | "Request timed out" | Retry message |
| 400 Bad Request | API error message | Fix input and retry |
| 500 Server Error | "Server error. Try again later" | Wait and retry |

All errors are logged to the browser console for debugging.

## Project Structure

```
ts-chatbot-ai/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── chat/
│   │   │       ├── chat.component.ts           # Main chat component
│   │   │       ├── chat.component.html         # Chat template
│   │   │       ├── chat.component.css          # Chat styles
│   │   │       ├── chat.component.spec.ts      # Unit tests
│   │   │       └── chat.component.property.spec.ts  # Property tests
│   │   ├── services/
│   │   │   ├── chat.service.ts                 # API communication
│   │   │   ├── chat.service.spec.ts            # Unit tests
│   │   │   └── chat.service.property.spec.ts   # Property tests
│   │   ├── models/
│   │   │   ├── chat.model.ts                   # Data interfaces
│   │   │   └── chat.model.spec.ts              # Model tests
│   │   ├── app.component.ts                    # Root component
│   │   ├── app.config.ts                       # App configuration
│   │   └── app.routes.ts                       # Routing
│   ├── environments/
│   │   ├── environment.ts                      # Dev config
│   │   └── environment.prod.ts                 # Prod config
│   ├── index.html                              # Main HTML
│   ├── main.ts                                 # Entry point
│   └── styles.css                              # Global styles
├── public/                                     # Static assets
├── .kiro/specs/angular-chatbot-interface/      # Feature specs
├── angular.json                                # Angular CLI config
├── package.json                                # Dependencies
├── tailwind.config.js                          # Tailwind config
├── tsconfig.json                               # TypeScript config
├── karma.conf.js                               # Test config
└── README.md                                   # This file
```

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 18.2 | Frontend framework |
| PrimeNG | 17.18 | UI component library |
| Tailwind CSS | 3.4 | Utility-first styling |
| RxJS | 7.8 | Reactive programming |
| TypeScript | 5.5 | Type-safe JavaScript |
| Jasmine | 5.1 | Unit testing framework |
| Karma | 6.4 | Test runner |
| fast-check | 3.22 | Property-based testing |

## Development Guidelines

### Code Style

- **TypeScript Strict Mode**: Enabled for type safety
- **Angular Style Guide**: Follow official Angular conventions
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Document complex logic and public APIs
- **Formatting**: Use Angular CLI formatting (Prettier compatible)

### Component Architecture

- **Single Responsibility**: Each component has one clear purpose
- **Service Layer**: Business logic in services, not components
- **Reactive Programming**: Use RxJS observables for async operations
- **Change Detection**: OnPush strategy for performance
- **Immutability**: Avoid mutating state directly

### Testing Best Practices

1. **Write Tests First**: Consider TDD for critical features
2. **Test Behavior**: Focus on what, not how
3. **Mock External Dependencies**: Isolate unit under test
4. **Property Tests**: Verify universal properties
5. **Coverage**: Aim for 80%+ overall coverage
6. **Fast Tests**: Keep tests fast and focused

### Accessibility Guidelines

- **Semantic HTML**: Use appropriate HTML elements
- **ARIA Labels**: Add labels to all interactive elements
- **Keyboard Navigation**: Support Tab, Enter, Escape keys
- **Focus Management**: Maintain logical focus order
- **Color Contrast**: Meet WCAG AA standards (4.5:1 ratio)
- **Screen Readers**: Test with NVDA, JAWS, or VoiceOver

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest |
| Firefox | Latest |
| Safari | Latest |
| Edge | Latest |

**Note**: Internet Explorer is not supported.

## Troubleshooting

### Common Issues

**1. Backend Connection Error**

```
Error: Unable to connect to the server
```

**Solution**: Ensure the backend is running on http://localhost:8080

```bash
cd ../go-function-calling-ai
go run main.go
```

**2. CORS Error**

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Configure CORS in the backend to allow http://localhost:4200

**3. Tests Failing**

```
Error: Timeout - Async callback was not invoked
```

**Solution**: Ensure backend is running during integration tests, or mock HTTP calls

**4. Build Errors**

```
Error: Module not found
```

**Solution**: Reinstall dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

Enable debug logging in the browser console:

```typescript
// In environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  debug: true  // Add this
};
```

## Performance Considerations

### Optimization Strategies

1. **OnPush Change Detection**: Reduces unnecessary re-renders
2. **Lazy Loading**: Components loaded on demand
3. **Virtual Scrolling**: For conversations with 100+ messages
4. **Message Batching**: Batch updates to reduce render cycles
5. **Subscription Management**: Automatic cleanup prevents memory leaks

### Performance Metrics

- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Message Send Latency**: < 100ms (excluding API)
- **Scroll Performance**: 60 FPS

## Security Considerations

### Input Sanitization

- Angular automatically sanitizes template bindings
- User input is trimmed and validated before sending
- No innerHTML usage with user content

### API Security

- Session IDs are not authentication tokens
- No sensitive data in session IDs
- Use HTTPS in production
- Implement rate limiting on backend

### Content Security Policy

Add to `index.html` for production:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' https://your-api.com;
               style-src 'self' 'unsafe-inline';">
```

## Deployment

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/ts-chatbot-ai /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
docker build -t ts-chatbot-ai .
docker run -p 80:80 ts-chatbot-ai
```

### Environment-Specific Builds

```bash
# Development
ng build --configuration development

# Production
ng build --configuration production

# Staging
ng build --configuration staging
```

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Write** tests for your changes
4. **Ensure** all tests pass (`npm test`)
5. **Commit** with conventional commits (`git commit -m 'feat: add amazing feature'`)
6. **Push** to your branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@example.com

## Acknowledgments

- Built with [Angular](https://angular.io/)
- UI components from [PrimeNG](https://primeng.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Inspired by the [Freya-ng](https://github.com/primefaces/freya-ng) template
- Backend powered by [go-function-calling-ai](../go-function-calling-ai)

## Roadmap

### Planned Features

- [ ] Message persistence (localStorage)
- [ ] Markdown rendering in messages
- [ ] Code syntax highlighting
- [ ] Export conversation as text/JSON
- [ ] Multi-session management
- [ ] Theme customization
- [ ] WebSocket support for real-time updates
- [ ] Voice input support

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.
