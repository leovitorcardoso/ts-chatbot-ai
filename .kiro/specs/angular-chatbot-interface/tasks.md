# Implementation Plan: Angular Chatbot Interface

## Overview

This implementation plan breaks down the Angular chatbot interface into discrete, incremental steps. Each task builds on previous work, with testing integrated throughout to catch errors early. The plan follows a bottom-up approach: models → services → components → integration.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Angular 21 project with minimal configuration
  - Install and configure PrimeNG, Tailwind CSS, and RxJS dependencies
  - Set up environment configuration files for API URL
  - Configure TypeScript strict mode and compiler options
  - Set up testing framework (Jasmine/Karma) and install fast-check for property testing
  - Create basic project structure (components, services, models directories)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 12.1, 12.2, 12.3, 12.4_

- [ ] 2. Define data models and interfaces
  - [x] 2.1 Create Message interface with all required fields
    - Define Message interface with id, senderId, content, timestamp, time, isNewDay, dateLabel
    - Add TypeScript type guards for Message validation
    - _Requirements: 3.1, 3.4_
  
  - [x] 2.2 Create ChatRequest and ChatResponse interfaces
    - Define ChatRequest interface with message and session_id fields
    - Define ChatResponse interface with response field
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [x] 2.3 Write unit tests for model validation
    - Test Message interface structure
    - Test ChatRequest/ChatResponse interfaces
    - _Requirements: 3.1, 4.3, 4.4_

- [ ] 3. Implement ChatService with API communication
  - [x] 3.1 Create ChatService with session management
    - Generate UUID v4 session ID on service initialization
    - Implement generateSessionId() method using crypto.randomUUID()
    - Store session ID as private property
    - _Requirements: 5.1, 5.4_
  
  - [x] 3.2 Implement sendMessage() method with HTTP communication
    - Create POST request to /api/chat endpoint
    - Include message and session_id in request body
    - Set Content-Type: application/json header
    - Configure 30-second timeout
    - Return Observable<ChatResponse>
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.7_
  
  - [x] 3.3 Implement comprehensive error handling
    - Handle network errors (connection refused, timeout)
    - Handle HTTP errors (4xx, 5xx status codes)
    - Transform errors into user-friendly messages
    - Log all errors to console
    - _Requirements: 4.6, 7.1, 7.2, 7.3, 7.5_
  
  - [x] 3.4 Write property test for session ID persistence
    - **Property 12: Session ID persistence**
    - **Validates: Requirements 5.2, 5.3**
  
  - [x] 3.5 Write property test for session ID format
    - **Property 13: Session ID format validation**
    - **Validates: Requirements 5.4**
  
  - [x] 3.6 Write property test for request payload completeness
    - **Property 8: Request payload completeness**
    - **Validates: Requirements 4.3**
  
  - [x] 3.7 Write property test for HTTP headers
    - **Property 11: HTTP headers presence**
    - **Validates: Requirements 4.7**
  
  - [x] 3.8 Write property test for response parsing
    - **Property 9: Response parsing correctness**
    - **Validates: Requirements 4.4**
  
  - [x] 3.9 Write property test for error handling
    - **Property 10: Error handling and transformation**
    - **Validates: Requirements 4.6**
  
  - [x] 3.10 Write unit tests for ChatService
    - Test service initialization and session ID generation
    - Test specific error scenarios (network error, timeout, 404, 500)
    - Test API endpoint configuration from environment
    - _Requirements: 5.1, 7.1, 7.3, 12.2, 12.3_

