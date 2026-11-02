import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Friendship } from '../src/models/Friendship';
import { Post } from '../src/models/Post';
import { AuthService } from '../src/services/authService';

const app = createApp();

describe('Public Space (Community Engagement) Suite', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let user3Token: string;
  let user3Id: string;

  beforeEach(async () => {
    const hash = await AuthService.hashPassword('Password123!');

    const u1 = await User.create({
      name: 'User One',
      email: 'user1@test.com',
      username: 'user_one',
      passwordHash: hash,
      role: 'student',
      isVerified: true,
    });
    user1Id = u1._id.toString();
    user1Token = AuthService.generateToken({
      userId: user1Id,
      email: u1.email,
      role: 'student',
    });

    const u2 = await User.create({
      name: 'User Two',
      email: 'user2@test.com',
      username: 'user_two',
      passwordHash: hash,
      role: 'student',
      isVerified: true,
    });
    user2Id = u2._id.toString();
    user2Token = AuthService.generateToken({
      userId: user2Id,
      email: u2.email,
      role: 'student',
    });

    const u3 = await User.create({
      name: 'User Three',
      email: 'user3@test.com',
      username: 'user_three',
      passwordHash: hash,
      role: 'student',
      isVerified: true,
    });
    user3Id = u3._id.toString();
    user3Token = AuthService.generateToken({
      userId: user3Id,
      email: u3.email,
      role: 'student',
    });
  });

  describe('1. Friend-Based Daily Posting Limit Enforcement', () => {
    it('should report 0 limit and block posting when user has 0 accepted friends', async () => {
      // Check allowance
      const allowanceRes = await request(app)
        .get('/api/public-space/allowance')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(allowanceRes.status).toBe(200);
      expect(allowanceRes.body.data.acceptedFriends).toBe(0);
      expect(allowanceRes.body.data.dailyLimit).toBe(0);
      expect(allowanceRes.body.data.allowed).toBe(false);
      expect(allowanceRes.body.data.remaining).toBe(0);

      // Attempt to post
      const postRes = await request(app)
        .post('/api/public-space/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          content: 'Hello community, this is my first post!',
          privacy: 'public',
        });

      expect(postRes.status).toBe(403);
      expect(postRes.body.message).toContain('No accepted friends found');
    });

    it('should allow exactly 1 post per day for user with 1 accepted friend and block the 2nd', async () => {
      // Create 1 accepted friendship between user1 and user2
      await Friendship.create({
        requester: user1Id,
        recipient: user2Id,
        status: 'accepted',
      });

      // Check allowance
      const allowanceRes = await request(app)
        .get('/api/public-space/allowance')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(allowanceRes.status).toBe(200);
      expect(allowanceRes.body.data.acceptedFriends).toBe(1);
      expect(allowanceRes.body.data.dailyLimit).toBe(1);
      expect(allowanceRes.body.data.remaining).toBe(1);
      expect(allowanceRes.body.data.allowed).toBe(true);

      // 1st post should succeed
      const post1Res = await request(app)
        .post('/api/public-space/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          content: 'My first post with 1 friend! #tech @user_two',
          privacy: 'public',
        });

      expect(post1Res.status).toBe(201);
      expect(post1Res.body.data.post.content).toBe('My first post with 1 friend! #tech @user_two');
      expect(post1Res.body.data.post.hashtags).toContain('tech');
      expect(post1Res.body.data.post.mentionedUsernames).toContain('user_two');

      // 2nd post on the same day should be blocked
      const post2Res = await request(app)
        .post('/api/public-space/posts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          content: 'Trying to post again today...',
          privacy: 'public',
        });

      expect(post2Res.status).toBe(403);
      expect(post2Res.body.message).toContain('daily posting limit');
    });

    it('should enforce limit tiers correctly (2-5 friends = 2 posts, 6-10 = 5 posts, >10 = unlimited)', async () => {
      // Add a 2nd friend
      await Friendship.create({
        requester: user1Id,
        recipient: user2Id,
        status: 'accepted',
      });
      await Friendship.create({
        requester: user1Id,
        recipient: user3Id,
        status: 'accepted',
      });

      const allowance2 = await request(app)
        .get('/api/public-space/allowance')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(allowance2.body.data.acceptedFriends).toBe(2);
      expect(allowance2.body.data.dailyLimit).toBe(2);
      expect(allowance2.body.data.isUnlimited).toBe(false);

      // Create 9 more dummy users & friendships to reach 11 friends
      for (let i = 4; i <= 12; i++) {
        const dummy = await User.create({
          name: `User ${i}`,
          email: `user${i}@test.com`,
          username: `user_${i}`,
          passwordHash: 'hash',
          role: 'student',
        });
        await Friendship.create({
          requester: user1Id,
          recipient: dummy._id,
          status: 'accepted',
        });
      }

      const allowanceUnlimited = await request(app)
        .get('/api/public-space/allowance')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(allowanceUnlimited.body.data.acceptedFriends).toBe(11);
      expect(allowanceUnlimited.body.data.isUnlimited).toBe(true);
      expect(allowanceUnlimited.body.data.dailyLimit).toBe(999999);
    });
  });

  describe('2. Friend Request Lifecycle & Relations', () => {
    it('should send a friend request successfully', async () => {
      const res = await request(app)
        .post('/api/public-space/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user2Id });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.recipient.toString()).toBe(user2Id);
    });

    it('should prevent sending friend request to oneself', async () => {
      const res = await request(app)
        .post('/api/public-space/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user1Id });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('You cannot send a friend request to yourself');
    });

    it('should accept a friend request and reflect updated status', async () => {
      // user1 sends request to user2
      const reqRes = await request(app)
        .post('/api/public-space/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ targetUserId: user2Id });

      const requestId = reqRes.body.data._id;

      // user2 accepts
      const acceptRes = await request(app)
        .post(`/api/public-space/friends/request/${requestId}/respond`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ action: 'accept' });

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.status).toBe('accepted');

      // Now both users have 1 friend
      const u1Allowance = await request(app)
        .get('/api/public-space/allowance')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(u1Allowance.body.data.acceptedFriends).toBe(1);

      const u2Allowance = await request(app)
        .get('/api/public-space/allowance')
        .set('Authorization', `Bearer ${user2Token}`);
      expect(u2Allowance.body.data.acceptedFriends).toBe(1);
    });

    it('should remove a friend and decrement friendship allowance', async () => {
      await Friendship.create({
        requester: user1Id,
        recipient: user2Id,
        status: 'accepted',
      });

      const removeRes = await request(app)
        .delete(`/api/public-space/friends/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(removeRes.status).toBe(200);

      const allowance = await request(app)
        .get('/api/public-space/allowance')
        .set('Authorization', `Bearer ${user1Token}`);
      expect(allowance.body.data.acceptedFriends).toBe(0);
    });
  });

  describe('3. Follow & Profile Systems', () => {
    it('should follow and unfollow a user independently of friend status', async () => {
      const followRes = await request(app)
        .post(`/api/public-space/users/${user2Id}/follow`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(followRes.status).toBe(200);
      expect(followRes.body.data.following).toBe(true);

      // Duplicate follow should handle gracefully
      const dupFollow = await request(app)
        .post(`/api/public-space/users/${user2Id}/follow`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(dupFollow.status).toBe(200);

      // Unfollow
      const unfollowRes = await request(app)
        .delete(`/api/public-space/users/${user2Id}/follow`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(unfollowRes.status).toBe(200);
      expect(unfollowRes.body.data.following).toBe(false);
    });

    it('should fetch user community profile with counts and relationship status', async () => {
      await Friendship.create({
        requester: user1Id,
        recipient: user2Id,
        status: 'accepted',
      });

      const profileRes = await request(app)
        .get('/api/public-space/users/user_two/profile')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.user.username).toBe('user_two');
      expect(profileRes.body.data.relationship.friendshipStatus).toBe('accepted');
      expect(profileRes.body.data.stats.acceptedFriendCount).toBe(1);
    });
  });

  describe('4. Post Interactions (Likes, Comments, Saves, Reports)', () => {
    let testPostId: string;

    beforeEach(async () => {
      // Give user1 1 friend so user1 can post
      await Friendship.create({
        requester: user1Id,
        recipient: user2Id,
        status: 'accepted',
      });

      const post = await Post.create({
        userId: user1Id,
        authorName: 'User One',
        username: 'user_one',
        content: 'Interactive test post #engineering',
        hashtags: ['engineering'],
        privacy: 'public',
        friendCountAtPost: 1,
      });
      testPostId = post._id.toString();
    });

    it('should like and unlike a post with counters updating correctly', async () => {
      // Like
      const likeRes = await request(app)
        .post(`/api/public-space/posts/${testPostId}/like`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(likeRes.status).toBe(200);
      expect(likeRes.body.data.likesCount).toBe(1);
      expect(likeRes.body.data.liked).toBe(true);

      // Unlike
      const unlikeRes = await request(app)
        .delete(`/api/public-space/posts/${testPostId}/like`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(unlikeRes.status).toBe(200);
      expect(unlikeRes.body.data.likesCount).toBe(0);
      expect(unlikeRes.body.data.liked).toBe(false);
    });

    it('should add and delete comments', async () => {
      const commentRes = await request(app)
        .post(`/api/public-space/posts/${testPostId}/comments`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ content: 'Great insights!' });

      expect(commentRes.status).toBe(201);
      expect(commentRes.body.data.content).toBe('Great insights!');
      expect(commentRes.body.data.authorName).toBe('User Two');

      const commentId = commentRes.body.data._id;

      // Delete comment
      const deleteRes = await request(app)
        .delete(`/api/public-space/posts/${testPostId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(deleteRes.status).toBe(200);
    });

    it('should save, unsave, and retrieve saved posts', async () => {
      // Save
      const saveRes = await request(app)
        .post(`/api/public-space/posts/${testPostId}/save`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(saveRes.status).toBe(200);
      expect(saveRes.body.data.saved).toBe(true);

      // Get saved
      const getSavedRes = await request(app)
        .get('/api/public-space/saved-posts')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(getSavedRes.status).toBe(200);
      expect(getSavedRes.body.data.length).toBe(1);
      expect(getSavedRes.body.data[0]._id.toString()).toBe(testPostId);

      // Unsave
      const unsaveRes = await request(app)
        .delete(`/api/public-space/posts/${testPostId}/save`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(unsaveRes.status).toBe(200);
      expect(unsaveRes.body.data.saved).toBe(false);
    });

    it('should report inappropriate content with duplicate rejection', async () => {
      const reportRes = await request(app)
        .post(`/api/public-space/posts/${testPostId}/report`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ reason: 'spam', details: 'Automated spam message' });

      expect(reportRes.status).toBe(201);
      expect(reportRes.body.message).toContain('Post reported to moderation team');

      // Duplicate report should be rejected with 409
      const dupReport = await request(app)
        .post(`/api/public-space/posts/${testPostId}/report`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ reason: 'spam' });

      expect(dupReport.status).toBe(409);
      expect(dupReport.body.message).toContain('already submitted a report');
    });
  });

  describe('5. Community Feed & Privacy Filters', () => {
    it('should exclude friends-only posts from users who are not friends', async () => {
      // user1 creates a friends-only post
      const post = await Post.create({
        userId: user1Id,
        authorName: 'User One',
        username: 'user_one',
        content: 'Confidential friends-only post!',
        privacy: 'friends',
        friendCountAtPost: 0,
      });

      // user3 (not a friend) requests the feed
      const feedRes = await request(app)
        .get('/api/public-space/feed')
        .set('Authorization', `Bearer ${user3Token}`);

      expect(feedRes.status).toBe(200);
      const postIds = feedRes.body.data.map((p: any) => p._id.toString());
      expect(postIds).not.toContain(post._id.toString());

      // user1 (the author) should see it
      const authorFeed = await request(app)
        .get('/api/public-space/feed')
        .set('Authorization', `Bearer ${user1Token}`);

      const authorPostIds = authorFeed.body.data.map((p: any) => p._id.toString());
      expect(authorPostIds).toContain(post._id.toString());
    });

    it('should fetch trending hashtags', async () => {
      await Post.create({
        userId: user1Id,
        authorName: 'User One',
        username: 'user_one',
        content: 'Post with #coding and #javascript',
        hashtags: ['coding', 'javascript'],
        privacy: 'public',
      });

      const tagsRes = await request(app).get('/api/public-space/trending-hashtags');
      expect(tagsRes.status).toBe(200);
      const tags = tagsRes.body.data.map((t: any) => t.tag);
      expect(tags).toContain('coding');
      expect(tags).toContain('javascript');
    });
  });
});
