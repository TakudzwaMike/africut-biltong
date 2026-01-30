import { PageContentRepository } from '$lib/server/repositories/PageContentRepository';
import { LoggerService } from '$lib/server/services/LoggerService';

const logger = LoggerService.for('PageContentService');

const EDITABLE_SECTIONS = [
    {
        page: 'homepage',
        section: 'technology',
        title: 'Built on a Foundation of Data and Trust',
        text: 'Our systems are engineered for reliability and precision. We leverage advanced AI and computer vision to detect unsafe conditions, predict equipment failure, and enable autonomous navigation. By processing your existing data streams securely, we deliver insights without disrupting your workflow.'
    },
    {
        page: 'homepage',
        section: 'hero',
        title: 'Transforming Operations with Smart, Simple AI',
        text: 'We provide AI-powered solutions for the mining, construction, and heavy industries, turning your operational data into measurable gains in profitability and sustainability.'
    },
    {
        page: 'about',
        section: 'history',
        title: 'Our Journey: Pioneering Intelligence',
        text: "Our journey began with a simple observation: the mining, construction, and heavy industries are rich with data, but poor in actionable insights. We bridge that gap. Our team of expert engineers, data scientists, and industry veterans develops 'Smart Simple Solutions' that integrate seamlessly into existing operations"
    }
];

export class PageContentService {
    constructor() {
        this.pageRepo = new PageContentRepository();
    }

    /**
     * Ensure all default sections exist.
     */
    async provisionDefaultSections() {
        for (const sectionDefaults of EDITABLE_SECTIONS) {
            const existing = await this.pageRepo.findBySection(sectionDefaults.section);

            if (!existing) {
                await this.pageRepo.create(sectionDefaults);
                logger.info(`Provisioned section: ${sectionDefaults.section}`);
            }
        }
    }

    /**
     * Get all content sections.
     */
    async getAllSections() {
        await this.provisionDefaultSections();
        return this.pageRepo.findAll();
    }

    async getContentByPage(page) {
        await this.provisionDefaultSections(); // Ensure defaults exist? Maybe overkill but safer.
        return this.pageRepo.findByPage(page);
    }

    /**
     * Update a section.
     * @param {string} id
     * @param {Object} data
     */
    async updateSection(id, data) {
        return this.pageRepo.update(id, data);
    }
}
