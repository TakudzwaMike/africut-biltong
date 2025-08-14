// To run this seed script: `npm run db:seed`
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import crypto from 'crypto';

// Create a new, self-contained database connection just for this script
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
}
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
	console.log('Seeding database...');

	// --- Clear existing data in the correct order ---
	await db.delete(schema.caseStudyResult);
	await db.delete(schema.caseStudy);
	await db.delete(schema.testimonial);
	await db.delete(schema.client);
	await db.delete(schema.blogPost);
	await db.delete(schema.lead);
	await db.delete(schema.solution);
	await db.delete(schema.sessionTable);
	await db.delete(schema.userTable);
	console.log('✅ Cleared existing data');

	// --- Create Admin User ---
	const userId = generateId(15);
	const hashedPassword = await new Argon2id().hash('password');
	await db.insert(schema.userTable).values({
		id: userId,
		username: 'admin',
		passwordHash: hashedPassword
	});
	console.log('✅ Created admin user (username: admin, password: password)');

	// --- Seed Clients ---
	const [client1, client2] = await db
		.insert(schema.client)
		.values([
			{ name: 'TechCorp Mining' },
			{ name: 'Global Construct' }
		])
		.returning();
	console.log('✅ Seeded Clients');

	// --- Seed Testimonials ---
	const expires = new Date();
	expires.setDate(expires.getDate() + 7);
	await db.insert(schema.testimonial).values([
		{
			clientId: client1.id,
			quote: 'Vision AI Tech has transformed our operations. Their fleet monitoring solution cut our fuel costs by a staggering 15%.',
			authorName: 'Jane Doe',
			authorTitle: 'COO, TechCorp Mining',
			status: 'published',
			submissionToken: crypto.randomBytes(32).toString('hex'),
			tokenExpiresAt: expires
		},
		{
			clientId: client2.id,
			quote: 'The geotechnical intelligence module provided unparalleled safety insights. We can now proactively manage risks we were previously blind to.',
			authorName: 'John Smith',
			authorTitle: 'Head of Safety, Global Construct',
			status: 'submitted',
			submissionToken: crypto.randomBytes(32).toString('hex'),
			tokenExpiresAt: expires
		}
	]);
	console.log('✅ Seeded Testimonials');

	// --- Seed Solutions ---
	await db.insert(schema.solution).values([
		{
			slug: 'fleet-monitoring',
			solutionName: 'Production & Fleet Monitoring',
			shortDescription:
				"An all-in-one solution to manage your heavy assets. We use telematics and AI to reduce downtime, cut fuel costs, and optimize your fleet's performance.",
			longDescription: [
				{
					type: 'paragraph',
					children: [
						{
							text: 'Our Fleet Monitoring system provides a real-time, comprehensive view of your entire operation. By integrating with existing telematics data from your heavy machinery, we unlock powerful insights that drive efficiency and reduce operational costs. Our AI models predict maintenance needs before they become critical failures, optimize fuel consumption through intelligent routing and idle-time analysis, and ensure assets are utilized to their maximum potential.'
						}
					]
				}
			]
		},
		{
			slug: 'geotechnical-intelligence',
			solutionName: 'GeoTechnical Intelligence',
			shortDescription:
				'Enhance site safety and stability with our AI-driven geotechnical monitoring module. Proactively manage risk and integrate data with your existing platforms.',
			longDescription: [
				{
					type: 'paragraph',
					children: [
						{
							text: 'Safety is paramount. The GeoTechnical Intelligence module uses a combination of sensor data, satellite imagery, and computer vision to monitor ground stability, slope angles, and potential hazards in real-time. Our predictive alerts give you early warnings of potential risks, allowing for proactive measures to protect both your personnel and your assets. The system integrates seamlessly with your existing safety protocols and reporting platforms.'
						}
					]
				}
			]
		},
		{
			slug: 'tailored-ai-solutions',
			solutionName: 'Tailored AI Solutions',
			shortDescription:
				'Every operation is unique. Our team can partner with you to build a custom AI engine that solves your most specific and challenging problems.',
			longDescription: [
				{
					type: 'paragraph',
					children: [
						{
							text: "While our standard modules solve common industry challenges, we recognize that no two operations are identical. Our team of expert data scientists and industry veterans can work with you to develop a bespoke AI solution. Whether it's optimizing a specific metallurgical process, automating quality control inspections, or developing a unique safety protocol, we build custom models that are finely tuned to your specific data and operational goals."
						}
					]
				}
			]
		}
	]);
	console.log('✅ Seeded Solutions');

	// --- Seed Case Studies (now linked to clients) ---
	const [caseStudy1] = await db
		.insert(schema.caseStudy)
		.values({
			clientId: client1.id,
			slug: 'techcorp-fuel-reduction',
			title: 'Reducing Fuel Costs by 15% for a Major Mining Operator',
			challenge: [
				{
					type: 'paragraph',
					children: [
						{
							text: 'TechCorp Mining was facing escalating fuel costs across their fleet of over 50 haul trucks. Unoptimized routes, excessive idling, and inefficient operator behavior were contributing to significant waste.'
						}
					]
				}
			],
			solution: [
				{
					type: 'paragraph',
					children: [
						{
							text: 'We deployed our Production & Fleet Monitoring module, integrating with their existing telematics. Our AI analyzed route data, idling patterns, and payload information to provide actionable recommendations for both dispatchers and individual operators.'
						}
					]
				}
			]
		})
		.returning();

	await db.insert(schema.caseStudyResult).values([
		{ caseStudyId: caseStudy1.id, kpiName: 'Reduction in Fuel Consumption', kpiValue: '15%' },
		{ caseStudyId: caseStudy1.id, kpiName: 'Increase in Haul Cycle Efficiency', kpiValue: '8%' },
		{ caseStudyId: caseStudy1.id, kpiName: 'Reduction in Idle Time', kpiValue: '22%' }
	]);
	console.log('✅ Seeded Case Study 1');

	const [caseStudy2] = await db
		.insert(schema.caseStudy)
		.values({
			clientId: client2.id,
			slug: 'global-construct-safety',
			title: 'Enhancing Slope Stability Monitoring for Global Construct',
			challenge: [
				{
					type: 'paragraph',
					children: [
						{
							text: 'Global Construct needed a more reliable and proactive system to monitor geotechnical risks at a large-scale open-pit mine, aiming to improve safety standards beyond regulatory requirements.'
						}
					]
				}
			],
			solution: [
				{
					type: 'paragraph',
					children: [
						{
							text: 'Our GeoTechnical Intelligence module was implemented, using real-time sensor data and satellite imagery. The system provided a unified dashboard with predictive alerts for potential ground movement, enabling the engineering team to take preventative action.'
						}
					]
				}
			]
		})
		.returning();

	await db.insert(schema.caseStudyResult).values([
		{ caseStudyId: caseStudy2.id, kpiName: 'Increase in Hazard Detection Rate', kpiValue: '40%' },
		{ caseStudyId: caseStudy2.id, kpiName: 'Reduction in False Alarms', kpiValue: '60%' }
	]);
	console.log('✅ Seeded Case Study 2');
	
	// --- Seed Blog Posts ---
	await db.insert(schema.blogPost).values([
		{
			authorId: userId,
			slug: 'the-future-of-heavy-industry-is-ai',
			title: 'The Future of Heavy Industry is AI',
			contentJson: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: 'Artificial intelligence is no longer a futuristic concept; it is a present-day reality transforming the heavy industry landscape. From predictive maintenance to autonomous vehicles, AI is enhancing efficiency, safety, and profitability.' }]
					}
				]
			},
			isPublished: true,
			publishedAt: new Date()
		},
		{
			authorId: userId,
			slug: 'data-driven-safety-protocols',
			title: 'Data-Driven Safety Protocols',
			contentJson: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [{ type: 'text', text: 'This is a draft post about how data can improve safety on site.' }]
					}
				]
			},
			isPublished: false,
			publishedAt: null
		}
	]);
	console.log('✅ Seeded Blog Posts');


	console.log('Seeding complete!');
}

main()
	.catch((e) => {
		console.error('Failed to seed database:', e);
		process.exit(1);
	})
	.finally(async () => {
		// Ensure the connection is closed when the script is done
		await client.end();
		console.log('Database connection closed.');
	});