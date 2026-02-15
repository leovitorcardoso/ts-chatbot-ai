import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { ChatRequest, ChatResponse } from '../models/chat.model';
import { environment } from '../../environments/environment';

/**
 * ChatService
 * 
 * Service responsible for managing chat functionality including:
 * - Session management with UUID generation
 * - HTTP communication with backend API
 * - Message transformation and error handling
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.5, 4.7, 5.1, 5.4
 */
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  /**
   * Current session identifier
   * Generated once on service initialization
   */
  private sessionId: string;

  /**
   * Base URL for backend API
   * Loaded from environment configuration
   */
  private apiUrl: string = environment.apiUrl;

  /**
   * HTTP client for API communication
   */
  private http = inject(HttpClient);

  constructor() {
    // Generate session ID on service initialization
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate a unique UUID v4 session identifier
   * 
   * Uses crypto.randomUUID() for secure random UUID generation.
   * 
   * @returns UUID v4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
   */
  generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Get the current session ID
   * 
   * @returns Current session identifier
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Send a message to the backend API
   * 
   * Makes a POST request to /api/chat endpoint with the message and session_id.
   * Includes Content-Type: application/json header and 30-second timeout.
   * Handles network errors, HTTP errors, and transforms them into user-friendly messages.
   * 
   * @param message - User's message text
   * @param sessionId - Session identifier for context
   * @returns Observable<ChatResponse> containing the AI's response
   * 
   * Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 7.1, 7.2, 7.3, 7.5
   */
  sendMessage(message: string, sessionId: string): Observable<ChatResponse> {
    const requestBody: ChatRequest = {
      message,
      session_id: sessionId
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ChatResponse>(
      `${this.apiUrl}/api/chat`,
      requestBody,
      { headers }
    ).pipe(
      timeout(30000), // 30-second timeout
      catchError((error: any) => {
        let errorMessage: string;
        
        if (error.name === 'TimeoutError') {
          // Timeout error from RxJS
          errorMessage = 'Request timed out. Please try again.';
        } else if (error instanceof HttpErrorResponse) {
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
          } else {
            // Unknown HTTP error
            errorMessage = 'An unexpected error occurred. Please try again.';
          }
        } else {
          // Unknown error
          errorMessage = 'An unexpected error occurred. Please try again.';
        }
        
        // Log error to console for debugging
        console.error('Chat service error:', error);
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
