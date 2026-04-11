import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";

// mock api
vi.mock("@/services/api", () => ({
  loginCustomer: vi.fn(),
  registerCustomer: vi.fn(),
}));

const renderHeader = (initialUser = null) => {
  if (initialUser) {
    localStorage.setItem("customer", JSON.stringify(initialUser));
  } else {
    localStorage.clear();
  }
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </MemoryRouter>,
  );
};

describe("Header", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should show Sign In button when not logged in", () => {
    renderHeader();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("should show user name when logged in", () => {
    renderHeader({
      customerName: "Test User",
      customerEmail: "test@example.com",
    });
    expect(screen.getByText(/Welcome, Test User/i)).toBeInTheDocument();
  });

  it("should show Log Out button when logged in", () => {
    renderHeader({
      customerName: "Test User",
      customerEmail: "test@example.com",
    });
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("should show Restaurants and About links", () => {
    renderHeader();
    expect(screen.getByText("Restaurants")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("should show DineFlex brand name", () => {
    renderHeader();
    expect(screen.getByText("Dine")).toBeInTheDocument();
    expect(screen.getByText("Flex")).toBeInTheDocument();
  });

  it("should clear user after logout", async () => {
    renderHeader({
      customerName: "Test User",
      customerEmail: "test@example.com",
    });

    await act(async () => {
      screen.getByText("Log Out").click();
    });

    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });
});
