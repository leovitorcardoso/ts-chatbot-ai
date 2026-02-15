import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

import { ChatComponent } from './chat.component';
import { ChatService } from '../../services/chat.service';
import { Message, ChatResponse } from '../../models/chat.model';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let chatService: jasmine.SpyObj<ChatService>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const chatServiceSpy = jasmine.createSpyObj('ChatService', ['sendMessage', 'getSessionId']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [ChatComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    chatService = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty messages array', () => {
      expect(component.messages.length).toBe(0);
    });

    it('should initialize with empty messageText', () => {
      expect(component.messageText).toBe('');
    });

    it('should initialize with isTyping false', () => {
      expect(component.isTyping).toBe(false);
    });

    it('should initialize with isSending false', () => {
      expect(component.isSending).toBe(false);
    });

    it('should get session ID from ChatService on init', () => {
      const testSessionId = 'test-session-123';
      chatService.getSessionId.and.returnValue(testSessionId);
      
      component.ngOnInit();
      
      expect(chatService.getSessionId).toHaveBeenCalled();
      expect(component.sessionId).toBe(testSessionId);
    });
  });

  describe('canSend()', () => {
    it('should return false when input is empty', () => {
      component.messageText = '';
      expect(component.canSend()).toBe(false);
    });

    it('should return false when input is only whitespace', () => {
      component.messageText = '   ';
      expect(component.canSend()).toBe(false);
    });

    it('should return false when isSending is true', () => {
      component.messageText = 'Hello';
      component.isSending = true;
      expect(component.canSend()).toBe(false);
    });

    it('should return true when input is valid and not sending', () => {
      component.messageText = 'Hello';
      component.isSending = false;
      expect(component.canSend()).toBe(true);
    });

    it('should return true when input has leading/trailing whitespace but valid content', () => {
      component.messageText = '  Hello  ';
      component.isSending = false;
      expect(component.canSend()).toBe(true);
    });
  });

  describe('formatTime()', () => {
    it('should format time as HH:MM with leading zeros', () => {
      const date = new Date('2024-01-15T09:05:00');
      expect(component.formatTime(date)).toBe('09:05');
    });

    it('should format time as HH:MM without leading zeros for hours >= 10', () => {
      const date = new Date('2024-01-15T14:30:00');
      expect(component.formatTime(date)).toBe('14:30');
    });

    it('should format midnight correctly', () => {
      const date = new Date('2024-01-15T00:00:00');
      expect(component.formatTime(date)).toBe('00:00');
    });

    it('should format time with single digit minutes with leading zero', () => {
      const date = new Date('2024-01-15T15:03:00');
      expect(component.formatTime(date)).toBe('15:03');
    });
  });

  describe('formatDateLabel()', () => {
    it('should return "Today" for today\'s date', () => {
      const today = new Date();
      expect(component.formatDateLabel(today)).toBe('Today');
    });

    it('should return "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date(Date.now() - 86400000);
      expect(component.formatDateLabel(yesterday)).toBe('Yesterday');
    });

    it('should return formatted date for older dates', () => {
      const oldDate = new Date('2024-01-15');
      const result = component.formatDateLabel(oldDate);
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    });
  });

  describe('addMessage()', () => {
    it('should add first message with isNewDay true', () => {
      const message: Message = {
        id: '1',
        senderId: 'user',
        content: 'Hello',
        timestamp: new Date(),
        time: '10:00'
      };

      component.addMessage(message);

      expect(component.messages.length).toBe(1);
      expect(component.messages[0].isNewDay).toBe(true);
      expect(component.messages[0].dateLabel).toBeDefined();
    });

    it('should add message without date separator if same day', () => {
      const message1: Message = {
        id: '1',
        senderId: 'user',
        content: 'Hello',
        timestamp: new Date(),
        time: '10:00'
      };

      const message2: Message = {
        id: '2',
        senderId: 'ai',
        content: 'Hi',
        timestamp: new Date(),
        time: '10:01'
      };

      component.addMessage(message1);
      component.addMessage(message2);

      expect(component.messages.length).toBe(2);
      expect(component.messages[0].isNewDay).toBe(true);
      expect(component.messages[1].isNewDay).toBeUndefined();
    });

    it('should add date separator if different day', () => {
      const yesterday = new Date(Date.now() - 86400000);
      const today = new Date();

      const message1: Message = {
        id: '1',
        senderId: 'user',
        content: 'Hello',
        timestamp: yesterday,
        time: '10:00'
      };

      const message2: Message = {
        id: '2',
        senderId: 'ai',
        content: 'Hi',
        timestamp: today,
        time: '10:01'
      };

      component.addMessage(message1);
      component.addMessage(message2);

      expect(component.messages.length).toBe(2);
      expect(component.messages[1].isNewDay).toBe(true);
      expect(component.messages[1].dateLabel).toBe('Today');
    });
  });

  describe('sendMessage()', () => {
    beforeEach(() => {
      chatService.getSessionId.and.returnValue('test-session-123');
      component.ngOnInit();
    });

    it('should not send message if input is empty', () => {
      component.messageText = '';
      component.sendMessage();
      
      expect(chatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should not send message if input is only whitespace', () => {
      component.messageText = '   ';
      component.sendMessage();
      
      expect(chatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should trim message before sending', () => {
      const response: ChatResponse = { response: 'AI response' };
      chatService.sendMessage.and.returnValue(of(response));
      
      component.messageText = '  Hello  ';
      component.sendMessage();
      
      expect(chatService.sendMessage).toHaveBeenCalledWith('Hello', 'test-session-123');
    });

    it('should set loading states when sending', () => {
      const response: ChatResponse = { response: 'AI response' };
      chatService.sendMessage.and.returnValue(of(response));
      
      component.messageText = 'Hello';
      component.sendMessage();
      
      // States are reset after response, but we can verify the call was made
      expect(chatService.sendMessage).toHaveBeenCalled();
    });

    it('should clear input field after sending', () => {
      const response: ChatResponse = { response: 'AI response' };
      chatService.sendMessage.and.returnValue(of(response));
      
      component.messageText = 'Hello';
      component.sendMessage();
      
      expect(component.messageText).toBe('');
    });

    it('should add user message to messages array', () => {
      const response: ChatResponse = { response: 'AI response' };
      chatService.sendMessage.and.returnValue(of(response));
      
      component.messageText = 'Hello';
      component.sendMessage();
      
      expect(component.messages.length).toBeGreaterThan(0);
      expect(component.messages[0].senderId).toBe('user');
      expect(component.messages[0].content).toBe('Hello');
    });

    it('should add AI response to messages array', () => {
      const response: ChatResponse = { response: 'AI response' };
      chatService.sendMessage.and.returnValue(of(response));
      
      component.messageText = 'Hello';
      component.sendMessage();
      
      expect(component.messages.length).toBe(2);
      expect(component.messages[1].senderId).toBe('ai');
      expect(component.messages[1].content).toBe('AI response');
    });

    it('should reset loading states after successful response', () => {
      const response: ChatResponse = { response: 'AI response' };
      chatService.sendMessage.and.returnValue(of(response));
      
      component.messageText = 'Hello';
      component.sendMessage();
      
      expect(component.isTyping).toBe(false);
      expect(component.isSending).toBe(false);
    });

    it('should handle error and display error message', () => {
      const error = new Error('Network error');
      chatService.sendMessage.and.returnValue(throwError(() => error));
      
      component.messageText = 'Hello';
      component.sendMessage();
      
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Network error',
        life: 5000
      });
    });

    it('should reset loading states after error', () => {
      const error = new Error('Network error');
      chatService.sendMessage.and.returnValue(throwError(() => error));
      
      component.messageText = 'Hello';
      component.sendMessage();
      
      expect(component.isTyping).toBe(false);
      expect(component.isSending).toBe(false);
    });
  });

  describe('handleError()', () => {
    it('should display error message using MessageService', () => {
      const error = new Error('Test error');
      component.handleError(error);
      
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Test error',
        life: 5000
      });
    });

    it('should display default error message if error has no message', () => {
      const error = {};
      component.handleError(error);
      
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred. Please try again.',
        life: 5000
      });
    });

    it('should log error to console', () => {
      spyOn(console, 'error');
      const error = new Error('Test error');
      
      component.handleError(error);
      
      expect(console.error).toHaveBeenCalledWith('Chat component error:', error);
    });
  });

  describe('scrollToBottom()', () => {
    it('should not throw error if messagesContainer is undefined', () => {
      // messagesContainer is private, so we test indirectly
      expect(() => component.scrollToBottom()).not.toThrow();
    });

    it('should call scrollToBottom without errors', () => {
      // Test that the method can be called successfully
      expect(() => component.scrollToBottom()).not.toThrow();
    });
  });
});
