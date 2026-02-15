import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatService } from './chat.service';
import { environment } from '../../environments/environment';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Session Management', () => {
    it('should generate a session ID on initialization', () => {
      const sessionId = service.getSessionId();
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
    });

    it('should generate a valid UUID v4 format', () => {
      const sessionId = service.getSessionId();
      // UUID v4 format: 8-4-4-4-12 hexadecimal characters
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(sessionId).toMatch(uuidV4Regex);
    });

    it('should return the same session ID for multiple calls', () => {
      const sessionId1 = service.getSessionId();
      const sessionId2 = service.getSessionId();
      expect(sessionId1).toBe(sessionId2);
    });

    it('should generate different session IDs for different service instances', () => {
      const service1 = TestBed.inject(ChatService);
      
      // Create a new TestBed instance for the second service
      const service2 = TestBed.runInInjectionContext(() => {
        return new ChatService();
      });
      
      const sessionId1 = service1.getSessionId();
      const sessionId2 = service2.getSessionId();
      
      expect(sessionId1).not.toBe(sessionId2);
    });

    it('generateSessionId() should return a valid UUID v4', () => {
      const sessionId = service.generateSessionId();
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(sessionId).toMatch(uuidV4Regex);
    });

    it('generateSessionId() should return different UUIDs on each call', () => {
      const id1 = service.generateSessionId();
      const id2 = service.generateSessionId();
      const id3 = service.generateSessionId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });

  describe('sendMessage()', () => {
    it('should be defined', () => {
      expect(service.sendMessage).toBeDefined();
    });

    it('should return an Observable', (done) => {
      const result = service.sendMessage('test message', 'test-session-id');
      expect(result).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
      
      result.subscribe({
        next: () => {
          done();
        }
      });
      
      // Clean up pending request
      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      req.flush({ response: 'test response' });
    });

    it('should make POST request to correct endpoint', () => {
      service.sendMessage('Hello', 'session-123').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      expect(req.request.method).toBe('POST');
      req.flush({ response: 'Hi there!' });
    });

    it('should include message and session_id in request body', () => {
      const message = 'Test message';
      const sessionId = 'test-session-id';

      service.sendMessage(message, sessionId).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      expect(req.request.body).toEqual({
        message: message,
        session_id: sessionId
      });
      req.flush({ response: 'Response' });
    });

    it('should include Content-Type header', () => {
      service.sendMessage('Test', 'session-123').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({ response: 'Response' });
    });

    it('should successfully parse valid response', (done) => {
      const mockResponse = { response: 'AI response text' };

      service.sendMessage('Hello', 'session-123').subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      req.flush(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle network error (status 0)', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');

      service.sendMessage('Test', 'session-123').subscribe({
        error: (error) => {
          expect(error.message).toBe('Unable to reach the server. Please ensure the backend is running.');
          expect(consoleErrorSpy).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    });

    it('should handle 400 Bad Request with API error message', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');
      const apiErrorMessage = 'Invalid message format';

      service.sendMessage('Test', 'session-123').subscribe({
        error: (error) => {
          expect(error.message).toBe(apiErrorMessage);
          expect(consoleErrorSpy).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      req.flush({ error: apiErrorMessage }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 400 Bad Request without API error message', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');

      service.sendMessage('Test', 'session-123').subscribe({
        error: (error) => {
          expect(error.message).toBe('Invalid request. Please try again.');
          expect(consoleErrorSpy).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      req.flush({}, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 404 Not Found', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');

      service.sendMessage('Test', 'session-123').subscribe({
        error: (error) => {
          expect(error.message).toBe('Invalid request. Please try again.');
          expect(consoleErrorSpy).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      req.flush({}, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 Internal Server Error', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');

      service.sendMessage('Test', 'session-123').subscribe({
        error: (error) => {
          expect(error.message).toBe('Server error. Please try again later.');
          expect(consoleErrorSpy).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 503 Service Unavailable', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');

      service.sendMessage('Test', 'session-123').subscribe({
        error: (error) => {
          expect(error.message).toBe('Server error. Please try again later.');
          expect(consoleErrorSpy).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      req.flush({}, { status: 503, statusText: 'Service Unavailable' });
    });

    it('should log all errors to console', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');

      service.sendMessage('Test', 'session-123').subscribe({
        error: () => {
          expect(consoleErrorSpy).toHaveBeenCalledWith('Chat service error:', jasmine.any(Object));
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    });

    it('should handle client-side ErrorEvent', (done) => {
      const consoleErrorSpy = spyOn(console, 'error');

      service.sendMessage('Test', 'session-123').subscribe({
        error: (error) => {
          expect(error.message).toBe('Unable to connect to the server. Please check your connection.');
          expect(consoleErrorSpy).toHaveBeenCalled();
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/chat`);
      const errorEvent = new ErrorEvent('Network error', {
        message: 'Connection failed'
      });
      req.error(errorEvent);
    });
  });
});
