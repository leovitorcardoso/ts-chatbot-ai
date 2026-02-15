# Design Document: Angular Chatbot Interface

## Overview

The Angular Chatbot Interface is a minimalist single-page application that provides a clean, modern chat interface for interacting with an AI assistant powered by the go-function-calling-ai backend. The application is built using Angular 21, PrimeNG components, and Tailwind CSS, maintaining visual consistency with the Freya-ng template while focusing exclusively on chat functionality.

The design emphasizes simplicity, responsiveness, and seamless integration with the backend API. The application follows Angular best practices with a clear separation of concerns: components handle presentation, services manage business logic and API communication, and models define data structures.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Angular Application                      │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  App Component (Root)                       │  │  │
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │  Chat Component                       │  │  │  │
│  │  │  │  - Message Display                    │  │  │  │
│  │  │  │  - Input Field                        │  │  │  │
│  │  │  │  - Send Button                        │  │  │  │
│  │  │  │  - Typing Indicator                   │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Chat Service                               │  │  │
│  │  │  - sendMessage()                            │  │  │
│  │  │  - HTTP Communication                       │  │  │
│  │  │  - Session Management                       │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Models                                     │  │  │
│  │  │  - Message                                  │  │  │
│  │  │  - ChatRequest                              │  │  │
│  │  │  - ChatResponse                             │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/JSON
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Go)                            │
│              http://localhost:8080                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  POST /api/chat                                   │  │
│  │  - Receives: { message, session_id }             │  │
│  │  - Returns: { response }                         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
AppComponent (Root)
└── ChatComponent
    ├── Message List (Display Area)
    │   ├── Date Separator (conditional)
    │   ├── User Message (right-aligned)
    │   ├── AI Message (left-aligned)
    │   └── Typing Indicator (conditional)
    └── Input Area
        ├── Text Input Field
        └── Send Button
```

### Data Flow

1. **User Input Flow:**
   - User types message in input field
   - User presses Enter or clicks Send button
   - ChatComponent validates input (non-empty, not whitespace-only)
   - ChatComponent calls ChatService.sendMessage()
   - ChatService generates/uses session_id
   - ChatService makes HTTP POST to /api/chat
   - ChatComponent displays typing indicator
   - ChatComponent disables input during request

2. **Response Flow:**
   - Backend processes request and returns response
   - ChatService receives HTTP response
   - ChatService extracts AI message from response
   - ChatService returns Observable with message data
   - ChatComponent subscribes to Observable
   - ChatComponent adds AI message to message list
   - ChatComponent removes typing indicator
   - ChatComponent re-enables input
   - ChatComponent auto-scrolls to latest message

3. **Error Flow:**
   - HTTP request fails or times out
   - ChatService catches error
   - ChatService returns error Observable
   - ChatComponent displays error message
   - ChatComponent removes typing indicator
   - ChatComponent re-enables input
   - User can retry sending message

## Components and Interfaces

### ChatComponent

**Responsibility:** Main chat interface component that handles user interaction, message display, and coordination with ChatService.

**Template Structure:**
```html
<div class="chat-container">
  <!-- Messages Area -->
  <div class="messages-container" #messagesContainer>
    <!-- Date Separator -->
    <div *ngIf="message.isNewDay" class="date-separator">
      {{ message.dateLabel }}
    </div>
    
    <!-- User Message -->
    <div *ngIf="message.senderId === 'user'" class="message-user">
      <span class="message-time">{{ message.time }}</span>
      <div class="message-content">{{ message.content }}</div>
    </div>
    
    <!-- AI Message -->
    <div *ngIf="message.senderId === 'ai'" class="message-ai">
      <div class="message-content">{{ message.content }}</div>
      <span class="message-time">{{ message.time }}</span>
    </div>
    
    <!-- Typing Indicator -->
    <div *ngIf="isTyping" class="typing-indicator">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
  
  <!-- Input Area -->
  <div class="input-area">
    <input 
      pInputText 
      [(ngModel)]="messageText"
      (keyup.enter)="sendMessage()"
      [disabled]="isSending"
      placeholder="Write a message"
    />
    <p-button 
      icon="pi pi-send"
      (onClick)="sendMessage()"
      [disabled]="!canSend()"
    />
  </div>
