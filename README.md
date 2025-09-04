# Vision AI Tech

A modern, performant corporate website and headless CMS built with SvelteKit, Drizzle ORM, and PostgreSQL. The project features a fully dynamic public-facing site and a comprehensive, secure admin panel for content management

---

## ✨ Tech Stack

-   **Framework:** [SvelteKit](https://kit.svelte.dev/) (with Svelte 5 runes)
-   **Database:** [PostgreSQL](https://www.postgresql.org/)
-   **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Authentication:** [Lucia Auth](https://lucia-auth.com/)
-   **File Storage:** [Vercel Blob](https://vercel.com/storage/blob)
-   **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Core Features

### Public-Facing Website

-   **Fully Responsive Design:** Mobile-first components and navigation
-   **Dynamic Content:** All major sections (Hero, Solutions, Products, About Us, Blog, etc.) are managed through the CMS.
-   **Dynamic SEO:** Includes JSON-LD structured data for `Organization` and `Product` schemas.
-   **Blog with Categories:** A complete blogging system with featured images and category filtering
-   **Resources Page:** Centralized location for case studies and downloadable brochures
-   **Geo-aware Footer:** Highlights the user's nearest office location based on their IP (on Vercel)
-   **Quick Chat:** A floating WhatsApp button for instant user engagement

### Admin Panel / CMS

-   **Secure Authentication:** Role-ready user management system built with Lucia.
-   **Consolidated CRUD Interfaces:** Efficient, single-page management for Products, Clients, Team Members, and Locations.
-   **Media Library:** Centralized hub for all image assets.
-   **Automatic Image Optimization:** On upload, a serverless function creates and saves optimized thumbnail and display versions of each image.
-   **Rich Text Editor:** WYSIWYG editor for blog posts and detailed descriptions.
-   **QR Code Analytics:** Generate tracked short links and QR codes, and view click analytics by country
-   **Audit Log:** Records all administrative actions (create, update, delete) for accountability
-   **Site-Wide Settings:** Manage global branding, logo, social media links, and more from a single page

---

## SETUP

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or higher)
-   [Docker](https://www.docker.com/) and Docker Compose

### 1. Clone the Repository

git clone <your-repository-url>
cd <repository-folder>
### 2. Install Dependencies code 
```bash
npm install
```
### 3. Set Up Environment Variables
Create a new file named .env in the root of the project by copying the example file
```bash
cp .env.example .env
```
  Now, open the .env file and fill in the required values
  ```env
# URL for your local PostgreSQL database
DATABASE_URL="postgres://root:mysecretpassword@localhost:5432/local"

# Token from your Vercel Blob storage store
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_...from_the_Vercel_UI"

# A strong, unique secret to secure the image processing endpoint
IMAGE_PROCESSING_SECRET="generate_a_random_string_here"

# (Optional for local dev, but required for maps)
PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY_HERE"
```
### 4. Start the Database
Run the following command to start the PostgreSQL database in a Docker container
```bash
docker compose up -d
```
### 5. Run Database Migrations
This command will apply the Drizzle schema to your new database
```bash
npm run db:migrate
```
### 6. (Optional) Seed the Database
Data is outdated and needs an update
To populate your database with initial sample data (including an admin user), run the seed script.
```bash
npm run db:seed
```
  Default Admin Credentials:
  Username: admin
  Password: password
  
## Run the Development Server
  You're all set! 
  Start the SvelteKit development server.
  ```bash
npm run dev
```
  The application will be available at http://localhost:5173.🛠️ 
  
## 🌐 Deployment
This project is configured for deployment on Vercel
Push your code to a GitHub repository.
Create a new project on Vercel and link it to your repository.
Add all the environment variables from your .env file to the Environment Variables section in your Vercel project settings
Deploy! 
Migrations will be run automatically by the run-migrations.yml GitHub Action upon pushing changes to the drizzle/ folder
  
