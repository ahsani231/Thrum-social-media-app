# Thrum — a mini social platform (Next.js)

Profiles, posts, comments, likes, and follows — built entirely in Next.js
(App Router), using Next's own Route Handlers as the backend instead of a
separate Express/Django server.

## Stack

| Layer      | Choice                                          |
|------------|--------------------------------------------------|
| Framework  | Next.js 16 (App Router)                          |
| Styling    | Tailwind CSS v4                                   |
| Animation  | Framer Motion                                     |
| Database   | SQLite via Node's built-in `node:sqlite`          |
| Auth       | NextAuth.js v5 (Credentials provider + bcryptjs)  |

**Why `node:sqlite` instead of Prisma/Postgres?** It ships inside Node 22+,
so there's nothing to install, no connection string to configure, and no
native build step — clone, `npm install`, `npm run dev`. The whole data
layer is ~250 lines in `lib/data.js`, which is also a good thing to read
and be able to explain in an internship review. If you'd rather run
Postgres + Prisma for production, swap out `lib/db.js` / `lib/data.js` —
every route handler only imports functions from `lib/data.js`, so that's
the one file boundary you'd need to reimplement.

**Requirement:** Node.js **22.5+** (for `node:sqlite`). Check with `node -v`.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. Create an account — a SQLite file is created
automatically at `data/thrum.db` the first time you run it.

## Where every file goes

Paths are relative to your project root (the folder containing
`package.json`).

```
.env.local                                       # AUTH_SECRET + NEXTAUTH_URL
middleware.js                                     # route protection

lib/
  db.js                                            # sqlite connection + schema
  data.js                                          # all queries (users/posts/comments/likes/follows)
  auth.js                                           # NextAuth config

components/
  Providers.jsx                                     # <SessionProvider> wrapper
  ThreadMark.jsx                                     # logo mark (SVG)
  Avatar.jsx                                         # avatar circle
  Navbar.jsx                                          # app nav bar
  AuthShell.jsx                                       # shared login/signup shell
  LoginForm.jsx
  SignupForm.jsx
  LandingHero.jsx                                     # marketing hero on "/"
  PostComposer.jsx                                    # "what are you posting" box
  PostCard.jsx                                        # single post, incl. delete-own-post
  CommentSection.jsx                                  # replies list + reply form
  LikeButton.jsx                                      # animated like toggle
  FollowButton.jsx                                    # animated follow toggle
  FeedClient.jsx                                      # feed page client logic (All / Following tabs)
  ProfileClient.jsx                                   # profile header, bio editor, post list

app/
  layout.js                                           # fonts + <Providers>
  globals.css                                         # design tokens, theme
  page.js                                             # "/" — landing page
  login/page.js                                       # "/login"
  signup/page.js                                      # "/signup"
  feed/page.js                                        # "/feed" (protected)
  profile/[username]/page.js                          # "/profile/handle" (protected)

  api/
    auth/[...nextauth]/route.js                       # NextAuth handlers
    register/route.js                                 # POST — create account
    profile/bio/route.js                               # POST — update own bio
    posts/route.js                                      # GET (feed) / POST (create post)
    posts/[id]/route.js                                  # GET / DELETE a post
    posts/[id]/like/route.js                             # POST — toggle like
    posts/[id]/comments/route.js                         # GET / POST comments
    users/[username]/route.js                            # GET — profile + their posts
    users/[username]/follow/route.js                     # POST — toggle follow
```

## How a request actually flows (example: liking a post)

1. `components/LikeButton.jsx` is a client component. On click it
   optimistically flips its own state, then calls
   `fetch('/api/posts/<id>/like', { method: 'POST' })`.
2. `app/api/posts/[id]/like/route.js` runs on the server. It calls
   `auth()` to find out who's logged in, then calls `toggleLike()` from
   `lib/data.js`.
3. `toggleLike()` runs a plain SQL `INSERT`/`DELETE` against the `likes`
   table via `lib/db.js`, and returns the fresh like count.
4. The route handler sends that back as JSON; the button reconciles its
   optimistic guess with the real number.

Posting, commenting, and following all follow the same shape:
**client component → `fetch` → route handler → `lib/data.js` → SQLite →
JSON response → UI update.**

## Design notes

The visual language is built around a single idea: a social feed is a
thread that people are stitching together. That shows up as:
- a needle-and-thread logo mark (`ThreadMark.jsx`)
- dashed "stitch" divider lines (`.stitch` / `.stitch-h` in `globals.css`)
  connecting the hero's post previews and separating feed sections
- warm ink/gold/coral/teal palette instead of a default light theme
- Fraunces (serif display) for headlines, Inter for UI text, JetBrains
  Mono for handles/timestamps/counts

## Extending it

- Swap SQLite for Postgres + Prisma for a real deployment (see note above)
- Add image uploads to posts (e.g. via an S3-compatible bucket)
- Add pagination/infinite scroll to `getFeed()` once post volume grows
- Add a notifications table (new follower, new like, new comment)