</div>
```

**Properties:**
- `messages: Message[]` - Array of all messages in the conversation
- `messageText: string` - Current input field value
- `isTyping: boolean` - Whether AI is "typing" (waiting for response)
- `isSending: boolean` - Whether a message is currently being sent
- `sessionId: string` - Current session identifier

**Methods:**
- `ngOnInit()` - Initialize component, generate session ID
- `ngAfterViewChecked()` - Handle auto-scrolling after view updates
- `sendMessage()` - Validate and send user message
- `canSend()` - Check if send button should be enabled
- `scrollToBottom()` - Scroll messages container to bottom
- `addMessage(message: Message)` - Add message to list with date separator logic
- `handleError(error: any)` - Display error message to user

**Styling Approach:**
- Use Tailwind CSS utility classes for layout and spacing
- Use PrimeNG component styles for buttons and inputs
- Maintain Freya-ng color scheme and visual consistency
- Responsive design with mobile-first approach

### ChatService

**Responsibility:** Handle all backend API communication, session management, and message transformation.

**Properties:**
- `private apiUrl: string` - Base URL for backend API (from environment)
- `private sessionId: string` - Current session identifier

**Methods:**
```typescript
sendMessage(message: string, sessionId: string): Observable<ChatResponse>
```
- Makes HTTP POST request to /api/chat
- Includes message and session_id in request body
- Returns Observable with ChatResponse
- Handles HTTP errors and transforms them into user-friendly messages

```typescript
generateSessionId(): string
```
- Generates a unique UUID v4 session identifier
- Called once when service is initialized or when starting new conversation

**HTTP Configuration:**
- Uses Angular HttpClient
- Sets Content-Type: application/json header
- Timeout: 30 seconds
- Retry logic: None (user can manually retry)

**Error Handling:**
- Network errors: "Unable to connect to the server. Please check your connection."
- Timeout errors: "Request timed out. Please try again."
- 4xx errors: Display error message from API response
- 5xx errors: "Server error. Please try again later."

## Data Models

### Message Interface

```typescript
interface Message {
  id: string;              // Unique message identifier (UUID)
  senderId: 'user' | 'ai'; // Who sent the message
  content: string;         // Message text content
  timestamp: Date;         // When message was created
  time: string;            // Formatted time string (HH:MM)
  isNewDay?: boolean;      // Whether to show date separator before this message
  dateLabel?: string;      // Formatted date string for separator
}
```

**Usage:**
- Stored in ChatComponent.messages array
- Created when user sends message or AI responds
- Used for rendering in template

**Date Separator Logic:**
- Compare current message date with previous message date
- If dates differ, set isNewDay = true
- Format dateLabel as "Today", "Yesterday", or "MMM DD, YYYY"

### ChatRequest Interface

```typescript
interface ChatRequest {
  message: string;    // User's message text
  session_id: string; // Session identifier for context
}
```

**Usage:**
- Created by ChatService before making API call
- Sent as JSON body in POST request to /api/chat

### ChatResponse Interface

```typescript
interface ChatResponse {
  response: string; // AI's response text
}
```

**Usage:**
- Received from backend API
- Parsed by ChatService
- Transformed into Message object for display

### Environment Configuration

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

**Usage:**
- Injected into ChatService
- Allows easy switching between development and production APIs
- Can be overridden for different environments

## Session Management

### Session ID Generation

- Use `crypto.randomUUID()` for generating session IDs
- Format: UUID v4 (e.g., "550e8400-e29b-41d4-a716-446655440000")
- Generated once when ChatService is initialized
- Stored in ChatService as private property

### Session Lifecycle

1. **Application Start:**
   - ChatService constructor generates new session ID
   - Session ID stored in memory

2. **During Conversation:**
   - Same session ID used for all messages
   - Backend maintains conversation context using this ID

3. **Application Refresh:**
   - New session ID generated
   - Previous conversation context lost
   - Fresh conversation starts

### Future Enhancement Considerations

- Store session ID in localStorage for persistence across refreshes
- Implement "New Conversation" button to generate new session ID
- Display session ID to user for debugging purposes
- Allow user to restore previous session by entering session ID

## Message Processing

### Input Validation

```typescript
canSend(): boolean {
  return this.messageText.trim().length > 0 && !this.isSending;
}
```

**Validation Rules:**
- Message must not be empty string
- Message must not be only whitespace
- Cannot send while previous message is being processed

### Message Transformation

**User Message Creation:**
```typescript
const userMessage: Message = {
  id: crypto.randomUUID(),
  senderId: 'user',
  content: this.messageText.trim(),
  timestamp: new Date(),
  time: new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
};
```

**AI Message Creation:**
```typescript
const aiMessage: Message = {
  id: crypto.randomUUID(),
  senderId: 'ai',
  content: response.response,
  timestamp: new Date(),
  time: new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
};
```

### Date Separator Logic

```typescript
addMessage(message: Message): void {
  if (this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    const lastDate = new Date(lastMessage.timestamp).toDateString();
    const currentDate = new Date(message.timestamp).toDateString();
    
    if (lastDate !== currentDate) {
      message.isNewDay = true;
      message.dateLabel = this.formatDateLabel(message.timestamp);
    }
  } else {
    // First message
    message.isNewDay = true;
    message.dateLabel = this.formatDateLabel(message.timestamp);
  }
  
  this.messages.push(message);
}

