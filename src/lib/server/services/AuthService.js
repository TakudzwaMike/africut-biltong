import { UserRepository } from '$lib/server/repositories/UserRepository';
import { UserInviteRepository } from '$lib/server/repositories/UserInviteRepository';
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
}
