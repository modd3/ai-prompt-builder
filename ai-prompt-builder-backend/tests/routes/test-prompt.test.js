const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');
const Prompt = require('../../models/prompt');

describe('Test Prompt API', () => {
  let testUser;
  let authToken;
  let testPrompt;

  beforeEach(async () => {
    // Create a test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    authToken = testUser.generateAuthToken();

    // Create a test prompt
    testPrompt = new Prompt({
      title: 'Test Prompt',
      content: 'This is a test prompt with {{variable1}} and {{variable2}}',
      targetModel: 'gpt-3.5-turbo',
      tags: ['test', 'api'],
      isPublic: true,
      author: testUser._id
    });
    await testPrompt.save();
  });

  describe('POST /api/test-prompt', () => {
    it('should test a prompt with variables', async () => {
      const testData = {
        promptContent: 'This is a test prompt with value1 and value2',
        modelId: 'gpt-3.5-turbo',
        customParams: {
          temperature: 0.7,
          maxTokens: 100
        },
        variables: {
          variable1: 'value1',
          variable2: 'value2'
        }
      };

      const response = await request(app)
        .post('/api/test-prompt')
        .send(testData)
        .expect(200);

      expect(response.body.model).toBe('gpt-3.5-turbo');
      expect(response.body.response).toBeDefined();
      expect(response.body.responseTime).toBeDefined();
      expect(response.body.loading).toBe(false);
      expect(response.body.error).toBeNull();
    });

    it('should test a prompt without variables', async () => {
      const testData = {
        promptContent: 'This is a simple test prompt',
        modelId: 'gpt-3.5-turbo',
        customParams: {
          temperature: 0.5
        }
      };

      const response = await request(app)
        .post('/api/test-prompt')
        .send(testData)
        .expect(200);

      expect(response.body.model).toBe('gpt-3.5-turbo');
      expect(response.body.response).toBeDefined();
      expect(response.body.responseTime).toBeDefined();
      expect(response.body.loading).toBe(false);
      expect(response.body.error).toBeNull();
    });

    it('should return 400 if prompt content is missing', async () => {
      const testData = {
        modelId: 'gpt-3.5-turbo'
        // Missing promptContent
      };

      const response = await request(app)
        .post('/api/test-prompt')
        .send(testData)
        .expect(400);

      expect(response.body.error).toBe('Prompt content and target model must be provided.');
    });

    it('should return 400 if model ID is missing', async () => {
      const testData = {
        promptContent: 'This is a test prompt'
        // Missing modelId
      };

      const response = await request(app)
        .post('/api/test-prompt')
        .send(testData)
        .expect(400);

      expect(response.body.error).toBe('Prompt content and target model must be provided.');
    });

    it('should handle invalid model ID', async () => {
      const testData = {
        promptContent: 'This is a test prompt',
        modelId: 'invalid-model'
      };

      const response = await request(app)
        .post('/api/test-prompt')
        .send(testData)
        .expect(200);

      // Should return error in the response body
      expect(response.body.error).toBeDefined();
      expect(response.body.response).toBeNull();
    });

    it('should handle custom parameters correctly', async () => {
      const testData = {
        promptContent: 'This is a test prompt',
        modelId: 'gpt-3.5-turbo',
        customParams: {
          temperature: 1.0,
          maxTokens: 50,
          topP: 0.9
        }
      };

      const response = await request(app)
        .post('/api/test-prompt')
        .send(testData)
        .expect(200);

      expect(response.body.model).toBe('gpt-3.5-turbo');
      expect(response.body.response).toBeDefined();
      expect(response.body.responseTime).toBeDefined();
    });
  });

  describe('POST /api/test-prompt/:id', () => {
    it('should test a saved prompt by ID', async () => {
      const testData = {
        modelId: 'gpt-3.5-turbo',
        customParams: {
          temperature: 0.7
        },
        variables: {
          variable1: 'test value 1',
          variable2: 'test value 2'
        }
      };

      const response = await request(app)
        .post(`/api/test-prompt/${testPrompt._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData)
        .expect(200);

      expect(response.body.model).toBe('gpt-3.5-turbo');
      expect(response.body.response).toBeDefined();
      expect(response.body.responseTime).toBeDefined();
      expect(response.body.loading).toBe(false);
      expect(response.body.error).toBeNull();
    });

    it('should return 404 if prompt not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const testData = {
        modelId: 'gpt-3.5-turbo'
      };

      const response = await request(app)
        .post(`/api/test-prompt/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData)
        .expect(404);

      expect(response.body.error).toBe('Prompt not found');
    });

    it('should return 401 if not authenticated', async () => {
      const testData = {
        modelId: 'gpt-3.5-turbo'
      };

      await request(app)
        .post(`/api/test-prompt/${testPrompt._id}`)
        .send(testData)
        .expect(401);
    });

    it('should return 403 if user is not the author of private prompt', async () => {
      // Create a private prompt
      const privatePrompt = new Prompt({
        title: 'Private Prompt',
        content: 'This is a private prompt',
        targetModel: 'gpt-3.5-turbo',
        tags: ['private'],
        isPublic: false,
        author: testUser._id
      });
      await privatePrompt.save();

      // Create another user
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();
      const otherToken = otherUser.generateAuthToken();

      const testData = {
        modelId: 'gpt-3.5-turbo'
      };

      const response = await request(app)
        .post(`/api/test-prompt/${privatePrompt._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(testData)
        .expect(403);

      expect(response.body.error).toBe('Access denied');
    });

    it('should allow testing public prompt by non-owner', async () => {
      // Create another user
      const otherUser = new User({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });
      await otherUser.save();
      const otherToken = otherUser.generateAuthToken();

      const testData = {
        modelId: 'gpt-3.5-turbo'
      };

      const response = await request(app)
        .post(`/api/test-prompt/${testPrompt._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(testData)
        .expect(200);

      expect(response.body.model).toBe('gpt-3.5-turbo');
      expect(response.body.response).toBeDefined();
    });
  });
});