formatDateLabel(date: Date): string {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const messageDate = new Date(date).toDateString();
  
  if (messageDate === today) return 'Today';
  if (messageDate === yesterday) return 'Yesterday';
  
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
```

## UI/UX Design

### Visual Design Principles

1. **Minimalism:** Clean interface with no unnecessary elements
2. **Clarity:** Clear distinction between user and AI messages
3. **Consistency:** Follow Freya-ng design patterns and color scheme
4. **Responsiveness:** Adapt to all screen sizes seamlessly

### Color Scheme (from Freya-ng)

- **User Messages:** 
  - Background: `bg-primary-100 dark:bg-primary-900`
  - Text: `text-surface-900 dark:text-surface-0`
  
- **AI Messages:**
  - Background: `bg-surface-100 dark:bg-surface-700`
  - Text: `text-surface-900 dark:text-surface-0`

- **Input Area:**
  - Border: `border-surface-200 dark:border-surface-700`
  - Background: `bg-surface-0 dark:bg-surface-900`

### Responsive Breakpoints

- **Mobile (< 768px):**
  - Full-width layout
  - Smaller padding and margins
  - Icon-only send button
  
- **Tablet (768px - 1279px):**
  - Moderate padding
  - Icon-only send button
  
- **Desktop (≥ 1280px):**
  - Maximum width container
  - Larger padding
  - Send button with label

### Animations

1. **Typing Indicator:**
   - Three dots with sequential fade animation
   - Animation duration: 1.5s
   - Infinite loop while waiting

2. **Message Entry:**
   - Fade-in animation when message appears
   - Duration: 200ms
   - Smooth scroll to bottom

3. **Button States:**
   - Hover: Slight color change
   - Disabled: Reduced opacity (0.6)
   - Active: Slight scale down

## Accessibility Features

### ARIA Labels

```html
<input 
  pInputText 
  [(ngModel)]="messageText"
  aria-label="Type your message"
  role="textbox"
/>

<p-button 
  icon="pi pi-send"
  aria-label="Send message"
  [attr.aria-disabled]="!canSend()"
/>

<div 
  class="messages-container"
  role="log"
  aria-live="polite"
  aria-relevant="additions"
>
```

### Keyboard Navigation

- Tab order: Input field → Send button
- Enter key: Send message (when input focused)
- Shift+Enter: Insert line break (multi-line support)
- Focus management: Return focus to input after sending

### Screen Reader Support

- Messages announced as they arrive (aria-live="polite")
- Clear labels for all interactive elements
- Status messages for loading and errors
- Semantic HTML structure

### Color Contrast

- All text meets WCAG AA standards (4.5:1 ratio minimum)
- Interactive elements have sufficient contrast
- Focus indicators visible and clear



## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Messages displayed in chronological order

*For any* set of messages with different timestamps, when displayed in the chat interface, they should be ordered by timestamp in ascending order (oldest first).

**Validates: Requirements 2.2**

### Property 2: Input field cleared after sending

*For any* valid message sent through the chat interface, the input field should be empty immediately after the send operation completes.

**Validates: Requirements 2.5**

### Property 3: Auto-scroll to latest message

*For any* new message added to the chat interface, the scroll position should be at the bottom of the messages container after the message is rendered.

**Validates: Requirements 2.6**

### Property 4: Message rendering includes all required fields

*For any* message displayed in the chat interface, the rendered output should contain the message content, sender identification, and timestamp.

**Validates: Requirements 3.1**

### Property 5: Timestamp formatting consistency

*For any* message timestamp, the formatted time string should match the HH:MM pattern (24-hour format with leading zeros).

**Validates: Requirements 3.4**

### Property 6: Date separators for different days

*For any* sequence of messages where consecutive messages have different dates, a date separator should be inserted between them.

**Validates: Requirements 3.5**

### Property 7: Message content preservation

*For any* message containing line breaks or special characters, the displayed content should preserve those line breaks and characters exactly as entered.

**Validates: Requirements 3.7**

### Property 8: Request payload completeness

*For any* message sent to the backend API, the request payload should include both the message text and a valid session_id.

**Validates: Requirements 4.3**

### Property 9: Response parsing correctness

*For any* valid JSON response from the backend API containing a "response" field, the Chat Service should successfully extract and return the AI message text.

**Validates: Requirements 4.4**

### Property 10: Error handling and transformation

*For any* HTTP error (network failure, timeout, 4xx, 5xx), the Chat Service should catch the error and return a user-friendly error message.

**Validates: Requirements 4.6**

### Property 11: HTTP headers presence

*For any* request made to the backend API, the HTTP headers should include "Content-Type: application/json".

**Validates: Requirements 4.7**

### Property 12: Session ID persistence

*For any* sequence of messages sent during a single application session, all requests should use the same session_id value.

**Validates: Requirements 5.2, 5.3**

### Property 13: Session ID format validation

*For any* generated session_id, it should match the UUID v4 format pattern (8-4-4-4-12 hexadecimal characters).

**Validates: Requirements 5.4**

### Property 14: Typing indicator on send

*For any* message send operation, the typing indicator should be visible immediately after the send button is clicked and before the response is received.

**Validates: Requirements 6.1**

### Property 15: Send button disabled while sending

*For any* time period while a message is being sent and awaiting response, the send button should be in a disabled state.

**Validates: Requirements 6.2**

### Property 16: Typing indicator removed on response

*For any* response received from the backend API (success or error), the typing indicator should be hidden immediately after the response is processed.

**Validates: Requirements 6.3**

### Property 17: Send button re-enabled after response

*For any* response received from the backend API (success or error), the send button should be re-enabled immediately after the response is processed.

**Validates: Requirements 6.4**

### Property 18: Error message display

*For any* error response from the backend API, the system should display an error message to the user that includes information about what went wrong.

**Validates: Requirements 7.2**

### Property 19: Retry capability after error

*For any* error that occurs during message sending, the send button should be enabled afterward to allow the user to retry.

**Validates: Requirements 7.4**

### Property 20: Error logging

*For any* error that occurs (network, API, parsing), the error should be logged to the browser console with sufficient detail for debugging.

**Validates: Requirements 7.5**

### Property 21: Message history maintenance

*For any* message sent or received during the session, it should be stored in the messages array and remain accessible throughout the session.

**Validates: Requirements 8.1, 8.2**

### Property 22: Complete message display

*For any* messages stored in the messages array, all of them should be rendered in the chat interface.

**Validates: Requirements 8.3**

### Property 23: Empty input validation

*For any* input value that is an empty string or contains only whitespace characters, the canSend() method should return false.

**Validates: Requirements 9.1, 9.2**

### Property 24: Message trimming

*For any* message with leading or trailing whitespace, the message sent to the backend should have that whitespace removed.

**Validates: Requirements 9.5**

### Property 25: ARIA labels presence

*For any* interactive element in the chat interface (input field, send button), it should have an appropriate aria-label attribute.

**Validates: Requirements 11.1**

### Property 26: Semantic HTML usage

*For any* major structural element in the chat interface, it should use semantic HTML elements (e.g., button for buttons, not div with click handlers).

**Validates: Requirements 11.4**

## Error Handling

### Error Categories

1. **Network Errors:**
   - Connection refused (backend not running)
   - DNS resolution failure
   - Network timeout
   - CORS errors

2. **HTTP Errors:**
   - 400 Bad Request (invalid message format)
   - 404 Not Found (incorrect endpoint)
   - 500 Internal Server Error (backend error)
   - 503 Service Unavailable (backend overloaded)

3. **Client Errors:**
   - JSON parsing failure
   - Invalid response format
   - Missing required fields in response

### Error Handling Strategy

```typescript
sendMessage(message: string, sessionId: string): Observable<ChatResponse> {
  return this.http.post<ChatResponse>(
    `${this.apiUrl}/api/chat`,
    { message, session_id: sessionId },
    { headers: { 'Content-Type': 'application/json' } }
  ).pipe(
    timeout(30000), // 30 second timeout
    catchError((error: HttpErrorResponse) => {
      let errorMessage: string;
      
      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = 'Unable to connect to the server. Please check your connection.';
      } else if (error.status === 0) {
        // Network error or CORS issue
        errorMessage = 'Unable to reach the server. Please ensure the backend is running.';
      } else if (error.status >= 400 && error.status < 500) {
        // Client error - use message from API if available
        errorMessage = error.error?.error || 'Invalid request. Please try again.';
      } else if (error.status >= 500) {
        // Server error
        errorMessage = 'Server error. Please try again later.';
      } else if (error.name === 'TimeoutError') {
        // Timeout
        errorMessage = 'Request timed out. Please try again.';
      } else {
        // Unknown error
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      console.error('Chat service error:', error);
      return throwError(() => new Error(errorMessage));
    })
  );
}
```

### Error Display

Errors should be displayed using PrimeNG Toast component:

```typescript
// In ChatComponent
private showError(message: string): void {
  this.messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000 // Auto-dismiss after 5 seconds
  });
}
```

### Error Recovery

1. **Automatic Recovery:**
   - Remove typing indicator
   - Re-enable send button
   - Keep user's message in input field (optional)

2. **User Actions:**
   - Retry button in error message
   - Manual retry by clicking send again
   - Clear error by sending new message

## Testing Strategy

### Dual Testing Approach

The application will use both unit tests and property-based tests for comprehensive coverage:

- **Unit tests:** Verify specific examples, edge cases, and error conditions
- **Property tests:** Verify universal properties across all inputs

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Testing

**Framework:** Jasmine + Karma (Angular default)

**Test Coverage:**
- Component initialization and lifecycle
- User interactions (button clicks, keyboard events)
- Error handling specific scenarios
- Edge cases (empty messages, special characters)
- Integration between components and services

**Example Unit Tests:**

```typescript
describe('ChatComponent', () => {
  it('should initialize with empty messages array', () => {
    expect(component.messages.length).toBe(0);
  });
  
  it('should disable send button when input is empty', () => {
    component.messageText = '';
    expect(component.canSend()).toBe(false);
  });
  
  it('should handle network error gracefully', () => {
    const error = new HttpErrorResponse({ status: 0 });
    // Test error handling
  });
});
```

### Property-Based Testing

**Framework:** fast-check (TypeScript property testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: angular-chatbot-interface, Property {number}: {property_text}`

