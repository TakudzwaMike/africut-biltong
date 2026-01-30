import { describe, it, expect, vi } from 'vitest';
import { UserService } from './UserService';
import { MarketingService } from './MarketingService';
import { PageContentService } from './PageContentService';
import { ProductService } from './ProductService';
import { OrderService } from './OrderService';
import { BlogService } from './BlogService';
import { PartnerService } from './PartnerService';
import { TeamService } from './TeamService';
import { LocationService } from './LocationService';
import { SolutionService } from './SolutionService';
import { DocumentService } from './DocumentService';
import { LeadService } from './LeadService';
import { TrackedLinkService } from './TrackedLinkService';
import { SettingsService } from './SettingsService';
import { MediaService } from './MediaService';
import { AuditLogService } from './AuditLogService';

// Mock dependencies
vi.mock('$lib/server/db', () => {
    const mockChain = {
        from: vi.fn(() => mockChain),
        where: vi.fn(() => mockChain),
        orderBy: vi.fn(() => mockChain),
        limit: vi.fn(() => mockChain),
        offset: vi.fn(() => mockChain),
        leftJoin: vi.fn(() => mockChain),
        then: (resolve) => resolve([{ id: 'mock-id', name: 'Mock Item' }])
    };

    return {
        db: {
            query: {
                // Plural vs Singular aliases to cover all repo patterns
                users: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                user: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                marketingCodes: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                discountCode: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                marketingEvents: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                saleEvent: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                pageContent: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                products: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                product: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                orders: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                order: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                posts: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                post: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                blogPost: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                partners: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                partner: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                client: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                teamMembers: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                teamMember: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                locations: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                location: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                solutions: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                solution: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                documents: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                document: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                leads: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                lead: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                trackedLinks: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },
                trackedLink: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                siteSettings: { findMany: vi.fn(() => []) },
                siteSetting: { findMany: vi.fn(() => []) },

                media: { findMany: vi.fn(() => []), findFirst: vi.fn(() => ({})) },

                auditLogs: { findMany: vi.fn(() => []) },
                auditLog: { findMany: vi.fn(() => []) }
            },
            select: vi.fn(() => mockChain),
            insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 'mock-id' }])) })) })),
            update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 'mock-id' }])) })) })) })),
            delete: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 'mock-id' }])) })) }))
        }
    };
});

vi.mock('$lib/server/auditLog', () => ({
    log: vi.fn()
}));

describe('Service Layer Initialization', () => {
    it('should instantiate all services correctly', () => {
        expect(new UserService()).toBeDefined();
        expect(new MarketingService()).toBeDefined();
        expect(new PageContentService()).toBeDefined();
        expect(new ProductService()).toBeDefined();
        expect(new OrderService()).toBeDefined();
        expect(new BlogService()).toBeDefined();
        expect(new PartnerService()).toBeDefined();
        expect(new TeamService()).toBeDefined();
        expect(new LocationService()).toBeDefined();
        expect(new SolutionService()).toBeDefined();
        expect(new DocumentService()).toBeDefined();
        expect(new LeadService()).toBeDefined();
        expect(new TrackedLinkService()).toBeDefined();
        expect(new SettingsService()).toBeDefined();
        expect(new MediaService()).toBeDefined();
        expect(new AuditLogService()).toBeDefined();
    });
});

describe('UserService', () => {
    const service = new UserService();
    it('should list users', async () => {
        const users = await service.listUsers({});
        expect(users).toBeDefined();
    });
});

describe('MarketingService', () => {
    const service = new MarketingService();
    it('should create discount code', async () => {
        await expect(service.createDiscountCode('user1', { code: 'TEST', type: 'percentage', valueRaw: 10 })).resolves.toBeDefined();
    });
});

describe('PageContentService', () => {
    const service = new PageContentService();
    it('should get all sections', async () => {
        await expect(service.getAllSections()).resolves.toBeDefined();
    });
});

describe('ProductService', () => {
    const service = new ProductService();
    it('should list products', async () => {
        await expect(service.listProducts({})).resolves.toBeDefined();
    });
});

describe('OrderService', () => {
    const service = new OrderService();
    it('should list orders', async () => {
        await expect(service.listOrders({})).resolves.toBeDefined();
    });
});

describe('BlogService', () => {
    const service = new BlogService();
    it('should list post', async () => {
        await expect(service.listPosts({})).resolves.toBeDefined();
    });
});

describe('PartnerService', () => {
    const service = new PartnerService();
    it('should list partners', async () => {
        await expect(service.listPartners()).resolves.toBeDefined();
    });
});

describe('TeamService', () => {
    const service = new TeamService();
    it('should list team members', async () => {
        await expect(service.listTeamMembers()).resolves.toBeDefined();
    });
});

describe('LocationService', () => {
    const service = new LocationService();
    it('should list locations', async () => {
        await expect(service.listLocations()).resolves.toBeDefined();
    });
});

describe('SolutionService', () => {
    const service = new SolutionService();
    it('should list solutions', async () => {
        await expect(service.listSolutions()).resolves.toBeDefined();
    });
});

describe('DocumentService', () => {
    const service = new DocumentService();
    it('should list documents', async () => {
        await expect(service.listDocuments({})).resolves.toBeDefined();
    });
});

describe('LeadService', () => {
    const service = new LeadService();
    it('should list leads', async () => {
        await expect(service.listLeads({})).resolves.toBeDefined();
    });
});

describe('TrackedLinkService', () => {
    const service = new TrackedLinkService();
    it('should list links', async () => {
        await expect(service.listLinks({})).resolves.toBeDefined();
    });
});

describe('SettingsService', () => {
    const service = new SettingsService();
    it('should get settings', async () => {
        await expect(service.getSettings()).resolves.toBeDefined();
    });
});

describe('MediaService', () => {
    const service = new MediaService();
    it('should list media', async () => {
        await expect(service.listMedia({})).resolves.toBeDefined();
    });
});

describe('AuditLogService', () => {
    const service = new AuditLogService();
    it('should list logs', async () => {
        await expect(service.listLogs({})).resolves.toBeDefined();
    });
});
