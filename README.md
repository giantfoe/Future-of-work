# Future of Work

A Next.js project.

## Prerequisites

- Node.js (v18 or newer recommended)
- npm (comes with Node.js) or pnpm

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <project-directory>
   ```

2. **Install dependencies:**
   Using npm:
   ```bash
   npm install
   ```
   Or using pnpm:
   ```bash
   pnpm install
   ```

## Running the Project Locally (Development)

To start the development server:
```bash
npm run dev
```
Or with pnpm:
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Environment Variables

This project requires several environment variables to be set. Create a `.env` file in the root of the project and add the following variables:

```env
# Airtable
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_BOUNTIES_TABLE_ID=your_airtable_bounties_table_id
AIRTABLE_SUBMISSIONS_TABLE_ID=your_airtable_submissions_table_id
AIRTABLE_PERSONAL_ACCESS_TOKEN=your_airtable_personal_access_token
AIRTABLE_ACCESS_TOKEN=your_airtable_access_token
ADMIN_API_KEY=your_admin_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_APP_SECRET=your_privy_app_secret

# Webhook
WEBHOOK_SECRET=your_webhook_secret
```

If you are missing any of these values, ask the project maintainer for the correct credentials. 