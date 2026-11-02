# Task 1: Public Space (Community Engagement) Module

## Overview
The **Public Space** module extends the InternBridge platform with interactive community networking, peer discussion, career milestone sharing, and structured student collaboration. It integrates directly into the existing InternBridge full-stack architecture while preserving all existing internship, job, application, and administration functionality.

---

## 1. Mandatory Business Rule: Friend-Based Daily Posting Limit

To foster genuine networking and prevent spam, community posting privileges are strictly anchored to the user's count of **accepted friends**:

| Accepted Friends | Daily Post Limit | Enforcement Behavior |
| :--- | :--- | :--- |
| **0 Friends** | **0 posts/day** | Posting blocked (HTTP 403). Clear in-app guidance encourages discovering and adding friends. |
| **1 Friend** | **1 post/day** | User can publish exactly 1 post. Subsequent attempts on the same day return HTTP 403. |
| **2 – 5 Friends** | **2 posts/day** | Allows up to 2 posts daily. |
| **6 – 10 Friends** | **5 posts/day** | Allows up to 5 posts daily. |
| **> 10 Friends** | **Unlimited** | No daily quota restrictions. |

### Technical Enforcement Rules:
1. **Server-Side Enforcement**: Calculated exclusively on the backend (`FriendLimitService.ts`) via MongoDB queries; no client-side values are trusted.
2. **Indian Standard Time (IST, UTC+05:30) Daily Window**: Day boundaries (`00:00:00` to `23:59:59.999`) are evaluated in IST so all users across India experience synchronized midnight resets.
3. **Friendship Parity**: Bidirectional query checks `{ $or: [{ requester: userId }, { recipient: userId }], status: 'accepted' }` to ensure friendships established by either party count equally.
4. **Historical Transparency**: Each post records `friendCountAtPost` at the moment of publication for auditability.

---

## 2. Separate Friend and Follow Architecture

The platform separates close connections from broadcast following:
- **Friend System (`Friendship` Model)**:
  - Requires mutual consent: `requester` sends a request (`status: 'pending'`); `recipient` accepts (`status: 'accepted'`) or rejects (`status: 'rejected'`).
  - Directly governs daily posting allowances.
  - Grants access to `privacy: 'friends'` posts.
- **Follow System (`Follow` Model)**:
  - One-directional broadcast subscription without mutual approval.
  - Tracks `followersCount` and `followingCount`.
  - Independent of posting quotas.

---

## 3. Feed Prioritization & Algorithm

The Community Feed (`/api/public-space/feed` and `/public-space`) supports multi-tab viewing with an intelligent default:

1. **For You (Personalized Default)**:
   - **Tier 1 (High Priority)**: Posts created by accepted friends (most recent first).
   - **Tier 2**: Trending public posts across the platform (ranked by engagement score: `likesCount * 2 + commentsCount * 3 + sharesCount * 4`).
   - **Tier 3**: Recent public posts in chronological order.
2. **Friends Only**: Filtered strictly to posts published by accepted friends (`privacy: 'public'` or `'friends'`).
3. **Trending**: Global posts sorted by engagement counters.
4. **Recent**: Pure chronological stream of public posts.
5. **Hashtag & Keyword Filters**: Filter by `#hashtag` or full-text query.

---

## 4. REST API Reference

All community endpoints are mounted at `/api/public-space`:

### Allowance & Feed
- `GET /api/public-space/allowance`: Returns current accepted friend count, daily limit, used today, remaining allowance, and guidance message.
- `GET /api/public-space/feed?tab={all|friends|trending|recent}&page=1&limit=10&hashtag={tag}&search={q}`: Retrieves community feed with interaction flags (`isLiked`, `isSaved`, `isAuthor`).
- `GET /api/public-space/posts/:id`: Retrieves individual post details.
- `POST /api/public-space/posts`: Creates a new post (validates daily friend allowance).
- `PATCH /api/public-space/posts/:id`: Updates post text or privacy (author only).
- `DELETE /api/public-space/posts/:id`: Deletes post (author or admin only).

