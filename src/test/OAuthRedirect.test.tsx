import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import OAuthRedirect from "@/pages/OAuthRedirect";
import { AuthProvider } from "@/context/AuthContext";

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithProviders = (url: string) => {
  window.history.pushState({}, "", url);
  return render(
    <MemoryRouter initialEntries={[url]}>
      <AuthProvider>
        <OAuthRedirect />
      </AuthProvider>
    </MemoryRouter>,
  );
};

describe("OAuthRedirect", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should show signing in message", () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          customerName: "Test",
          customerEmail: "test@example.com",
          phone: "123",
        }),
    });
    renderWithProviders("/oauth2/redirect?token=valid-token");
    expect(screen.getByText("Signing in with Google...")).toBeInTheDocument();
  });

  it("should navigate to home when no token in URL", async () => {
    renderWithProviders("/oauth2/redirect");
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should call fetch and navigate home when token exists", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          customerName: "Test User",
          customerEmail: "test@example.com",
          phone: "123",
        }),
    });

    renderWithProviders("/oauth2/redirect?token=valid-token");

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should navigate to /login when fetch fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderWithProviders("/oauth2/redirect?token=valid-token");

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
    alertMock.mockRestore();
  });
});
