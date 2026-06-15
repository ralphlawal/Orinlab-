# Orinlabí — Site Manual

**Last updated:** June 2026  
**Website:** orinlabi.com  
**Owner:** Ralph Lawal · Ralph Lawal Group

---

## Table of Contents

1. [What the Site Does](#1-what-the-site-does)
2. [Public Pages — What Visitors See](#2-public-pages)
3. [How Applications Work (Step by Step)](#3-how-applications-work)
4. [Admin Panel — Complete Guide](#4-admin-panel)
5. [Artist Portal](#5-artist-portal)
6. [Email System — Who Gets What](#6-email-system)
7. [Newsletter](#7-newsletter)
8. [Blog](#8-blog)
9. [Social & Contact Info](#9-social--contact-info)
10. [Technical Infrastructure](#10-technical-infrastructure)
11. [Common Tasks & How-Tos](#11-common-tasks)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. What the Site Does

Orinlabí is an **invitation-based music distribution platform** for independent African artists. The model works like this:

- Artists **apply** (free, no account needed) through the /submit page
- The Orinlabí team **reviews** every application manually in the admin panel
- **Selected artists** are approved and their music is distributed to 150+ streaming platforms worldwide — completely free
- Artists can track their application status via /status or their personal Artist Portal

**Distribution is always free.** There are no subscription plans, no fees, and Orinlabí takes no commission on royalties.

---

## 2. Public Pages

### Home (`/`)
The main landing page. Shows the value proposition, how the process works, featured artists, and a call-to-action to apply.

### About (`/about`)
The company story, founder's message, vision/mission, core values, and roadmap. Also links to the contact page.

### Services (`/services`)
Describes the full range of services: music distribution, artist marketing, release strategy, playlist promotion, brand development, and graphics design.

### Artists (`/artists`)
A live gallery of approved artists whose music has been distributed. This page is server-rendered and updates every 60 seconds. It pulls approved releases from the database and deduplicates by artist name.

### Apply for Distribution (`/submit`)
The main application form. Artists fill in:
- Personal info: legal name, artist name, email, phone, country, bio, social links
- Release info: song title, album (optional), release type, genre, release date, explicit flag
- Files: audio file and cover art (uploaded to Supabase Storage)
- Credits: songwriters, producers, featured artists, ISRC
- Rights: copyright owner, year, publishing info
- A consent checkbox before they can submit

When submitted:
1. Files upload to Supabase Storage (cover-art and releases buckets)
2. The release saves to the `releases` table with status `"pending"`
3. The artist receives a confirmation email via Resend
4. **You (admin) receive an instant notification email** at ralphlawal2003@gmail.com with all artist details and a link to the admin panel

### How It Works / Pricing (`/pricing`)
Explains the invitation model: apply → review → approval → distribution. Makes it clear the service is free.

### Check Status (`/status`)
Artists can look up the status of their application by entering their email. Shows all their submissions with current status (Pending, Approved, Not Selected) and any notes left by the team.

### Blog (`/blog`)
Lists all published blog posts, newest first. Each post has its own page at `/blog/[slug]`.

### Contact (`/contact`)
Contact form + contact details. When someone submits this form:
1. The message saves to the `contact_messages` table in Supabase
2. **You receive an instant notification email** at ralphlawal2003@gmail.com with the full message and a link to the admin panel

### Privacy Policy (`/privacy`)
Full legal privacy policy covering data collection, cookies, your rights, retention, and how to contact for privacy issues.

### Terms of Service (`/terms`)
Full legal terms covering agreement, eligibility, artist rights, content standards, distribution, royalties, and governing law (Lagos, Nigeria).

### Artist Portal (`/portal`)
Private area for artists whose email is in the database. See [Section 5](#5-artist-portal).

---

## 3. How Applications Work

### Full Journey

```
Artist fills /submit form
       ↓
Files upload to Supabase Storage
       ↓
Release saved to database (status: "pending")
       ↓
Artist gets confirmation email (via Resend)
       ↓
YOU get notification email at ralphlawal2003@gmail.com
       ↓
You log into /admin/releases to review
       ↓
You listen to the music, check the details
       ↓
You approve or reject in the admin panel (optionally add review notes)
       ↓
Artist gets approval/rejection email (sent automatically when you save in admin)
       ↓
If approved: you add store links once the music is live on platforms
       ↓
Artist can see their store links in the Artist Portal
```

### Application Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Application received, under review |
| `approved` | Selected for distribution |
| `rejected` | Not selected this round |

---

## 4. Admin Panel

**URL:** orinlabi.com/admin  
**Login:** Email + password (Supabase Auth)

The admin panel is a full-screen overlay — when you're logged in as admin, you see the admin interface, not the public site.

### 4.1 Dashboard (`/admin`)

Five stat cards at a glance:
- **Pending** — applications waiting for review
- **Approved** — approved releases
- **Rejected** — rejected releases
- **Messages** — contact form messages
- **Subscribers** — newsletter subscribers

### 4.2 Releases (`/admin/releases`)

This is where you manage all distribution applications.

**Reviewing an application:**
1. Click any row to open the detail modal
2. Read all artist info, release details, credits, and rights
3. Listen to the audio file link
4. View cover art
5. Use the Status dropdown to set: Pending / Approved / Rejected
6. Optionally write notes in the "Review Notes" field (the artist will see these)
7. Click **Save Changes** — this saves to the database and sends the artist an email automatically

**Adding store links (after the music is live on platforms):**
1. Open an approved release
2. Scroll to "Store Links" section
3. Paste the direct URLs for each platform (Spotify, Apple Music, Boomplay, Audiomack, YouTube Music, Deezer, Tidal, Amazon Music)
4. Click **Save Links** — the artist will immediately see these in their Artist Portal

### 4.3 Messages (`/admin/messages`)

All contact form submissions. Shows name, email, subject, inquiry type, message, and date. You can expand each message to read in full.

### 4.4 Blog (`/admin/blog`)

Create and manage blog posts. Each post has:
- Title, slug (URL path), excerpt
- Main content (rich text)
- Cover image URL
- Published toggle (unpublished posts are not shown on the public blog)

To create a new post: click **New Post**, fill in the details, toggle Published when ready.

### 4.5 Newsletter (`/admin/newsletter`)

Full subscriber list with:
- Filter by: All / Active / Inactive
- Toggle individual subscribers active/inactive
- Export the full list as a CSV file for use in external email tools

---

## 5. Artist Portal

**URL:** orinlabi.com/portal

### How Artists Access It

1. Artist goes to /portal/login
2. Enters the **same email they used when applying**
3. They receive a **magic link** (one-click login, no password)
4. They click the link in their email → they're logged in automatically
5. The session stays active while they use the portal

> Note: Any email that exists in the releases table can log in. The artist does not need to "register" — submitting an application automatically grants portal access.

### What Artists See in the Portal

- A list of all their submissions (latest first)
- Status badge for each release: Under Review / Approved / Not Selected
- Any notes you left in the admin panel
- For approved releases: store links (Spotify, Apple Music, etc.) once you've added them

### Artist Portal Layout

The portal has a thin "Artist Portal" bar that sits just below the main navigation. It shows:
- "My Releases" link
- Their email address (confirms who is logged in)
- "Sign out" button

---

## 6. Email System

All emails are sent via **Resend** (resend.com) using the address `info@orinlabi.com`.

### Emails Artists Receive

| Trigger | Email subject |
|---------|--------------|
| Submits application | "We received your release — [Song Title]" |
| Admin approves release | "Your release has been approved — [Song Title]" |
| Admin rejects release | "Action needed on your release — [Song Title]" |
| Subscribes to newsletter | Welcome email from Orinlabí |
| Requests portal login | Magic link email (sent by Supabase Auth) |

### Emails YOU (Admin) Receive

| Trigger | Where it goes | Subject format |
|---------|--------------|---------------|
| New distribution application | ralphlawal2003@gmail.com | 🎵 New application — [Artist] · [Song] |
| New contact form message | ralphlawal2003@gmail.com | 💬 New message — [Name] · [Subject] |

Admin notification emails include a **"Review in Admin Panel →"** button that takes you directly to the right section.

---

## 7. Newsletter

Visitors can subscribe to the newsletter from forms on the site.

**What happens when someone subscribes:**
1. Their email is saved to the `newsletter_subscribers` table
2. They receive a welcome email from Orinlabí
3. You can see them in `/admin/newsletter`

**Managing subscribers:**
- Go to `/admin/newsletter`
- Filter by Active / Inactive / All
- Toggle status for any subscriber
- Export list as CSV to use with Mailchimp, Brevo, or any email tool

> The newsletter system handles **subscriptions only** — sending actual newsletter campaigns needs to be done from an external tool (e.g. Mailchimp) using the exported CSV.

---

## 8. Blog

### Creating a Post

1. Go to `/admin/blog` → click **New Post**
2. Fill in:
   - **Title** — the post headline
   - **Slug** — the URL path (e.g. `how-african-music-is-going-global` → orinlabi.com/blog/how-african-music-is-going-global)
   - **Excerpt** — short summary shown on the blog listing page
   - **Cover Image URL** — a direct image URL (from Cloudinary or any host)
   - **Content** — the full article body
3. Leave **Published** unchecked while drafting; toggle it on when ready to publish

### Editing a Post

1. Go to `/admin/blog`
2. Click the edit icon next to a post
3. Make changes → Save

Each published post automatically gets its own social media preview image (Open Graph) when shared on WhatsApp, Twitter, LinkedIn, etc.

---

## 9. Social & Contact Info

| Platform | Handle / Info |
|----------|--------------|
| Instagram | @orinlabimusic |
| X (Twitter) | @orinlabimusic |
| Email | info@orinlabi.com |
| WhatsApp / Phone | +234 811 469 1172 |
| Privacy email | privacy@orinlabi.com |
| Legal email | legal@orinlabi.com |
| Website | orinlabi.com |
| Parent company | ralphlawalgroup.com |

---

## 10. Technical Infrastructure

### Services Used

| Service | Purpose |
|---------|---------|
| **Next.js 16** | Website framework |
| **Vercel** | Hosting & automatic deployment |
| **Supabase** | Database + file storage + authentication |
| **Resend** | Transactional emails |
| **Cloudinary** | Logo image hosting |

### Database Tables (Supabase)

| Table | What it stores |
|-------|---------------|
| `releases` | All distribution applications — status, files, store links |
| `contact_messages` | Contact form submissions |
| `blog_posts` | Blog articles |
| `newsletter_subscribers` | Email subscribers |

### File Storage (Supabase)

| Bucket | What it stores |
|--------|---------------|
| `releases` | Audio files uploaded by artists |
| `cover-art` | Cover art images uploaded by artists |

### Deployment

The site is connected to GitHub (`github.com/ralphlawal/Orinlab-`). Every push to the `main` branch automatically deploys to Vercel within 1–2 minutes.

### Environment Variables (Vercel)

These are set in Vercel's project settings (not in the code):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key |
| `RESEND_API_KEY` | Resend email API key |
| `EMAIL_FROM` | From address for emails |
| `ADMIN_EMAIL` | Your email for admin notifications |

> ⚠️ Never share these values publicly. They are stored securely in Vercel, not in the code.

---

## 11. Common Tasks

### ✅ Approve an Artist Application

1. Log in at orinlabi.com/admin
2. Click **Releases** in the sidebar
3. Click the application row to open it
4. Set Status to **Approved**
5. Optionally add a note (the artist will see it)
6. Click **Save Changes** — the artist gets an email automatically

### ❌ Reject an Application

Same steps as above, but set Status to **Rejected**. You can add a note explaining why or encouraging them to reapply.

### 🔗 Add Store Links After Music Goes Live

1. Admin → Releases → click the approved release
2. Scroll to Store Links section
3. Paste the platform URLs
4. Click **Save Links**

### 📧 Reply to a Contact Message

1. Admin → Messages → open the message
2. Reply directly to the artist's email (click their email address or copy it)

### 📝 Publish a Blog Post

1. Admin → Blog → New Post (or edit existing)
2. Fill in all fields
3. Toggle **Published** to ON
4. Save

### 📋 Export Newsletter Subscribers

1. Admin → Newsletter
2. Click **Export CSV**
3. Import the file into Mailchimp / Brevo / etc.

### 🔒 Admin Password Reset

Go to Supabase dashboard → Authentication → Users → find your admin email → Reset password.

---

## 12. Troubleshooting

### "I'm not receiving admin notification emails"
- Check your spam/junk folder first
- Confirm `ADMIN_EMAIL=ralphlawal2003@gmail.com` is set in Vercel environment variables
- Check the Resend dashboard (resend.com) for delivery logs

### "An artist says they didn't receive their confirmation email"
- Check Resend dashboard for any delivery failures
- Ask the artist to check their spam folder
- Confirm the email address they used matches what they typed in the form

### "The portal magic link isn't working"
- Magic links expire after 1 hour — ask the artist to request a new one at /portal/login
- Check that the email they're using matches the one in their original application

### "The site isn't showing my latest changes"
- After pushing to GitHub, Vercel takes 1–2 minutes to deploy
- Hard-refresh the browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### "A release is showing wrong information"
- Go to Admin → Releases → open the release → the data is exactly as the artist submitted it
- You cannot edit release data from the admin panel — if correction is needed, the artist must resubmit

### "The Artists page isn't showing a newly approved artist"
- The Artists page refreshes every 60 seconds — wait a moment and reload
- Confirm the release status is set to `approved` in the admin panel

---

*This manual covers the full Orinlabí website as of June 2026. For technical changes or major updates, update this document accordingly.*
