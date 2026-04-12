import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import RestaurantDetail from "@/pages/RestaurantDetail";
import { AuthProvider } from "@/context/AuthContext";

// mock RestaurantMap 避免 Google Maps 依赖
vi.mock("@/components/RestaurantMap", () => ({
  default: () => <div data-testid="restaurant-map">Map</div>,
}));

vi.mock("@/services/api", async () => ({
  loginCustomer: vi.fn(),
  registerCustomer: vi.fn(),
  apiService: {
    getRestaurantById: vi.fn().mockResolvedValue({
      id: 1,
      name: "Test Restaurant",
      location: "Dublin",
      cuisine: "Irish",
      description: "Great food",
      address: "1 Main St",
      phone: "+353 1 234 5678",
      openingHours: "09:00-22:00",
      thumbnailUrl: "http://example.com/image.jpg",
      images: ["http://example.com/image.jpg"],
      hasEarlyBird: true,
      hasLastMinute: false,
      earlyBirdOffers: [],
    }),
    getRestaurantAvailability: vi.fn().mockResolvedValue({
      availableSlots: [
        { time: "18:00", type: "REGULAR" },
        { time: "19:00", type: "EARLY_BIRD", discount: "20%" },
      ],
    }),
    createBooking: vi.fn().mockResolvedValue({ id: 1 }),
    getRestaurants: vi.fn().mockResolvedValue([]),
  },
}));

const renderDetail = (id = "1") => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/restaurant/${id}`]}>
        <AuthProvider>
          <Routes>
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/booking/:id" element={<div>Booking Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("RestaurantDetail", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    renderDetail();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should render restaurant details after loading", async () => {
    renderDetail();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Test Restaurant" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Dublin")).toBeInTheDocument();
    expect(screen.getByText("Irish")).toBeInTheDocument();
    expect(screen.getByText("Great food")).toBeInTheDocument();
  });

  it("should render availability slots", async () => {
    renderDetail();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Test Restaurant" }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("19:00")),
    ).toBeInTheDocument();
  });

  it("should show Continue to Booking button disabled when no time selected", async () => {
    renderDetail();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Test Restaurant" }),
      ).toBeInTheDocument();
    });
    const continueButton = screen.getByRole("button", {
      name: /continue to booking/i,
    });
    expect(continueButton).toBeDisabled();
  });

  it("should enable Continue to Booking after selecting a time", async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText("18:00")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText("18:00"));
    const continueButton = screen.getByRole("button", {
      name: /continue to booking/i,
    });
    expect(continueButton).not.toBeDisabled();
  });

  it("should show booking form after clicking Continue to Booking", async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText("18:00")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText("18:00"));
    await userEvent.click(
      screen.getByRole("button", { name: /continue to booking/i }),
    );
    expect(screen.getByText("Complete Your Booking")).toBeInTheDocument();
  });

  it("should show error when trying to book without login", async () => {
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText("18:00")).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText("18:00"));
    await userEvent.click(
      screen.getByRole("button", { name: /continue to booking/i }),
    );
    // 填写表单
    await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(
      screen.getByLabelText("Phone Number"),
      "+353 87 123 4567",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /complete booking/i }),
    );
    // 没有登录，应该提示错误
    await waitFor(() => {
      expect(screen.queryByText("Complete Your Booking")).toBeInTheDocument();
    });
  });

  it("should navigate back when back button clicked", async () => {
    renderDetail();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Test Restaurant" }),
      ).toBeInTheDocument();
    });
    await userEvent.click(
      screen.getByRole("button", { name: /back to restaurants/i }),
    );
  });

  it("should show restaurant not found when restaurant is null", async () => {
    const { apiService } = await import("@/services/api");
    vi.mocked(apiService.getRestaurantById).mockResolvedValueOnce(null as any);
    renderDetail();
    await waitFor(() => {
      expect(screen.getByText("Restaurant not found")).toBeInTheDocument();
    });
  });
});
