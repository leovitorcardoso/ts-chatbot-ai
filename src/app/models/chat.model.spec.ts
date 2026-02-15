/**
 * Unit Tests for Chat Models
 * 
 * Tests the Message, ChatRequest, and ChatResponse interfaces
 * and their type guard functions.
 * 
 * Requirements: 3.1, 4.3, 4.4
 */

import {
  Message,
  isMessage,
  isValidSenderId,
  ChatRequest,
  isChatRequest,
  ChatResponse,
  isChatResponse
} from './chat.model';

describe('Chat Models', () => {
  
  describe('Message Interface', () => {
    
    it('should create a valid Message object', () => {
      const message: Message = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        senderId: 'user',
        content: 'Hello, AI!',
        timestamp: new Date('2024-01-15T10:30:00'),
        time: '10:30'
      };
      
      expect(message.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(message.senderId).toBe('user');
      expect(message.content).toBe('Hello, AI!');
      expect(message.timestamp).toEqual(new Date('2024-01-15T10:30:00'));
      expect(message.time).toBe('10:30');
    });
    
    it('should create a Message with optional fields', () => {
      const message: Message = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        senderId: 'ai',
        content: 'Hello, human!',
        timestamp: new Date('2024-01-15T10:31:00'),
        time: '10:31',
        isNewDay: true,
        dateLabel: 'Today'
      };
      
      expect(message.isNewDay).toBe(true);
      expect(message.dateLabel).toBe('Today');
    });
    
    it('should accept "user" as senderId', () => {
      const message: Message = {
        id: '123',
        senderId: 'user',
        content: 'Test',
        timestamp: new Date(),
        time: '10:00'
      };
      
      expect(message.senderId).toBe('user');
    });
    
    it('should accept "ai" as senderId', () => {
      const message: Message = {
        id: '123',
        senderId: 'ai',
        content: 'Test',
        timestamp: new Date(),
        time: '10:00'
      };
      
      expect(message.senderId).toBe('ai');
    });
  });
  
  describe('isMessage type guard', () => {
    
    it('should return true for valid Message object', () => {
      const validMessage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        senderId: 'user',
        content: 'Hello',
        timestamp: new Date(),
        time: '10:30'
      };
      
      expect(isMessage(validMessage)).toBe(true);
    });
    
    it('should return true for Message with optional fields', () => {
      const validMessage = {
        id: '123',
        senderId: 'ai',
        content: 'Hello',
        timestamp: new Date(),
        time: '10:30',
        isNewDay: true,
        dateLabel: 'Today'
      };
      
      expect(isMessage(validMessage)).toBe(true);
    });
    
    it('should return false for null', () => {
      expect(isMessage(null)).toBe(false);
    });
    
    it('should return false for undefined', () => {
      expect(isMessage(undefined)).toBe(false);
    });
    
    it('should return false for non-object', () => {
      expect(isMessage('string')).toBe(false);
      expect(isMessage(123)).toBe(false);
      expect(isMessage(true)).toBe(false);
    });
    
    it('should return false when id is missing', () => {
      const invalidMessage = {
        senderId: 'user',
        content: 'Hello',
        timestamp: new Date(),
        time: '10:30'
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
    
    it('should return false when id is not a string', () => {
      const invalidMessage = {
        id: 123,
        senderId: 'user',
        content: 'Hello',
        timestamp: new Date(),
        time: '10:30'
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
    
    it('should return false when senderId is invalid', () => {
      const invalidMessage = {
        id: '123',
        senderId: 'bot',
        content: 'Hello',
        timestamp: new Date(),
        time: '10:30'
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
    
    it('should return false when content is missing', () => {
      const invalidMessage = {
        id: '123',
        senderId: 'user',
        timestamp: new Date(),
        time: '10:30'
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
    
    it('should return false when content is not a string', () => {
      const invalidMessage = {
        id: '123',
        senderId: 'user',
        content: 123,
        timestamp: new Date(),
        time: '10:30'
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
    
    it('should return false when timestamp is missing', () => {
      const invalidMessage = {
        id: '123',
        senderId: 'user',
        content: 'Hello',
        time: '10:30'
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
    
    it('should return false when timestamp is not a Date', () => {
      const invalidMessage = {
        id: '123',
        senderId: 'user',
        content: 'Hello',
        timestamp: '2024-01-15',
        time: '10:30'
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
    
    it('should return false when time is missing', () => {
      const invalidMessage = {
        id: '123',
        senderId: 'user',
        content: 'Hello',
        timestamp: new Date()
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
    
    it('should return false when time is not a string', () => {
      const invalidMessage = {
        id: '123',
        senderId: 'user',
        content: 'Hello',
        timestamp: new Date(),
        time: 1030
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
    
    it('should return false when isNewDay is not a boolean', () => {
      const invalidMessage = {
        id: '123',
        senderId: 'user',
        content: 'Hello',
        timestamp: new Date(),
        time: '10:30',
        isNewDay: 'true'
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
    
    it('should return false when dateLabel is not a string', () => {
      const invalidMessage = {
        id: '123',
        senderId: 'user',
        content: 'Hello',
        timestamp: new Date(),
        time: '10:30',
        dateLabel: 123
      };
      
      expect(isMessage(invalidMessage)).toBe(false);
    });
  });
  
  describe('isValidSenderId type guard', () => {
    
    it('should return true for "user"', () => {
      expect(isValidSenderId('user')).toBe(true);
    });
    
    it('should return true for "ai"', () => {
      expect(isValidSenderId('ai')).toBe(true);
    });
    
    it('should return false for invalid string', () => {
      expect(isValidSenderId('bot')).toBe(false);
      expect(isValidSenderId('admin')).toBe(false);
      expect(isValidSenderId('')).toBe(false);
    });
    
    it('should return false for non-string values', () => {
      expect(isValidSenderId(123)).toBe(false);
      expect(isValidSenderId(null)).toBe(false);
      expect(isValidSenderId(undefined)).toBe(false);
      expect(isValidSenderId({})).toBe(false);
    });
  });
  
  describe('ChatRequest Interface', () => {
    
    it('should create a valid ChatRequest object', () => {
      const request: ChatRequest = {
        message: 'Hello, AI!',
        session_id: '550e8400-e29b-41d4-a716-446655440000'
      };
      
      expect(request.message).toBe('Hello, AI!');
      expect(request.session_id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
    
    it('should accept empty message string', () => {
      const request: ChatRequest = {
        message: '',
        session_id: '550e8400-e29b-41d4-a716-446655440000'
      };
      
      expect(request.message).toBe('');
    });
    
    it('should accept message with special characters', () => {
      const request: ChatRequest = {
        message: 'Hello! How are you?\nI\'m fine.',
        session_id: '550e8400-e29b-41d4-a716-446655440000'
      };
      
      expect(request.message).toContain('\n');
      expect(request.message).toContain('\'');
    });
  });
  
  describe('isChatRequest type guard', () => {
    
    it('should return true for valid ChatRequest object', () => {
      const validRequest = {
        message: 'Hello',
        session_id: '550e8400-e29b-41d4-a716-446655440000'
      };
      
      expect(isChatRequest(validRequest)).toBe(true);
    });
    
    it('should return false for null', () => {
      expect(isChatRequest(null)).toBe(false);
    });
    
    it('should return false for undefined', () => {
      expect(isChatRequest(undefined)).toBe(false);
    });
    
    it('should return false for non-object', () => {
      expect(isChatRequest('string')).toBe(false);
      expect(isChatRequest(123)).toBe(false);
    });
    
    it('should return false when message is missing', () => {
      const invalidRequest = {
        session_id: '550e8400-e29b-41d4-a716-446655440000'
      };
      
      expect(isChatRequest(invalidRequest)).toBe(false);
    });
    
    it('should return false when message is not a string', () => {
      const invalidRequest = {
        message: 123,
        session_id: '550e8400-e29b-41d4-a716-446655440000'
      };
      
      expect(isChatRequest(invalidRequest)).toBe(false);
    });
    
    it('should return false when session_id is missing', () => {
      const invalidRequest = {
        message: 'Hello'
      };
      
      expect(isChatRequest(invalidRequest)).toBe(false);
    });
    
    it('should return false when session_id is not a string', () => {
      const invalidRequest = {
        message: 'Hello',
        session_id: 123
      };
      
      expect(isChatRequest(invalidRequest)).toBe(false);
    });
    
    it('should return true for empty strings', () => {
      const validRequest = {
        message: '',
        session_id: ''
      };
      
      expect(isChatRequest(validRequest)).toBe(true);
    });
  });
  
  describe('ChatResponse Interface', () => {
    
    it('should create a valid ChatResponse object', () => {
      const response: ChatResponse = {
        response: 'Hello, human! How can I help you?'
      };
      
      expect(response.response).toBe('Hello, human! How can I help you?');
    });
    
    it('should accept empty response string', () => {
      const response: ChatResponse = {
        response: ''
      };
      
      expect(response.response).toBe('');
    });
    
    it('should accept response with special characters', () => {
      const response: ChatResponse = {
        response: 'Sure! Here\'s the code:\n```javascript\nconsole.log("Hello");\n```'
      };
      
      expect(response.response).toContain('\n');
      expect(response.response).toContain('```');
    });
  });
  
  describe('isChatResponse type guard', () => {
    
    it('should return true for valid ChatResponse object', () => {
      const validResponse = {
        response: 'Hello, human!'
      };
      
      expect(isChatResponse(validResponse)).toBe(true);
    });
    
    it('should return false for null', () => {
      expect(isChatResponse(null)).toBe(false);
    });
    
    it('should return false for undefined', () => {
      expect(isChatResponse(undefined)).toBe(false);
    });
    
    it('should return false for non-object', () => {
      expect(isChatResponse('string')).toBe(false);
      expect(isChatResponse(123)).toBe(false);
    });
    
    it('should return false when response is missing', () => {
      const invalidResponse = {};
      
      expect(isChatResponse(invalidResponse)).toBe(false);
    });
    
    it('should return false when response is not a string', () => {
      const invalidResponse = {
        response: 123
      };
      
      expect(isChatResponse(invalidResponse)).toBe(false);
    });
    
    it('should return true for empty response string', () => {
      const validResponse = {
        response: ''
      };
      
      expect(isChatResponse(validResponse)).toBe(true);
    });
  });
  
  describe('Edge Cases', () => {
    
    it('should handle Message with very long content', () => {
      const longContent = 'a'.repeat(10000);
      const message: Message = {
        id: '123',
        senderId: 'user',
        content: longContent,
        timestamp: new Date(),
        time: '10:30'
      };
      
      expect(message.content.length).toBe(10000);
      expect(isMessage(message)).toBe(true);
    });
    
    it('should handle ChatRequest with very long message', () => {
      const longMessage = 'a'.repeat(10000);
      const request: ChatRequest = {
        message: longMessage,
        session_id: '550e8400-e29b-41d4-a716-446655440000'
      };
      
      expect(request.message.length).toBe(10000);
      expect(isChatRequest(request)).toBe(true);
    });
    
    it('should handle Message with Unicode characters', () => {
      const message: Message = {
        id: '123',
        senderId: 'user',
        content: '你好 🌍 مرحبا',
        timestamp: new Date(),
        time: '10:30'
      };
      
      expect(isMessage(message)).toBe(true);
      expect(message.content).toContain('你好');
      expect(message.content).toContain('🌍');
    });
    
    it('should handle ChatRequest with line breaks', () => {
      const request: ChatRequest = {
        message: 'Line 1\nLine 2\r\nLine 3',
        session_id: '550e8400-e29b-41d4-a716-446655440000'
      };
      
      expect(isChatRequest(request)).toBe(true);
      expect(request.message).toContain('\n');
    });
    
    it('should handle Message with Date at edge of day', () => {
      const message: Message = {
        id: '123',
        senderId: 'user',
        content: 'Test',
        timestamp: new Date('2024-01-15T23:59:59'),
        time: '23:59'
      };
      
      expect(isMessage(message)).toBe(true);
    });
  });
});
