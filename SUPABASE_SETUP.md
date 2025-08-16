# Supabase Setup Guide for Codebase Time Machine

## Quick Start

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - Project name: `codebase-time-machine` (or your choice)
   - Database Password: Generate a strong password
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 2. Get Your API Keys
1. Go to Settings → API in your Supabase dashboard
2. Copy these values to your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 3. Run Database Setup
1. Go to SQL Editor in Supabase dashboard
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" to execute

### 4. Configure Authentication

#### Email Authentication (Required)
1. Go to Authentication → Settings
2. Under Email Auth:
   - Enable Email Confirmations (recommended for production)
   - Or disable for easier testing during development
   - Configure email templates if desired

#### GitHub OAuth (Optional but Recommended)
1. Go to Authentication → Providers → GitHub
2. Enable GitHub provider
3. Create a GitHub OAuth App:
   - Go to https://github.com/settings/applications/new
   - Application name: `Codebase Time Machine`
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: Copy from Supabase dashboard
4. Copy Client ID and Client Secret to Supabase
5. Click Save

#### Google OAuth (Optional)
1. Go to Authentication → Providers → Google
2. Follow similar steps as GitHub

### 5. Configure Storage (Optional)
If you want to allow users to upload git bundles:
1. Go to Storage in Supabase dashboard
2. Create a new bucket called `repositories`
3. Set it to private
4. Add RLS policies for authenticated users

### 6. Test Your Setup
1. Start your development server:
   ```bash
   npm run dev
   ```
2. Go to http://localhost:3000
3. Try signing up with email
4. Check that user appears in Authentication → Users

## Database Schema

The setup creates these tables:

### `profiles`
- Extends auth.users with additional user data
- Automatically created when user signs up
- Stores: full_name, avatar_url

### `analyzed_repos` (Optional)
- Stores history of analyzed repositories
- Useful for creating a dashboard of previously analyzed repos
- Can store analysis results in JSONB

### `saved_queries` (Optional)
- Stores user's AI queries and responses
- Useful for creating a query history feature

## Troubleshooting

### "Invalid API Key"
- Double-check your `.env.local` file
- Make sure there are no quotes around the keys
- Restart your development server after changing env vars

### "User already exists"
- This is normal if you're testing signup multiple times
- Use different email or delete user from Supabase dashboard

### "Email not confirmed"
- Check your email for confirmation link
- Or disable email confirmations in Authentication → Settings for development

### "GitHub OAuth not working"
- Make sure callback URL matches exactly
- Check that GitHub OAuth app is not in development mode
- Ensure you've saved the settings in Supabase

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. Users can only see/modify their own data
3. Service role key should NEVER be exposed to client
4. Always use anon key in client-side code

## Next Steps

After setup, you can:
1. Analyze any public GitHub repository
2. View commit timelines and patterns
3. Ask AI questions about code evolution
4. Save your analysis history (if using optional tables)

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub Issues: Create an issue in your repo