### Interactions
- `POST /api/public-space/posts/:id/like`: Likes a post (idempotent, increments `likesCount`).
- `DELETE /api/public-space/posts/:id/like`: Unlikes a post (decrements `likesCount`).
- `GET /api/public-space/posts/:id/comments`: Lists post comments.
- `POST /api/public-space/posts/:id/comments`: Adds a comment (increments `commentsCount`).
- `DELETE /api/public-space/posts/:id/comments/:commentId`: Deletes a comment (author only).
- `POST /api/public-space/posts/:id/share`: Shares a post with optional commentary.
- `POST /api/public-space/posts/:id/save`: Bookmarks a post for the authenticated user.
- `DELETE /api/public-space/posts/:id/save`: Removes post from bookmarks.
- `GET /api/public-space/saved-posts`: Retrieves the user's saved posts.
- `POST /api/public-space/posts/:id/report`: Reports content (reasons: `spam`, `harassment`, `inappropriate`, `misinformation`, `other`; prevents duplicate reports with HTTP 409).
- `POST /api/public-space/posts/:id/view`: Records view count with 24-hour IP/user deduplication.

### Friends & Following
- `POST /api/public-space/friends/request`: Sends a friend request (`{ targetUserId }`).
- `POST /api/public-space/friends/request/:id/respond`: Accepts or rejects request (`{ action: 'accept' | 'reject' }`).
- `DELETE /api/public-space/friends/request/:targetUserId/cancel`: Cancels outgoing request.
- `DELETE /api/public-space/friends/:targetUserId`: Removes an accepted friend (recalculates posting quota).
- `GET /api/public-space/friends?userId={id}`: Lists accepted friends.
- `GET /api/public-space/friends/pending`: Lists incoming pending friend requests.
- `POST /api/public-space/users/:targetUserId/follow`: Follows a user.
- `DELETE /api/public-space/users/:targetUserId/follow`: Unfollows a user.
- `GET /api/public-space/users/:identifier/profile`: Retrieves complete community profile, stats, and relationship status.

### Discovery & Notifications
- `GET /api/public-space/users/search?q={query}`: Searches users by name or username.
- `GET /api/public-space/trending-hashtags`: Returns top hashtags from the past 14 days with usage counts.
- `GET /api/public-space/notifications`: Returns in-app community notifications.
- `PATCH /api/public-space/notifications/:id/read`: Marks notification as read.
- `PATCH /api/public-space/notifications/read-all`: Marks all notifications as read.

---

## 5. Frontend Pages & Components

### Pages (`frontend/app/public-space/`)
1. **`/public-space`**: Main Community Feed with multi-tab viewing, Create Post box, Allowance badge, and trending tags.
2. **`/public-space/profile/[username]`**: Community profile with cover banner, bio, metrics (friends, followers, following, posts), relationship action buttons, and posts/friends tabs.
3. **`/public-space/discovery`**: Peer discovery, user search, incoming friend request manager, and popular hashtags.
4. **`/public-space/saved`**: Saved posts bookmark library.
5. **`/public-space/notifications`**: Full notifications center with category filters and "Mark all read".

### Components (`frontend/components/public-space/`)
- `AllowanceBadge.tsx`: Displays accepted friends, daily quota, remaining posts, and dynamic tier upgrade advice.
- `CreatePostCard.tsx`: Rich post composer with character counter, hashtag detection, media attachments (photo/video), privacy selector, and friend restriction callout.
- `PostCard.tsx`: Complete post display with author info, friend count at post, media renderers, like/comment/share/save/report actions, and inline discussion drawer.
- `FriendFollowActions.tsx`: Multi-state action buttons (Add Friend, Request Sent, Accept, Reject, Friends, Follow/Unfollow).
- `NotificationBell.tsx`: Real-time notification bell in navigation with unread count badge and quick dropdown.