- [x] 4. Checkpoint - Ensure service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement ChatComponent core functionality
  - [x] 5.1 Create ChatComponent with basic structure
    - Set up component class with properties (messages, messageText, isTyping, isSending, sessionId)
    - Inject ChatService and MessageService (for error toasts)
    - Initialize component in ngOnInit (generate session ID via service)
    - _Requirements: 2.1, 5.1_
  
  - [x] 5.2 Implement message sending logic
    - Create sendMessage() method with input validation
    - Call ChatService.sendMessage() with current message and session ID
    - Handle loading states (isTyping, isSending)
    - Clear input field after successful send
    - Add user message to messages array
    - Add AI response to messages array
    - _Requirements: 2.5, 6.1, 6.2, 8.2, 9.4_
  
  - [x] 5.3 Implement input validation logic
    - Create canSend() method checking for empty/whitespace-only input
    - Trim whitespace from messages before sending
    - Disable send button when input is invalid or sending
    - _Requirements: 9.1, 9.2, 9.5, 9.6_
  
  - [x] 5.4 Implement message display logic
    - Create addMessage() method with date separator logic
    - Implement formatTime() method for HH:MM formatting
    - Implement formatDateLabel() method for date separators
    - Sort messages by timestamp
    - _Requirements: 2.2, 3.4, 3.5, 8.1, 8.3_
  
  - [x] 5.5 Implement auto-scroll functionality
    - Add ViewChild reference to messages container
    - Implement scrollToBottom() method
    - Call scroll in ngAfterViewChecked when new messages added
    - _Requirements: 2.6_
  
  - [x] 5.6 Implement error handling in component
    - Subscribe to ChatService errors
    - Display error messages using PrimeNG Toast
    - Re-enable send button after errors
    - Remove typing indicator on errors
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_
  
  - [x] 5.7 Write property test for input field clearing
    - **Property 2: Input field cleared after sending**
    - **Validates: Requirements 2.5**
  
  - [x] 5.8 Write property test for message ordering
    - **Property 1: Messages displayed in chronological order**
    - **Validates: Requirements 2.2**
  
  - [x] 5.9 Write property test for auto-scroll
    - **Property 3: Auto-scroll to latest message**
    - **Validates: Requirements 2.6**
  
  - [x] 5.10 Write property test for timestamp formatting
    - **Property 5: Timestamp formatting consistency**
    - **Validates: Requirements 3.4**
  
  - [x] 5.11 Write property test for date separators
    - **Property 6: Date separators for different days**
    - **Validates: Requirements 3.5**
  
  - [x] 5.12 Write property test for message content preservation
    - **Property 7: Message content preservation**
    - **Validates: Requirements 3.7**
  
  - [x] 5.13 Write property test for message trimming
    - **Property 24: Message trimming**
    - **Validates: Requirements 9.5**
  
  - [x] 5.14 Write property test for empty input validation
    - **Property 23: Empty input validation**
    - **Validates: Requirements 9.1, 9.2**
  
  - [x] 5.15 Write unit tests for ChatComponent logic
    - Test component initialization
    - Test canSend() with various inputs
    - Test message formatting methods
    - Test error handling specific scenarios
    - _Requirements: 2.1, 9.1, 9.2, 3.4, 3.5, 7.1_

- [ ] 6. Create ChatComponent template with UI
  - [x] 6.1 Build messages display area
    - Create scrollable messages container with ViewChild reference
    - Add date separator rendering with conditional display
    - Add user message rendering (right-aligned, primary background)
    - Add AI message rendering (left-aligned, surface background)
    - Add typing indicator with animated dots
    - Use PrimeNG Avatar for potential future sender icons
    - _Requirements: 2.1, 2.2, 3.2, 3.3, 6.5_
  
  - [x] 6.2 Build input area with send functionality
    - Create input field with pInputText directive
    - Bind input to messageText with [(ngModel)]
    - Add Enter key handler to send message
    - Add Shift+Enter support for line breaks (textarea)
    - Create send button with PrimeNG Button component
    - Bind button disabled state to canSend() method
    - Add send icon (pi pi-send)
    - _Requirements: 2.3, 2.4, 9.4, 9.7, 10.1, 10.2, 10.3_
  
  - [x] 6.3 Apply Tailwind CSS styling
    - Style messages container with proper spacing and overflow
    - Style user messages (bg-primary-100, right-aligned)
    - Style AI messages (bg-surface-100, left-aligned)
    - Style input area with border and padding
    - Add responsive classes for mobile/tablet/desktop
    - Ensure visual consistency with Freya-ng design
    - _Requirements: 1.3, 2.7, 2.8, 3.2, 3.3_
  
  - [x] 6.4 Add accessibility attributes
    - Add aria-label to input field ("Type your message")
    - Add aria-label to send button ("Send message")
    - Add role="log" and aria-live="polite" to messages container
    - Add aria-disabled to send button when disabled
    - Use semantic HTML (button element, not div)
    - _Requirements: 11.1, 11.4, 11.6, 11.7_
  
  - [x] 6.5 Write property test for message rendering
    - **Property 4: Message rendering includes all required fields**
    - **Validates: Requirements 3.1**
  
  - [x] 6.6 Write property test for ARIA labels
    - **Property 25: ARIA labels presence**
    - **Validates: Requirements 11.1**
  
  - [x] 6.7 Write property test for semantic HTML
    - **Property 26: Semantic HTML usage**
    - **Validates: Requirements 11.4**
  
  - [x] 6.8 Write unit tests for template rendering
    - Test that input field exists
    - Test that send button exists
    - Test that messages container exists
    - Test ARIA attributes presence
    - _Requirements: 2.3, 2.4, 11.7_

