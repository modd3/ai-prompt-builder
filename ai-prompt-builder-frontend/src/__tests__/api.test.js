import { fetchPrompts, createPrompt, testPrompt } from '../api/api';

// Mock axios to avoid actual network requests during testing
jest.mock('axios');

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('fetchPrompts', () => {
    it('should fetch prompts successfully', async () => {
      const mockResponse = {
        data: {
          prompts: [
            {
              _id: '1',
              title: 'Test Prompt',
              content: 'This is a test prompt',
              targetModel: 'gpt-3.5-turbo',
              tags: ['test'],
              isPublic: true
            }
          ],
          total: 1,
          page: 1,
          totalPages: 1
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await fetchPrompts();

      expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/prompts');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle fetch prompts error', async () => {
      const mockError = new Error('Network error');
      axios.get.mockRejectedValue(mockError);

      await expect(fetchPrompts()).rejects.toThrow('Network error');
    });
  });

  describe('createPrompt', () => {
    it('should create a prompt successfully', async () => {
      const promptData = {
        title: 'New Prompt',
        content: 'This is a new prompt',
        targetModel: 'gpt-4',
        tags: 'api, test',
        isPublic: true
      };

      const mockResponse = {
        data: {
          _id: '2',
          title: 'New Prompt',
          content: 'This is a new prompt',
          targetModel: 'gpt-4',
          tags: ['api', 'test'],
          isPublic: true
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await createPrompt(promptData);

      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/prompts', promptData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle create prompt error', async () => {
      const promptData = {
        title: 'New Prompt',
        content: 'This is a new prompt',
        targetModel: 'gpt-4'
      };

      const mockError = {
        response: {
          data: { msg: 'Please include title, content, and targetModel' }
        }
      };

      axios.post.mockRejectedValue(mockError);

      await expect(createPrompt(promptData)).rejects.toEqual(mockError);
    });
  });

  describe('testPrompt', () => {
    it('should test a prompt successfully', async () => {
      const testData = {
        promptContent: 'This is a test prompt',
        modelId: 'gpt-3.5-turbo',
        customParams: { temperature: 0.7 },
        variables: {}
      };

      const mockResponse = {
        data: {
          model: 'gpt-3.5-turbo',
          response: 'This is the AI response',
          responseTime: 1500,
          loading: false,
          error: null
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await testPrompt(testData);

      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/test-prompt', testData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle test prompt error', async () => {
      const testData = {
        promptContent: 'This is a test prompt',
        modelId: 'gpt-3.5-turbo'
      };

      const mockError = {
        response: {
          data: { error: 'Prompt content and target model must be provided.' }
        }
      };

      axios.post.mockRejectedValue(mockError);

      await expect(testPrompt(testData)).rejects.toEqual(mockError);
    });
  });
});