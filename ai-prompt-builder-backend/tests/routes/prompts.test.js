const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');
const Prompt = require('../../models/prompt');

describe('Prompts API', () => {
  let authToken;
  let testUser;
  let testPrompt;

  beforeEach(async () => {
    // Create a test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();

    // Generate auth token
    authToken = testUser.generateAuthToken();

    // Create a test prompt
    testPrompt = new Prompt({
      title: 'Test Prompt',
      content: 'This is a test prompt',
      targetModel: 'gpt-3.5-turbo',
      tags: ['test', 'api'],
      isPublic: true,
      author: testUser._id
    });
    await testPrompt.save();
  });

  describe('GET /api/prompts', () => {
    it('should fetch all public prompts', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .expect(200);

      expect(response.body.prompts).toHaveLength(1);
      expect(response.body.prompts[0].title).toBe('Test Prompt');
      expect(response.body.prompts[0].author.name).toBe('Test User');
    });

    it('should filter prompts by target model', async () => {
      const response = await request(app)
        .get('/api/prompts?targetModel=gpt-3.5-turbo')
        .expect(200);

      expect(response.body.prompts).toHaveLength(1);
      expect(response.body.prompts[0].targetModel).toBe('gpt-3.5-turbo');
    });

    it('should filter prompts by tags', async () => {
      const response = await request(app)
        .get('/api/prompts?tags=test')
        .expect(200);

      expect(response.body.prompts).toHaveLength(1);
      expect(response.body.prompts[0].tags).toContain('test');
    });

    it('should sort prompts by rating', async () => {
      // Create another prompt with higher rating
      const highRatedPrompt = new Prompt({
        title: 'High Rated Prompt',
        content: 'This is a high rated prompt',
        targetModel: 'gpt-3.5-turbo',
        tags: ['test'],
        isPublic: true,
        author: testUser._id,
        rating: 4.5
      });
      await highRatedPrompt.save();

      const response = await request(app)
        .get('/api/prompts?sort=rating')
        .expect(200);

      expect(response.body.prompts[0].title).toBe('High Rated Prompt');
    });
  });

  describe('POST /api/prompts', () => {
    it('should create a new prompt', async () => {
      const newPromptData = {
        title: 'New Test Prompt',
        content: 'This is a new test prompt',
        targetModel: 'gpt-4',
        tags: 'api, test',
        isPublic: true
      };

      const response = await request(app)
        .post('/api/prompts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPromptData)
        .expect(201);

      expect(response.body.title).toBe(newPromptData.title);
      expect(response.body.content).toBe(newPromptData.content);
      expect(response.body.targetModel).toBe(newPromptData.targetModel);
      expect(response.body.tags).toEqual(['api', 'test']);
      expect(response.body.isPublic).toBe(true);

      // Check if prompt was added to user's prompts array
      const updatedUser = await User.findById(testUser._id).populate('prompts');
      expect(updatedUser.prompts).toHaveLength(2);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/prompts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Incomplete Prompt'
          // Missing content and targetModel
        })
        .expect(400);

      expect(response.body.msg).toBe('Please include title, content, and targetModel');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .post('/api/prompts')
        .send({
          title: 'Unauthorized Prompt',
          content: 'This should fail',
          targetModel: 'gpt-3.5-turbo'
        })
        .expect(401);
    });
  });

  describe('GET /api/prompts/:id', () => {
    it('should fetch a specific prompt by ID', async () => {
      const response = await request(app)
        .get(`/api/prompts/${testPrompt._id}`)
        .expect(200);

      expect(response.body.title).toBe('Test Prompt');
      expect(response.body.content).toBe('This is a test prompt');
      expect(response.body.author.name).toBe('Test User');
    });

    it('should return 404 if prompt not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/prompts/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PUT /api/prompts/:id', () => {
    it('should update a prompt', async () => {
      const updateData = {
        title: 'Updated Prompt Title',
        content: 'Updated content',
        targetModel: 'gpt-4',
        tags: 'updated, test',
        isPublic: false
      };

      const response = await request(app)
        .put(`/api/prompts/${testPrompt._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.content).toBe(updateData.content);
      expect(response.body.targetModel).toBe(updateData.targetModel);
      expect(response.body.tags).toEqual(['updated', 'test']);
      expect(response.body.isPublic).toBe(false);
    });

    it('should return 403 if user is not the author', async () => {
      // Create another user
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();
      const otherToken = otherUser.generateAuthToken();

      await request(app)
        .put(`/api/prompts/${testPrompt._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .put(`/api/prompts/${testPrompt._id}`)
        .send({ title: 'Unauthorized Update' })
        .expect(401);
    });
  });

  describe('DELETE /api/prompts/:id', () => {
    it('should delete a prompt', async () => {
      const response = await request(app)
        .delete(`/api/prompts/${testPrompt._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.msg).toBe('Prompt removed');

      // Verify prompt was deleted
      const deletedPrompt = await Prompt.findById(testPrompt._id);
      expect(deletedPrompt).toBeNull();

      // Verify prompt was removed from user's prompts array
      const updatedUser = await User.findById(testUser._id).populate('prompts');
      expect(updatedUser.prompts).toHaveLength(0);
    });

    it('should return 403 if user is not the author', async () => {
      // Create another user
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();
      const otherToken = otherUser.generateAuthToken();

      await request(app)
        .delete(`/api/prompts/${testPrompt._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });
  });

  describe('GET /api/prompts/mine', () => {
    it('should fetch user\'s own prompts', async () => {
      const response = await request(app)
        .get('/api/prompts/mine')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Test Prompt');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .get('/api/prompts/mine')
        .expect(401);
    });
  });

  describe('GET /api/prompts/tags', () => {
    it('should fetch unique tags', async () => {
      // Create another prompt with different tags
      const anotherPrompt = new Prompt({
        title: 'Another Prompt',
        content: 'Another test prompt',
        targetModel: 'gpt-3.5-turbo',
        tags: ['api', 'development'],
        isPublic: true,
        author: testUser._id
      });
      await anotherPrompt.save();

      const response = await request(app)
        .get('/api/prompts/tags')
        .expect(200);

      expect(response.body).toEqual(expect.arrayContaining(['test', 'api', 'development']));
    });
  });

  describe('POST /api/prompts/:id/rate', () => {
    it('should rate a prompt', async () => {
      const response = await request(app)
        .post(`/api/prompts/${testPrompt._id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 4 })
        .expect(200);

      expect(response.body.rating).toBe(4);
      expect(response.body.ratingsCount).toBe(1);

      // Verify the prompt was updated in database
      const updatedPrompt = await Prompt.findById(testPrompt._id);
      expect(updatedPrompt.rating).toBe(4);
      expect(updatedPrompt.ratingsCount).toBe(1);
      expect(updatedPrompt.ratedBy).toContain(testUser._id);
    });

    it('should return 400 if user tries to rate their own prompt', async () => {
      await request(app)
        .post(`/api/prompts/${testPrompt._id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 5 })
        .expect(200); // First rating should succeed

      // Try to rate again (should fail)
      await request(app)
        .post(`/api/prompts/${testPrompt._id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 3 })
        .expect(400);
    });

    it('should return 400 if rating is invalid', async () => {
      await request(app)
        .post(`/api/prompts/${testPrompt._id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 6 }) // Invalid rating
        .expect(400);
    });
  });
});