**Example Property Tests:**

```typescript
import * as fc from 'fast-check';

describe('ChatComponent Properties', () => {
  // Feature: angular-chatbot-interface, Property 2: Input field cleared after sending
  it('should clear input field after sending any valid message', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (message) => {
          component.messageText = message;
          component.sendMessage();
          expect(component.messageText).toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: angular-chatbot-interface, Property 5: Timestamp formatting consistency
  it('should format all timestamps as HH:MM', () => {
    fc.assert(
      fc.property(
        fc.date(),
        (date) => {
          const formatted = component.formatTime(date);
          expect(formatted).toMatch(/^\d{2}:\d{2}$/);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: angular-chatbot-interface, Property 12: Session ID persistence
  it('should use same session ID for all messages in a session', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 10 }),
        (messages) => {
          const sessionIds = messages.map(msg => {
            // Capture session ID from each request
            return captureSessionId(msg);
          });
          
          const uniqueSessionIds = new Set(sessionIds);
          expect(uniqueSessionIds.size).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Organization

```
src/
├── app/
│   ├── components/
│   │   └── chat/
│   │       ├── chat.component.ts
│   │       ├── chat.component.spec.ts          # Unit tests
│   │       └── chat.component.property.spec.ts # Property tests
│   ├── services/
│   │   └── chat.service.ts
│   │       ├── chat.service.spec.ts            # Unit tests
│   │       └── chat.service.property.spec.ts   # Property tests
│   └── models/
│       └── chat.model.spec.ts                  # Model validation tests
```

### Testing Commands

```bash
# Run all tests
ng test

