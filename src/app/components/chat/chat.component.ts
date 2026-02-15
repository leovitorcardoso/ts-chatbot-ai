import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../models/chat.model';

/**
 * ChatComponent
 * 
 * Main chat interface component that handles user interaction, message display,
 * and coordination with ChatService.
 * 
 * Responsibilities:
 * - Display messages in chronological order
 * - Handle user input and message sending
 * - Show loading states (typing indicator)
 * - Display errors using PrimeNG Toast
 * - Auto-scroll to latest messages
 * - Manage date separators
 * 
 * Requirements: 2.1, 2.2, 2.5, 2.6, 3.4, 3.5, 5.1, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 9.1, 9.2, 9.5, 9.6
 */
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked {
  /**
   * Array of all messages in the conversation
   */
  messages: Message[] = [];

  /**
   * Current input field value
   */
  messageText: string = '';

  /**
   * Whether AI is "typing" (waiting for response)
   */
  isTyping: boolean = false;

  /**
   * Whether a message is currently being sent
   */
  isSending: boolean = false;

  /**
   * Current session identifier
   */
  sessionId: string = '';

  /**
   * Reference to messages container for auto-scrolling
   */
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;

  /**
   * Flag to track if we need to scroll after view update
   */
  private shouldScroll: boolean = false;

  /**
   * Injected services
   */
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);

  /**
   * Initialize component
   * Generate session ID via service
   */
  ngOnInit(): void {
    this.sessionId = this.chatService.getSessionId();
  }

  /**
   * Handle auto-scrolling after view updates
   * Called after every change detection cycle
   */
  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  /**
   * Send message to backend
   * 
   * Validates input, calls ChatService.sendMessage(), handles loading states,
   * clears input field, adds user message and AI response to messages array.
   * 
   * Requirements: 2.5, 6.1, 6.2, 8.2, 9.4
   */
  sendMessage(): void {
    // Validate input
    if (!this.canSend()) {
      return;
    }

    // Trim and store message
    const trimmedMessage = this.messageText.trim();

    // Set loading states
    this.isSending = true;
    this.isTyping = true;

    // Create and add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      senderId: 'user',
      content: trimmedMessage,
      timestamp: new Date(),
      time: this.formatTime(new Date())
    };
    this.addMessage(userMessage);

    // Clear input field
    this.messageText = '';

    // Send message to backend
    this.chatService.sendMessage(trimmedMessage, this.sessionId).subscribe({
      next: (response) => {
        // Create and add AI message
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          senderId: 'ai',
          content: response.message,
          timestamp: new Date(),
          time: this.formatTime(new Date())
        };
        this.addMessage(aiMessage);

        // Reset loading states
        this.isTyping = false;
        this.isSending = false;
      },
      error: (error) => {
        // Handle error
        this.handleError(error);

        // Reset loading states
        this.isTyping = false;
        this.isSending = false;
      }
    });
  }

  /**
   * Handle Enter key press in input field
   * 
   * Enter: Send message
   * Shift+Enter: Insert line break (default textarea behavior)
   * 
   * Requirements: 10.1, 10.2, 10.3
   * 
   * @param event - Keyboard event
   */
  onEnterKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    
    // If Shift+Enter, allow default behavior (line break)
    if (keyboardEvent.shiftKey) {
      return;
    }

    // If just Enter, prevent default and send message
    event.preventDefault();
    this.sendMessage();
  }

  /**
   * Check if send button should be enabled
   * 
   * Message must not be empty/whitespace-only and not currently sending.
   * 
   * Requirements: 9.1, 9.2, 9.6
   * 
   * @returns true if message can be sent
   */
  canSend(): boolean {
    return this.messageText.trim().length > 0 && !this.isSending;
  }

  /**
   * Add message to list with date separator logic
   * 
   * Compares current message date with previous message date.
   * If dates differ, sets isNewDay = true and formats dateLabel.
   * 
   * Requirements: 2.2, 3.5, 8.1, 8.3
   * 
   * @param message - Message to add
   */
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
    this.shouldScroll = true;
  }

  /**
   * Format time as HH:MM
   * 
   * Requirements: 3.4
   * 
   * @param date - Date to format
   * @returns Formatted time string (e.g., "14:30")
   */
  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Format date label for separator
   * 
   * Returns "Today", "Yesterday", or "MMM DD, YYYY" format.
   * 
   * Requirements: 3.5
   * 
   * @param date - Date to format
   * @returns Formatted date string
   */
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

  /**
   * Scroll messages container to bottom
   * 
   * Requirements: 2.6
   */
  scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }

  /**
   * Display error message to user
   * 
   * Uses PrimeNG Toast to show error with 5-second auto-dismiss.
   * 
   * Requirements: 7.1, 7.2, 7.3, 7.4, 7.6
   * 
   * @param error - Error object
   */
  handleError(error: any): void {
    const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
    
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000
    });

    console.error('Chat component error:', error);
  }
}
