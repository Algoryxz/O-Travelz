import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "../src/api/client";

describe("Auth Handshake & In-Memory Bearer Token Management", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: ApiClient;

  beforeEach(() => {
    mockFetch = vi.fn();
    client = new ApiClient({
      baseUrl: "https://otravelz-backend.onrender.com",
      fetchFn: mockFetch as unknown as typeof fetch,
    });
  });

  it("exchanges single-use auth ticket and sets in-memory bearer token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          authenticated: true,
          user: {
            id: "user-123",
            email: "traveler@odisha.in",
            name: "Odisha Traveler",
            display_name: "Odisha Traveler",
            avatar_url: null,
            provider: "google",
          },
          session_token: "mock_session_raw_token_xyz",
        }),
    });

    const res = await client.exchangeAuthTicket("valid.auth.ticket");
    expect(res.authenticated).toBe(true);
    expect(res.user?.email).toBe("traveler@odisha.in");
    expect(client.getBearerToken()).toBe("mock_session_raw_token_xyz");

    // Next request should automatically attach Authorization: Bearer <token>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          authenticated: true,
          user: res.user,
        }),
    });

    await client.getAuthMe();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    const secondCallHeaders = mockFetch.mock.calls[1][1].headers;
    expect(secondCallHeaders["Authorization"]).toBe("Bearer mock_session_raw_token_xyz");
  });

  it("wipes in-memory bearer token on logout", async () => {
    client.setBearerToken("test-token-to-wipe");
    expect(client.getBearerToken()).toBe("test-token-to-wipe");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ authenticated: false }),
    });

    await client.logout();
    expect(client.getBearerToken()).toBeNull();
  });
});