# Run tests with coverage
ng test --code-coverage

# Run tests in headless mode (CI)
ng test --browsers=ChromeHeadless --watch=false

# Run specific test file
ng test --include='**/chat.component.spec.ts'
```

### Coverage Goals

- Overall code coverage: 80%+
- Service layer: 90%+ (critical business logic)
- Component layer: 75%+ (UI logic)
- Models: 100% (simple validation logic)

## Performance Considerations

### Rendering Optimization

1. **Virtual Scrolling:**
   - For conversations with 100+ messages
   - Use Angular CDK Virtual Scroll
   - Only render visible messages + buffer

2. **Change Detection:**
   - Use OnPush change detection strategy
   - Immutable message updates
   - Minimize unnecessary re-renders

3. **Message Batching:**
   - If implementing typing indicators with character-by-character updates
   - Batch updates to reduce render cycles

### Memory Management

1. **Message Limit:**
   - Consider limiting stored messages to last 500
   - Implement message pruning for very long conversations
   - Warn user before clearing old messages

2. **Subscription Management:**
   - Unsubscribe from observables in ngOnDestroy
   - Use takeUntil pattern for automatic cleanup
   - Prevent memory leaks from long-lived subscriptions

### Network Optimization

1. **Request Debouncing:**
   - Not applicable for send button (intentional action)
   - Could apply to typing indicators if implemented

2. **Retry Strategy:**
   - No automatic retries (user-initiated only)
   - Prevents overwhelming backend during outages

3. **Timeout Configuration:**
   - 30 second timeout for API requests
   - Balance between user patience and backend processing time

## Security Considerations

### Input Sanitization

1. **XSS Prevention:**
   - Angular automatically sanitizes template bindings
   - Use Angular's DomSanitizer for any dynamic HTML
   - Never use innerHTML with user content

2. **Message Validation:**
   - Trim whitespace
   - Limit message length (e.g., 5000 characters)
   - Validate on both client and server

### API Security

1. **CORS Configuration:**
   - Backend must allow requests from frontend origin
   - Use specific origins, not wildcard in production

2. **Session Security:**
   - Session IDs are not authentication tokens
   - No sensitive data in session IDs
   - Session IDs are client-generated (no security implications)

3. **HTTPS:**
   - Use HTTPS in production
   - Prevent man-in-the-middle attacks
   - Secure cookie transmission if adding authentication

### Content Security Policy

```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               connect-src 'self' http://localhost:8080;
               style-src 'self' 'unsafe-inline';
               script-src 'self' 'unsafe-inline' 'unsafe-eval';">
