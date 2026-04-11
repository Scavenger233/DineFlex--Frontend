import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import Index from "@/pages/Index";

vi.mock("@/services/api", () => ({
  apiService: {
    getRestaurants: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: "The Sizzling Grill",
        location: "Dublin",
        cuisine: "Irish",
        thumbnailUrl: "http://example.com/1.jpg",
        hasEarlyBird: true,
        hasLastMinute: false,
      },
      {
        id: 2,
        name: "Bella Italia",
        location: "Cork",
        cuisine: "Italian",
        thumbnailUrl: "http://example.com/2.jpg",
        hasEarlyBird: false,
        hasLastMinute: true,
      },
    ]),
  },
}));

const renderIndex = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("Index", () => {
  it("should render the heading", () => {
    renderIndex();
    expect(screen.getByText(/Find Your Perfect/i)).toBeInTheDocument();
  });

  it("should render search input", () => {
    renderIndex();
    expect(
      screen.getByPlaceholderText(/Search restaurants/i),
    ).toBeInTheDocument();
  });

  it("should render filter buttons", () => {
    renderIndex();
    expect(screen.getByText("All Restaurants")).toBeInTheDocument();
    expect(screen.getByText("Early Bird Offers")).toBeInTheDocument();
    expect(screen.getByText("Last Minute Deals")).toBeInTheDocument();
  });

  it("should render restaurants after loading", async () => {
    renderIndex();
    await waitFor(() => {
      expect(screen.getByText("The Sizzling Grill")).toBeInTheDocument();
      expect(screen.getByText("Bella Italia")).toBeInTheDocument();
    });
  });

  it("should filter restaurants by search term", async () => {
    renderIndex();
    await waitFor(() => {
      expect(screen.getByText("The Sizzling Grill")).toBeInTheDocument();
    });
    await userEvent.type(
      screen.getByPlaceholderText(/Search restaurants/i),
      "Italian",
    );
    await waitFor(() => {
      expect(screen.queryByText("The Sizzling Grill")).not.toBeInTheDocument();
      expect(screen.getByText("Bella Italia")).toBeInTheDocument();
    });
  });

  it("should filter by Early Bird", async () => {
    renderIndex();
    await waitFor(() => {
      expect(screen.getByText("The Sizzling Grill")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText("Early Bird Offers"));
    await waitFor(() => {
      expect(screen.getByText("The Sizzling Grill")).toBeInTheDocument();
      expect(screen.queryByText("Bella Italia")).not.toBeInTheDocument();
    });
  });

  it("should filter by Last Minute", async () => {
    renderIndex();
    await waitFor(() => {
      expect(screen.getByText("Bella Italia")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText("Last Minute Deals"));
    await waitFor(() => {
      expect(screen.getByText("Bella Italia")).toBeInTheDocument();
      expect(screen.queryByText("The Sizzling Grill")).not.toBeInTheDocument();
    });
  });
});
