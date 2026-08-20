# Regression log

## Double comment submission

- Reproduction: double-click the comment submit button while the request is pending.
- Cause: two independent promises could be started before the first response completed.
- Fix: `useSingleFlight` returns the active promise and disables repeated work until it settles.
- Regression: unit single-flight test and Playwright double-click scenario.

## Stale search response

- Reproduction: enter a slow search term, then immediately replace it with another term.
- Cause: the older response could render after the newer one.
- Fix: request fetching explicitly uses `dedupe: 'cancel'`; input is debounced and URL state is updated from the debounced value.
- Regression: Playwright delays the first response and verifies that the second result remains visible.

## Private route after logout

- Reproduction: log out and navigate back to `/requests`.
- Cause: client state could outlive the server session.
- Fix: logout invalidates the server session, clears the auth store, and the global middleware re-checks protected navigation.
- Regression: critical Playwright workflow revisits the private route after logout.

## State after refresh

- URL-owned filters are restored from query parameters during SSR.
- Interface preferences are hydrated from local storage.
- Domain state is reloaded from the API and is never treated as Pinia-owned source of truth.