```

## Deployment Considerations

### Build Configuration

**Development:**
```bash
ng serve
# Runs on http://localhost:4200
# API at http://localhost:8080
```

**Production:**
```bash
ng build --configuration production
# Output in dist/ directory
# Minified and optimized
```

### Environment Files

**environment.ts (development):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

**environment.prod.ts (production):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com'  // Production API URL
};
```

### Docker Deployment

**Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist/ts-chatbot-ai /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
  listen 80;
  server_name localhost;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # API proxy (if needed)
  location /api/ {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## Future Enhancements

### Phase 2 Features

1. **Message Persistence:**
   - Store conversation history in localStorage
   - Restore previous conversations
   - Export conversation as text/JSON

2. **Rich Message Support:**
   - Markdown rendering
   - Code syntax highlighting
   - Image/file attachments

3. **User Preferences:**
   - Theme selection (light/dark)
   - Font size adjustment
   - Message density options

4. **Advanced Features:**
   - Message search
   - Conversation branching
   - Message editing/deletion
   - Typing indicators (real-time)

### Scalability Considerations

1. **WebSocket Support:**
   - Real-time bidirectional communication
   - Streaming responses from AI
   - Lower latency

2. **Multi-Session Management:**
   - Switch between multiple conversations
   - Session list sidebar
   - Session naming and organization

3. **Collaboration Features:**
   - Share conversations
   - Multi-user chat rooms
   - Presence indicators

## Conclusion

This design provides a solid foundation for a minimalist Angular chatbot interface that integrates seamlessly with the go-function-calling-ai backend. The architecture emphasizes simplicity, maintainability, and user experience while maintaining the visual consistency of the Freya-ng template.

The dual testing approach (unit tests + property-based tests) ensures comprehensive coverage and correctness. The modular component structure allows for easy extension and modification as requirements evolve.

Key design decisions:
- Single-component architecture for simplicity
- Service-based API communication for separation of concerns
- Reactive programming with RxJS for async operations
- Comprehensive error handling for robust user experience
- Accessibility-first approach for inclusive design
- Property-based testing for correctness guarantees
