import { v4 as uuidv4 } from 'uuid';
import { User, IUser } from '../models/User';
import { EditSession } from '../models/EditSession';
import { logger } from '../middleware/logging';

export interface SessionData {
  sessionId: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  preferences?: Partial<IUser['preferences']>;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export class UserSessionService {
  private static instance: UserSessionService;
  private sessions: Map<string, SessionData> = new Map();
  private sessionTimeout: number = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Clean up expired sessions every hour
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);
  }

  public static getInstance(): UserSessionService {
    if (!UserSessionService.instance) {
      UserSessionService.instance = new UserSessionService();
    }
    return UserSessionService.instance;
  }

  /**
   * Create a new user session
   */
  public async createSession(userData?: {
    email?: string;
    username?: string;
    preferences?: Partial<IUser['preferences']>;
  }, metadata?: {
    userAgent?: string;
    ipAddress?: string;
  }): Promise<SessionData> {
    try {
      const sessionId = uuidv4();
      let userId: string | undefined;

      // Create or find user if email/username provided
      if (userData?.email || userData?.username) {
        let user = null;

        if (userData.email) {
          user = await User.findByEmail(userData.email);
        }

        if (!user && userData.username) {
          user = await User.findByUsername(userData.username);
        }

        if (!user && (userData.email || userData.username)) {
          // Create new user
          user = new User({
            email: userData.email || '',
            username: userData.username || '',
            preferences: userData.preferences || {
              favoriteCategories: [],
              defaultImageQuality: 85,
              notifications: { email: true, push: false }
            }
          });
          await user.save();
          logger.info('New user created', undefined, { userId: user._id, email: user.email });
        }

        userId = user?._id;
      }

      const sessionData: SessionData = {
        sessionId,
        userId,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
        preferences: userData?.preferences,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true
      };

      this.sessions.set(sessionId, sessionData);

      logger.debug('Session created', undefined, {
        sessionId,
        userId,
        userAgent: metadata?.userAgent
      });

      return sessionData;
    } catch (error) {
      logger.error('Error creating session', error);
      throw error;
    }
  }

  /**
   * Get session by session ID
   */
  public getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return null;
    }

    // Check if session is expired
    if (Date.now() - session.lastActivity.getTime() > this.sessionTimeout) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    
    return session;
  }

  /**
   * Update session activity
   */
  public updateSessionActivity(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return false;
    }

    session.lastActivity = new Date();
    return true;
  }

  /**
   * Update session preferences
   */
  public async updateSessionPreferences(sessionId: string, preferences: Partial<IUser['preferences']>): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session || !session.isActive) {
        return false;
      }

      session.preferences = { ...session.preferences, ...preferences };

      // Update user preferences if user is logged in
      if (session.userId) {
        const user = await User.findById(session.userId);
        if (user) {
          await user.updatePreferences(preferences);
        }
      }

      session.lastActivity = new Date();
      return true;
    } catch (error) {
      logger.error('Error updating session preferences', error);
      return false;
    }
  }

  /**
   * Associate session with user (login)
   */
  public async associateSessionWithUser(sessionId: string, userId: string): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session || !session.isActive) {
        return false;
      }

      const user = await User.findById(userId);
      if (!user) {
        return false;
      }

      session.userId = userId;
      session.preferences = user.preferences;
      session.lastActivity = new Date();

      logger.debug('Session associated with user', undefined, {
        sessionId,
        userId
      });

      return true;
    } catch (error) {
      logger.error('Error associating session with user', error);
      return false;
    }
  }

  /**
   * Dissociate session from user (logout)
   */
  public dissociateSessionFromUser(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.isActive) {
      return false;
    }

    session.userId = undefined;
    session.lastActivity = new Date();

    logger.debug('Session dissociated from user', undefined, {
      sessionId
    });

    return true;
  }

  /**
   * End session
   */
  public endSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    session.isActive = false;
    this.sessions.delete(sessionId);

    logger.debug('Session ended', undefined, {
      sessionId,
      userId: session.userId
    });

    return true;
  }

  /**
   * Get user from session
   */
  public async getUserFromSession(sessionId: string): Promise<IUser | null> {
    try {
      const session = this.getSession(sessionId);
      
      if (!session || !session.userId) {
        return null;
      }

      return await User.findById(session.userId);
    } catch (error) {
      logger.error('Error getting user from session', error);
      return null;
    }
  }

  /**
   * Get user sessions
   */
  public getUserSessions(userId: string): SessionData[] {
    const userSessions: SessionData[] = [];
    
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.isActive) {
        userSessions.push(session);
      }
    }
    
    return userSessions;
  }

  /**
   * Get session statistics
   */
  public getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    userSessions: number;
    anonymousSessions: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const activeSessions = sessions.filter(s => s.isActive);
    const userSessions = activeSessions.filter(s => s.userId);
    const anonymousSessions = activeSessions.filter(s => !s.userId);

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      userSessions: userSessions.length,
      anonymousSessions: anonymousSessions.length
    };
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > this.sessionTimeout) {
        session.isActive = false;
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug('Cleaned up expired sessions', undefined, {
        count: cleanedCount
      });
    }
  }

  /**
   * Get session edit history
   */
  public async getSessionEditHistory(sessionId: string, limit: number = 20): Promise<any[]> {
    try {
      const session = this.getSession(sessionId);
      if (!session) {
        return [];
      }

      const query: any = { sessionId };
      if (session.userId) {
        query.userId = session.userId;
      }

      return await EditSession.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('templateId processing.status processing.duration createdAt');
    } catch (error) {
      logger.error('Error getting session edit history', error);
      return [];
    }
  }

  /**
   * Track session activity
   */
  public trackActivity(sessionId: string, activity: string, metadata?: any): void {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return;
    }

    logger.debug('Session activity tracked', undefined, {
      sessionId,
      userId: session.userId,
      activity,
      metadata
    });
  }

  /**
   * Get active sessions count
   */
  public getActiveSessionsCount(): number {
    return Array.from(this.sessions.values()).filter(s => s.isActive).length;
  }

  /**
   * Set session timeout
   */
  public setSessionTimeout(timeout: number): void {
    this.sessionTimeout = timeout;
    logger.info('Session timeout updated', undefined, { timeout });
  }
}

// Export singleton instance
export const userSessionService = UserSessionService.getInstance();
