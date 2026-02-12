# Smart Bookmark App

A simple bookmark manager built with Next.js, Supabase, and Tailwind.

## Features

- Google OAuth authentication
- Add, edit, delete bookmarks
- Private bookmarks per user (RLS enabled)
- Real-time updates using Supabase Realtime
- Deployed on Vercel

## Tech Stack

- Next.js (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS
- Vercel

## Live URL

https://smart-bookmark-app-psi.vercel.app

## Problems Faced & Solutions

1. Git nested repository issue  
   - Fixed by removing inner `.git` folder and restructuring project.

2. node_modules push error  
   - Added `.gitignore` and removed node_modules from git history.

3. OAuth redirect mismatch  
   - Configured correct callback URLs in:
     - Google Cloud Console
     - Supabase URL Configuration