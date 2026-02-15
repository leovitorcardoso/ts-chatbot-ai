/**
 * Chat Models
 * 
 * This file contains all data models and interfaces for the chat functionality,
 * including Message, ChatRequest, and ChatResponse interfaces with type guards.
 */

/**
 * Message Interface
 * 
 * Represents a single chat message in the conversation.
 * 
 * @property id - Unique message identifier (UUID)
 * @property senderId - Who sent the message ('user' or 'ai')
 * @property content - Message text content
 * @property timestamp - When message was created
 * @property time - Formatted time string (HH:MM)
 * @property isNewDay - Whether to show date separator before this message
 * @property dateLabel - Formatted date string for separator
 */
export interface Message {
  id: string;
  senderId: 'user' | 'ai';
  content: string;
  timestamp: Date;
  time: string;
  isNewDay?: boolean;
  dateLabel?: string;
}

/**
 * Type guard to check if an object is a valid Message
 * 
 * @param obj - Object to validate
 * @returns true if obj is a valid Message
 */
export function isMessage(obj: any): obj is Message {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    (obj.senderId === 'user' || obj.senderId === 'ai') &&
    typeof obj.content === 'string' &&
    obj.timestamp instanceof Date &&
    typeof obj.time === 'string' &&
    (obj.isNewDay === undefined || typeof obj.isNewDay === 'boolean') &&
    (obj.dateLabel === undefined || typeof obj.dateLabel === 'string')
  );
}

/**
 * Type guard to check if senderId is valid
 * 
 * @param senderId - Value to validate
 * @returns true if senderId is 'user' or 'ai'
 */
export function isValidSenderId(senderId: any): senderId is 'user' | 'ai' {
  return senderId === 'user' || senderId === 'ai';
}

/**
 * ChatRequest Interface
 * 
 * Represents the request payload sent to the backend API.
 * 
 * @property message - User's message text
 * @property session_id - Session identifier for context
 */
export interface ChatRequest {
  message: string;
  session_id: string;
}

/**
 * Type guard to check if an object is a valid ChatRequest
 * 
 * @param obj - Object to validate
 * @returns true if obj is a valid ChatRequest
 */
export function isChatRequest(obj: any): obj is ChatRequest {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.message === 'string' &&
    typeof obj.session_id === 'string'
  );
}

/**
 * ChatResponse Interface
 * 
 * Represents the response received from the backend API.
 * 
 * @property response - AI's response text
 */
export interface ChatResponse {
  response: string;
}

/**
 * Type guard to check if an object is a valid ChatResponse
 * 
 * @param obj - Object to validate
 * @returns true if obj is a valid ChatResponse
 */
export function isChatResponse(obj: any): obj is ChatResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.response === 'string'
  );
}
