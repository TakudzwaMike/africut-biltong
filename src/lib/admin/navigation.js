const ADMIN_ROUTE="/_/admin"

export const navItems = [
	{ href: `${ADMIN_ROUTE}/orders`, label: `Orders` },
	{ href: `${ADMIN_ROUTE}/page-content`, label: `Page Content` },
	{ href: `${ADMIN_ROUTE}/products`, label: `Store Products` },
	{ href: `${ADMIN_ROUTE}/marketing`, label: `Marketing & Sales` },
	{ href: `${ADMIN_ROUTE}/solutions`, label: `Solutions` },
	{ href: `${ADMIN_ROUTE}/documents`, label: `Documents` },
	{ href: `${ADMIN_ROUTE}/partners`, label: `Partners` },
	{ href: `${ADMIN_ROUTE}/case-studies`, label: `Case Studies` },
	{ href: `${ADMIN_ROUTE}/team-members`, label: `Team Members` },
	{ 
		href: `${ADMIN_ROUTE}/blog`, 
		label: `Blog`, 
		subItems: [
			{ href: `${ADMIN_ROUTE}/blog`, label: `Posts`, exact: true },
			{ href: `${ADMIN_ROUTE}/blog/categories`, label: `Categories` }
		] 
	},
	{ href: `${ADMIN_ROUTE}/tracked-links`, label: `Tracked Links & QR` },
	{ href: `${ADMIN_ROUTE}/leads`, label: `Leads` },
	{ href: `${ADMIN_ROUTE}/media`, label: `Media Library` },
	{ href: `${ADMIN_ROUTE}/users`, label: `Users` },
	{ href: `${ADMIN_ROUTE}/settings`, label: `Site Settings` },
	{ href: `${ADMIN_ROUTE}/locations`, label: `Office Locations` },
	{ href: `${ADMIN_ROUTE}/audit-log`, label: `Audit Log` }
];
