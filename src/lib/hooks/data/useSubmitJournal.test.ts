
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useSubmitJournal } from './useSubmitJournal';
import { apiClient } from '@/lib/services/api-client.service';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useLanguageStore } from '@/lib/stores/language.store';
import { useToast } from '@/components/ui/use-toast';

// Mock dependencies
jest.mock('@/lib/services/api-client.service');
jest.mock('@/lib/stores/auth.store');
jest.mock('@/lib/stores/language.store');
jest.mock('@/components/ui/use-toast');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedUseAuthStore = useAuthStore as jest.Mock;
const mockedUseLanguageStore = useLanguageStore as jest.Mock;
const mockedUseToast = useToast as jest.Mock;

const toastMock = jest.fn();

// Create a real QueryClient instance for each test run to ensure isolation
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Prevents retries from interfering with tests
      },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe('useSubmitJournal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock store return values
    mockedUseAuthStore.mockReturnValue({ user: { id: 'user-123' } });
    mockedUseLanguageStore.mockReturnValue({ activeTargetLanguage: 'spanish' });

    // Mock useToast to return our mock toast function
    mockedUseToast.mockReturnValue({
      toast: toastMock,
    });
  });

  it('should call apiClient.journal.create and invalidate queries on success', async () => {
    const { queryClient, wrapper } = createTestWrapper();
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    mockedApiClient.journal.create.mockResolvedValue({ id: 'journal-456', content: 'Test content' });

    const { result } = renderHook(() => useSubmitJournal(), { wrapper });

    const payload = { content: 'This is a test journal entry.', topicTitle: 'Testing' };
    
    await act(async () => {
      await result.current.mutateAsync(payload);
    });
    
    // Assert that the API was called correctly
    expect(mockedApiClient.journal.create).toHaveBeenCalledTimes(1);
    expect(mockedApiClient.journal.create).toHaveBeenCalledWith({
      ...payload,
      targetLanguage: 'spanish', // from the mocked language store
    });
    
    // Assert that the query cache was invalidated
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['journals', 'user-123', 'spanish'], // user id and language from stores
    });
    
    // Assert that no error toast was shown
    expect(toastMock).not.toHaveBeenCalled();
  });

  it('should call toast with an error message on failure', async () => {
    const { queryClient, wrapper } = createTestWrapper();
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');
    
    const mockError = new Error('Your journal entry could not be saved.');
    mockedApiClient.journal.create.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSubmitJournal(), { wrapper });

    const payload = { content: 'This will fail.', topicTitle: 'Failure Test' };
    
    await act(async () => {
      try {
        await result.current.mutateAsync(payload);
      } catch (e) {
        // Catch the expected error to prevent test failure
      }
    });

    // Assert that the API was called
    expect(mockedApiClient.journal.create).toHaveBeenCalledTimes(1);
    
    // Assert that queries were NOT invalidated on failure
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();

    // Assert that the error toast was shown
    expect(toastMock).toHaveBeenCalledTimes(1);
    expect(toastMock).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Submission Failed",
        description: "Your journal entry could not be saved.",
    });
  });
});