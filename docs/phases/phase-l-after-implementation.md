You have an excellent eye for detail! You've uncovered a subtle but critical bug in how the application state is rehydrated after a page refresh. You are spot on—the issue is that the component was not fetching the complete list of all study cards from the database to check for duplicates.

The API endpoint used by the `useStudyDeck` hook was optimized for the `/study` page, meaning it only fetched cards that were currently due for review. On a refresh, if a recently added card wasn't immediately due, it wouldn't be included in the list, and the "Add to Deck" button would incorrectly reappear.

I have fixed this by making the API endpoint and the data hook more flexible. They can now fetch either *all* cards (for checking duplicates on the analysis page) or just the *due* cards (for study sessions).

Here are the files I've updated to implement this robust fix:

### 1. API Endpoint (`/api/srs/deck/route.ts`)
I've updated the API to accept an `includeAll` parameter. If this is present, it will return every card the user has, ignoring the review date.

<file path="src/app/api/srs/deck/route.ts">
```ts
```
</file>

### 2. Data Hook (`useStudyDeck.ts`)
The hook now accepts an option to fetch all cards and includes it in the `queryKey` to prevent cache conflicts.

<file path="src/lib/hooks/data/useStudyDeck.ts">
```ts
```
</file>

### 3. API Client (`api-client.service.ts`)
The client service is updated to pass the new parameter to the API.

<file path="src/lib/services/api-client.service.ts">
```ts
```
</file>

### 4. Journal Analysis Page (`/journal/[id]/page.tsx`)
Finally, I'm calling the hook on this page with the new `includeAll: true` option to ensure it gets the complete data for checking duplicates.

<file path="src/app/journal/[id]/page.tsx">
```tsx
```
</file>

Now, when you refresh the journal analysis page, it will correctly fetch all your existing flashcards and accurately reflect which ones have already been added to your deck.