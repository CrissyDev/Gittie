# Gittie - Supabase Authentication Setup Guide

## Prerequisites

- Supabase account (https://supabase.com)
- Node.js 22.12.0 or higher
- npm or yarn

## Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Wait for the project to be created
4. Go to Settings > API Keys
5. Copy your **Project URL** and **Anon Key**

### 2. Set Environment Variables

1. Create a `.env.local` file in the root directory
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Where to find these:**
- **VITE_SUPABASE_URL**: Settings > API > Project URL
- **VITE_SUPABASE_ANON_KEY**: Settings > API > Project API Keys > Anon key
- **SUPABASE_SERVICE_ROLE_KEY**: Settings > API > Project API Keys > Service Role key

### 3. Create the Profiles Table

In Supabase Dashboard, go to SQL Editor and run:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

### 4. Configure OAuth (Optional)

#### For GitHub OAuth:
1. Go to Settings > Auth > Providers > GitHub
2. Enable GitHub provider
3. Add OAuth App credentials from https://github.com/settings/developers
4. Redirect URL: `https://your-domain.com/auth/callback`

#### For Google OAuth:
1. Go to Settings > Auth > Providers > Google
2. Enable Google provider
3. Add OAuth credentials from Google Cloud Console
4. Redirect URL: `https://your-domain.com/auth/callback`

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/signup` to test the sign-up form.

## API Endpoints

### Email Sign-up
**POST** `/api/auth/signup`

Request body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response (Success 200):
```json
{
  "message": "Sign up successful",
  "user": {
    "id": "user-uuid",
    "email": "john@example.com"
  }
}
```

### OAuth Sign-up
**POST** `/api/auth/oauth`

Request body:
```json
{
  "provider": "github" // or "google"
}
```

## Features Included

- ✅ Email/password sign-up
- ✅ Form validation
- ✅ GitHub OAuth
- ✅ Google OAuth
- ✅ User profile creation
- ✅ Error handling
- ✅ Success messages
- ✅ Loading states

## Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env.local` exists in root directory
- Verify all three env variables are set correctly
- Restart dev server: `npm run dev`

### "User already exists"
- The email is already registered in Supabase
- User can try another email or reset password

### OAuth callback not working
- Verify redirect URL is correct in OAuth provider settings
- Check browser console for errors
- Ensure domain is whitelisted in provider settings

## Next Steps

1. Create a login page
2. Create a dashboard page
3. Add password reset functionality
4. Add email verification
5. Add user profile management
