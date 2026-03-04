import { UserRepository } from '$lib/server/repositories/UserRepository';
import { UserInviteRepository } from '$lib/server/repositories/UserInviteRepository';
import { PasswordResetRepository } from '$lib/server/repositories/PasswordResetRepository';
import * as auth from '$lib/server/auth';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';
import { LoggerService } from '$lib/server/services/LoggerService';
import { EmailService } from '$lib/server/services/EmailService';

const logger = LoggerService.for('AuthService');

export const ALLOWED_ROLES = ['admin', 'super_admin', 'content_editor'];


/**
 * Authentication Service
 * Handles user authentication, registration, and session management.
 * 
 * Follows the Service Layer pattern:
 * - Uses UserRepository and UserInviteRepository for data access
 * - Contains business logic for authentication workflows
 * - Returns data suitable for controllers
 */
export class AuthService {
    constructor() {
        this.userRepo = new UserRepository();
        this.inviteRepo = new UserInviteRepository();
        this.resetRepo = new PasswordResetRepository();
    }

    /**
     * Authenticate a user by email and password.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{ session: object, cookie: object, user: object }>}
     */
    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required.');
        }

        const existingUser = await this.userRepo.findByEmail(String(email));

        if (!existingUser) {
            throw new Error('Incorrect email or password');
        }

        const validPassword = await auth.verifyPassword(existingUser.passwordHash, String(password));
        if (!validPassword) {
            throw new Error('Incorrect email or password');
        }

        const session = await auth.createSession(existingUser.id);
        const sessionCookie = auth.createSessionCookie(session.id);

        logger.info(`User logged in: ${existingUser.username || existingUser.email} (${existingUser.id})`);

        return { session, cookie: sessionCookie, user: existingUser };
    }

    /**
     * Register a new user.
     * @param {object} data - { email, password, firstName, lastName }
     * @returns {Promise<{ session: object, cookie: object }>}
     */
    async register(data) {
        const { email, password, firstName, lastName } = data;

        const existingUser = await this.userRepo.findByEmail(email);

        if (existingUser) {
            throw new Error('Account already exists.');
        }

        try {
            const userId = generateId(15);
            const hashedPassword = await auth.hashPassword(password);

            await this.userRepo.create({
                id: userId,
                email,
                firstName,
                lastName,
                passwordHash: hashedPassword,
                role: 'customer',
                status: 'active'
            });

            const session = await auth.createSession(userId);
            const sessionCookie = auth.createSessionCookie(session.id);

            logger.info(`User registered: ${email} (${userId})`);

            // Send welcome email (non-blocking)
            EmailService.sendWelcomeEmail(email, firstName).catch(() => { });

            return { session, cookie: sessionCookie };

        } catch (e) {
            logger.error('Registration error:', e);
            throw new Error('Server error during registration.');
        }
    }

    /**
     * Invalidate a session (Logout).
     * @param {string} sessionId
     * @returns {Promise<{ blankCookie: object }>}
     */
    async logout(sessionId) {
        if (sessionId) {
            await auth.invalidateSession(sessionId);
        }
        const blankCookie = auth.createBlankSessionCookie();
        return { blankCookie };
    }

    /**
     * Create a new invite.
     * @param {string} email
     * @param {string} role
     * @param {string} createdBy
     * @returns {Promise<object>}
     */
    async createInvite(email, role, createdBy) {
        const token = generateId(32);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

        const newInvite = await this.inviteRepo.create({
            token,
            email,
            role,
            expiresAt,
            createdBy
        });

        logger.info(`Invite created for ${email} with role ${role}`);

        // Send invite email (non-blocking)
        EmailService.sendInviteEmail(email, token, role).catch(() => { });

        return newInvite;
    }

    /**
     * Validate an invite token.
     * @param {string} token
     * @returns {Promise<object>} Invite object
     */
    async validateInvite(token) {
        const invite = await this.inviteRepo.findValidInviteByToken(token);

        if (!invite) {
            throw new Error('This invitation link is invalid or has expired.');
        }
        return invite;
    }

    /**
     * Complete an invite (Create account for invitee).
     * @param {string} token
     * @param {string} username
     * @param {string} password
     * @param {string} firstName
     * @param {string} lastName
     * @returns {Promise<{ session: object, cookie: object }>}
     */
    async completeInvite(token, username, password, firstName, lastName) {
        const invite = await this.validateInvite(token);

        const userId = generateId(15);
        const passwordHash = await new Argon2id().hash(password);

        try {
            await this.userRepo.create({
                id: userId,
                email: invite.email,
                username,
                firstName,
                lastName,
                passwordHash,
                role: invite.role,
                status: 'active'
            });

            await this.inviteRepo.markAsUsed(invite.id);

            const session = await auth.createSession(userId);
            const sessionCookie = auth.createSessionCookie(session.id);

            logger.info(`User created from invite: ${username} (${userId})`);

            return { session, cookie: sessionCookie };

        } catch (error) {
            logger.error('Error creating user from invite:', error);
            if (error.code === '23505') {
                throw new Error('Username is already taken.');
            }
            throw new Error('Could not create your account.');
        }
    }

    /**
     * Request a password reset. Sends an email with a reset link.
     * Always returns success (even if email not found) for security.
     * @param {string} email
     * @param {string} origin - The site origin URL for building the reset link
     * @returns {Promise<boolean>}
     */
    async requestPasswordReset(email, origin) {
        const user = await this.userRepo.findByEmail(email);

        if (!user) {
            // Don't reveal that the email doesn't exist
            logger.info(`Password reset requested for unknown email: ${email}`);
            return true;
        }

        try {
            const token = await this.resetRepo.create(user.id);
            const resetUrl = `${origin}/reset-password/${token.id}`;

            await EmailService.sendPasswordResetEmail(user.email, resetUrl);
            logger.info(`Password reset email sent to ${user.email}`);
            return true;
        } catch (err) {
            logger.error('Error creating password reset token', err);
            throw new Error('Failed to process password reset request.');
        }
    }

    /**
     * Reset a user's password using a valid token.
     * @param {string} tokenId
     * @param {string} newPassword
     * @returns {Promise<boolean>}
     */
    async resetPassword(tokenId, newPassword) {
        const token = await this.resetRepo.findValidToken(tokenId);

        if (!token) {
            throw new Error('This password reset link is invalid or has expired.');
        }

        try {
            const passwordHash = await auth.hashPassword(newPassword);
            await this.userRepo.update(token.userId, { passwordHash });

            // Clean up: delete the used token
            await this.resetRepo.delete(tokenId);

            // Invalidate all existing sessions for security
            await auth.invalidateUserSessions(token.userId);

            logger.info(`Password reset completed for user ${token.userId}`);
            return true;
        } catch (err) {
            logger.error('Error resetting password', err);
            throw new Error('Failed to reset password.');
        }
    }

    /**
     * Resend an invite by creating a fresh token and re-sending the email.
     * @param {string} email
     * @param {string} role
     * @param {string} createdBy - Admin user ID
     * @returns {Promise<object>}
     */
    async resendInvite(email, role, createdBy) {
        // Create a brand new invite (old one will remain but won't conflict)
        return this.createInvite(email, role, createdBy);
    }
}
