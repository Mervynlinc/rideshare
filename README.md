# RideShare

Campus ride-sharing app where students split boda-boda costs.

---

## The Problem

University students in Uganda spend 20-30% of their allowance on transport — mostly on boda-bodas. Students going the same route rarely coordinate, so everyone pays full fare for what could easily be a shared ride.

WhatsApp and Telegram groups exist for this, but they offer no accountability, no trust signals, and no way to verify you're meeting the right person. It's chaotic and unsafe.

## The Solution

RideShare connects students heading the same way. Post your ride, find a buddy, split the fare equally. Every rider builds a trust score over time. A Safety PIN exchange at the meetup confirms identity. Campus-based filtering means you only see rides from your university — no noise.

RideShare is a **matching platform**, not a transport provider. We don't operate vehicles, employ drivers, or handle payments. Users pay the boda rider directly and settle between themselves.

---

## Features

- **Campus-Only Network** — Sign up with your university email. Ride feed is filtered to your campus only. A MUST student never sees rides from MAK.
- **Trust Scores** — Every completed ride generates a rating. Your aggregate score is visible to future ride buddies. Builds accountability over time.
- **Safety PIN Verification** — On ride acceptance, each participant gets a unique 4-digit PIN. At the meetup point, you exchange PINs verbally. If they match, you're with the right person. If not — walk away.
- **In-App Chat** — Opens immediately on request acceptance (before PIN exchange). Used for location coordination, identity cues ("I'm wearing a blue jumper"), and timing updates. Chat expires 1 hour after ride completion.
- **Scheduled Rides** — Post rides up to 7 days in advance with a day picker. Built for market days, weekend plans, and semester travel. All rides auto-expire after 7 days.
- **Same-Gender Preference** — Poster can set "Same Gender Only" on their ride. Joiners can filter by this on the feed.
- **Email Verification Flags** — University email gets you flagged "Safe to Ride" (verified). Standard email gets "Ride with Caution" (unverified). Your choice affects whether people accept your requests.
- **No Phone Numbers** — All communication through in-app chat. No phone numbers are collected or shared. Prevents harassment outside the app and protects personal data.
- **Comprehensive Ride History** — Every ride you've ever taken is stored and viewable.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native / Expo |
| Backend | Supabase |
| Database | PostgreSQL (via Supabase) |
| Real-time | Supabase Realtime |
| Auth | Supabase Auth (email + password) |

---

## How It Works

### Posting a Ride
1. Tap the green "+" button on the home feed
2. Enter origin and destination (text)
3. Select departure type: **Immediate** (leaving now) or **Scheduled** (pick a day within the next 7 days)
4. Set number of available seats 
5. Optionally set gender preference: Any or Same Gender
6. Post it. You're automatically added as a participant

### Joining a Ride
1. Scroll the feed (filtered to your campus by default)
2. Use filter chips: Same Gender, time range, mode
3. Tap a ride card to see full details and poster's trust score
4. Tap "Request to Join" — chat opens immediately
5. Use chat to coordinate: share your location, describe what you're wearing, say if you're running late
6. Poster accepts your request in "My Rides" → "Manage Requests"
7. At the meetup point, exchange Safety PINs (accessed from the shield icon in chat header)
8. After the ride, rate your buddy 

### Safety PIN Flow
1. When a join request is accepted, both users get a unique 4-digit PIN 
2. Chat opens immediately — PINs are NOT required to start chatting
3. When you physically meet, tap the shield icon in the chat header
4. Read your PIN aloud to your buddy, enter theirs
5. If both match → verified. If not → do not proceed
6. PINs are stored per-ride-per-user. You can never see your buddy's PIN value 

---



## License

This project is proprietary software. All rights reserved. See [LICENSE](LICENSE) for details.

---

## Contact

- **Email**: [rideshare2026.io@gmail.com]

---
