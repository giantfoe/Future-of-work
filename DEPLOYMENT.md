# Deployment Guide for Future of Work Platform

## Vercel Deployment

### Prerequisites
1. Vercel account
2. GitHub repository connected to Vercel
3. All required environment variables

### Environment Variables Setup

In your Vercel dashboard, add the following environment variables:

#### Airtable Configuration
- `AIRTABLE_PERSONAL_ACCESS_TOKEN`: Your Airtable Personal Access Token (starts with 'pat')
- `AIRTABLE_BASE_ID`: Your Airtable base ID
- `AIRTABLE_BOUNTIES_TABLE_ID`: Table ID for bounties
- `AIRTABLE_SUBMISSIONS_TABLE_ID`: Table ID for submissions

#### Cloudinary Configuration
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

#### Privy Authentication
- `NEXT_PUBLIC_PRIVY_APP_ID`: Your Privy app ID
- `NEXT_PUBLIC_PRIVY_APP_SECRET`: Your Privy app secret

### Key Changes for Vercel Compatibility

#### 1. Fixed Global Search Functionality
The search API route (`/app/api/search/route.ts`) has been updated to:
- Remove self-referencing HTTP requests that don't work on Vercel
- Use direct function calls to `getBounties()` and `getCategories()` from `airtable-service`
- Eliminate dependency on `NEXT_PUBLIC_BASE_URL` for internal API calls

#### 2. Optimized API Routes
- All API routes now use direct database/service calls instead of HTTP requests
- Added proper error handling and timeout configurations
- Implemented caching headers for better performance

### Deployment Steps

1. **Push to GitHub**: Ensure all changes are committed and pushed to your repository

2. **Connect to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in the Vercel dashboard

3. **Environment Variables**:
   - Copy values from your `.env.local` file
   - Add them to Vercel's environment variables section
   - Ensure all variables are set for Production, Preview, and Development environments

4. **Deploy**:
   - Vercel will automatically deploy on every push to main branch
   - Monitor the deployment logs for any issues

### Testing After Deployment

1. **Global Search**: Test the search functionality to ensure it works properly
2. **Bounty Listings**: Verify bounties load correctly
3. **Submissions**: Test the submission form and file uploads
4. **Authentication**: Ensure Privy authentication works

### Troubleshooting

#### Common Issues:

1. **Search not working**: 
   - Check that all Airtable environment variables are set
   - Verify the Airtable Personal Access Token is valid

2. **File uploads failing**:
   - Ensure Cloudinary environment variables are correct
   - Check Cloudinary account limits

3. **Authentication issues**:
   - Verify Privy app ID and secret are correct
   - Check Privy dashboard for domain configuration

#### Environment Variable Verification:
You can test if environment variables are properly set by visiting:
`https://your-domain.vercel.app/api/debug/environment-variables`

### Performance Optimizations

- API routes include caching headers
- Static assets are optimized by Vercel automatically
- Database queries are optimized for serverless functions

### Security Considerations

- All sensitive data is stored in environment variables
- API keys are never exposed to the client
- CORS is properly configured for the domain

---

## Local Development

For local development, copy `.env.example` to `.env.local` and fill in your actual values.

```bash
cp .env.example .env.local
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.