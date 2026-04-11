import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// 用一个简单的测试组件来读取 context 的值
const TestComponent = () => {
  const { currentUser, login, logout } = useAuth();
  return (
    <div>
      <span>{currentUser ? currentUser.customerName : "not logged in"}</span>
      <button
        onClick={() =>
          login(
            { customerName: "Test User", customerEmail: "test@example.com" },
            "mock-token",
          )
        }
      >
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should show not logged in when no user in localStorage", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(screen.getByText("not logged in")).toBeInTheDocument();
  });

  it("should show user name after login", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await act(async () => {
      screen.getByText("login").click();
    });
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("should save user and token to localStorage on login", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await act(async () => {
      screen.getByText("login").click();
    });
    expect(localStorage.getItem("customer")).toContain("Test User");
    expect(localStorage.getItem("dineflexUser")).toContain("mock-token");
  });

  it("should show not logged in after logout", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await act(async () => {
      screen.getByText("login").click();
    });
    await act(async () => {
      screen.getByText("logout").click();
    });
    expect(screen.getByText("not logged in")).toBeInTheDocument();
  });

  it("should clear localStorage on logout", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await act(async () => {
      screen.getByText("login").click();
    });
    await act(async () => {
      screen.getByText("logout").click();
    });
    expect(localStorage.getItem("customer")).toBeNull();
    expect(localStorage.getItem("dineflexUser")).toBeNull();
  });

  it("should restore user from localStorage on mount", () => {
    localStorage.setItem(
      "customer",
      JSON.stringify({
        customerName: "Stored User",
        customerEmail: "stored@example.com",
      }),
    );
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(screen.getByText("Stored User")).toBeInTheDocument();
  });

  it("should throw error when useAuth is used outside AuthProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within AuthProvider",
    );
    consoleError.mockRestore();
  });
});