- [ ] 7. Implement loading states and indicators
  - [x] 7.1 Add typing indicator component logic
    - Show typing indicator when isTyping is true
    - Hide typing indicator when response received or error occurs
    - Position indicator in messages area
    - _Requirements: 6.1, 6.3, 6.5_
  
  - [x] 7.2 Implement send button state management
    - Disable button when isSending is true
    - Disable button when input is invalid (canSend() returns false)
    - Re-enable button after response or error
    - Add visual feedback for disabled state
    - _Requirements: 6.2, 6.4, 9.7_
  
  - [x] 7.3 Write property test for typing indicator display
    - **Property 14: Typing indicator on send**
    - **Validates: Requirements 6.1**
  
  - [x] 7.4 Write property test for typing indicator removal
    - **Property 16: Typing indicator removed on response**
    - **Validates: Requirements 6.3**
  
  - [x] 7.5 Write property test for send button disabled state
    - **Property 15: Send button disabled while sending**
    - **Validates: Requirements 6.2**
  
  - [x] 7.6 Write property test for send button re-enabled
    - **Property 17: Send button re-enabled after response**
    - **Validates: Requirements 6.4**
  
  - [x] 7.7 Write unit tests for loading states
    - Test typing indicator visibility during send
    - Test button disabled state during send
    - Test state reset after response
    - Test state reset after error
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Checkpoint - Ensure component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement error display with PrimeNG Toast
  - [x] 9.1 Add MessageService and Toast component
    - Import MessageService from PrimeNG
    - Add p-toast component to template
    - Inject MessageService into ChatComponent
    - _Requirements: 7.6_
  
  - [x] 9.2 Create error display method
    - Implement showError() method using MessageService
    - Configure toast with error severity and 5-second auto-dismiss
    - Display user-friendly error messages
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7_
  
  - [x] 9.3 Write property test for error message display
    - **Property 18: Error message display**
    - **Validates: Requirements 7.2**
  
  - [x] 9.4 Write property test for retry capability
    - **Property 19: Retry capability after error**
    - **Validates: Requirements 7.4**
  
  - [x] 9.5 Write property test for error logging
    - **Property 20: Error logging**
    - **Validates: Requirements 7.5**
  
  - [x] 9.6 Write unit tests for error display
    - Test error toast appears with correct message
    - Test error toast auto-dismisses
    - Test multiple errors display correctly
    - _Requirements: 7.1, 7.2, 7.3, 7.6_

- [ ] 10. Implement message history management
  - [x] 10.1 Add message storage logic
    - Ensure messages array maintains all sent and received messages
    - Implement message appending in correct order
    - Preserve message history during session
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 10.2 Implement message display logic
    - Render all messages from messages array
    - Ensure UI displays complete message history
    - Handle empty state (no messages yet)
    - _Requirements: 2.1, 8.3_
  
  - [x] 10.3 Write property test for message history maintenance
    - **Property 21: Message history maintenance**
    - **Validates: Requirements 8.1, 8.2**
  
  - [x] 10.4 Write property test for complete message display
    - **Property 22: Complete message display**
    - **Validates: Requirements 8.3**
  
  - [x] 10.5 Write unit tests for message history
    - Test messages array grows with each message
    - Test messages persist during session
    - Test empty state handling
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 11. Wire up AppComponent and routing
  - [x] 11.1 Configure AppComponent as root
    - Import ChatComponent into AppComponent
    - Add ChatComponent to template
    - Configure basic layout structure
    - _Requirements: 1.5_
  
  - [x] 11.2 Set up minimal routing (if needed)
    - Configure app.routes.ts with default route to chat
    - Set up router outlet in AppComponent
    - _Requirements: 1.5_
  
  - [x] 11.3 Configure PrimeNG theme and global styles
    - Import PrimeNG theme CSS
    - Configure Tailwind CSS with PrimeNG integration
    - Add global styles for dark mode support
    - Ensure Freya-ng visual consistency
    - _Requirements: 1.2, 1.3, 2.8_
  
  - [x] 11.4 Write integration tests for app initialization
    - Test app loads without errors
    - Test ChatComponent renders in AppComponent
    - Test initial state is correct
    - _Requirements: 2.1_

- [ ] 12. Final integration and end-to-end testing
  - [x] 12.1 Test complete user flow
    - Manually test sending messages and receiving responses
    - Test error scenarios (backend down, network error)
    - Test keyboard shortcuts (Enter, Shift+Enter)
    - Test responsive design on different screen sizes
    - Test accessibility with keyboard navigation
    - _Requirements: 2.7, 9.4, 10.1, 10.2, 11.2_
  
  - [x] 12.2 Verify all acceptance criteria
    - Review requirements document
    - Verify each requirement is implemented
    - Test edge cases and error conditions
    - _Requirements: All_
  
  - [x] 12.3 Run full test suite
    - Execute all unit tests
    - Execute all property tests (100+ iterations each)
    - Generate coverage report
    - Ensure 80%+ coverage
    - _Requirements: All_

- [ ] 13. Documentation and cleanup
  - [x] 13.1 Create comprehensive README.md
    - Add project description and features
    - Document prerequisites (Node.js, Angular CLI)
    - Provide installation instructions
    - Document environment configuration
    - Add usage examples and screenshots
    - Document API integration details
    - Explain testing approach
    - _Requirements: 1.7, 12.1, 12.2, 12.3_
  
  - [x] 13.2 Add code comments and documentation
    - Document all public methods with JSDoc comments
    - Add inline comments for complex logic
    - Document component inputs/outputs
    - Document service methods
    - _Requirements: 1.5_
  
  - [x] 13.3 Clean up unused code and dependencies
    - Remove any unused imports
    - Remove any unused dependencies from package.json
    - Ensure minimal project structure
    - Run linter and fix issues
    - _Requirements: 1.2, 1.5, 1.7_

- [x] 14. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.
  - Verify application runs successfully with backend
  - Confirm all requirements are met
  - Review code quality and documentation

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration happens incrementally - no orphaned code
- Testing is integrated throughout, not saved for the end
- Focus on minimal implementation - only chat functionality, no extras
