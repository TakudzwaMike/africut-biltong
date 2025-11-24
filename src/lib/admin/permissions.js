/**
 * Role Definitions
 */
export const ROLES = {
	ADMIN: 'admin',
	STORE_MANAGER: 'store_manager',
	CONTENT_EDITOR: 'content_editor',
	CUSTOMER: 'customer'
};

/**
 * Helper to check if a user's role allows access.
 * Admins always have access.
 */
export function hasAccess(userRole, allowedRoles) {
	if (!userRole) return false;
	if (userRole === ROLES.ADMIN) return true;
	return allowedRoles.includes(userRole);
}

/**
 * Central Navigation Config
 * Defines sections, labels, icons, and allowed roles.
 */
export const ADMIN_NAV = [
	{
		section: 'Overview',
		items: [
			{ 
                label: 'Dashboard', 
                href: '/_/admin', 
                icon: 'mdi:view-dashboard', 
                roles: [ROLES.ADMIN, ROLES.STORE_MANAGER, ROLES.CONTENT_EDITOR] 
            },
			{ 
                label: 'Audit Log', 
                href: '/_/admin/audit-log', 
                icon: 'mdi:history', 
                roles: [ROLES.ADMIN] 
            }
		]
	},
	{
		section: 'Commerce',
		items: [
			{ 
                label: 'Orders', 
                href: '/_/admin/orders', 
                icon: 'mdi:cart', 
                roles: [ROLES.ADMIN, ROLES.STORE_MANAGER] 
            },
			{ 
                label: 'Products', 
                href: '/_/admin/products', 
                icon: 'mdi:package-variant', 
                roles: [ROLES.ADMIN, ROLES.STORE_MANAGER] 
            }
		]
	},
	{
		section: 'Content & Marketing',
		items: [
			{ 
                label: 'Blog Posts', 
                href: '/_/admin/blog', 
                icon: 'mdi:post', 
                roles: [ROLES.ADMIN, ROLES.CONTENT_EDITOR] 
            },
			{ 
                label: 'Case Studies', 
                href: '/_/admin/case-studies', 
                icon: 'mdi:briefcase-check', 
                roles: [ROLES.ADMIN, ROLES.CONTENT_EDITOR] 
            },
			{ 
                label: 'Solutions', 
                href: '/_/admin/solutions', 
                icon: 'mdi:lightbulb', 
                roles: [ROLES.ADMIN, ROLES.CONTENT_EDITOR] 
            },
            { 
                label: 'Documents', 
                href: '/_/admin/documents', 
                icon: 'mdi:file-document', 
                roles: [ROLES.ADMIN, ROLES.CONTENT_EDITOR] 
            },
			{ 
                label: 'Leads', 
                href: '/_/admin/leads', 
                icon: 'mdi:account-group', 
                roles: [ROLES.ADMIN, ROLES.CONTENT_EDITOR, ROLES.STORE_MANAGER] 
            },
			{ 
                label: 'Tracked Links', 
                href: '/_/admin/tracked-links', 
                icon: 'mdi:link-variant', 
                roles: [ROLES.ADMIN, ROLES.CONTENT_EDITOR] 
            },
            { 
                label: 'Media Library', 
                href: '/_/admin/media', 
                icon: 'mdi:image-multiple', 
                roles: [ROLES.ADMIN, ROLES.CONTENT_EDITOR, ROLES.STORE_MANAGER] 
            }
		]
	},
	{
		section: 'System',
		items: [
			{ 
                label: 'Users & Staff', 
                href: '/_/admin/users', 
                icon: 'mdi:account-cog', 
                roles: [ROLES.ADMIN] 
            },
			{ 
                label: 'Site Settings', 
                href: '/_/admin/settings', 
                icon: 'mdi:cog', 
                roles: [ROLES.ADMIN] 
            },
            { 
                label: 'Locations', 
                href: '/_/admin/locations', 
                icon: 'mdi:map-marker', 
                roles: [ROLES.ADMIN] 
            }
		]
	}
];