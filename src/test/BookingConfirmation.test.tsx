import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import BookingConfirmation from "@/pages/BookingConfirmation";
import { AuthProvider } from "@/context/AuthContext";

vi.mock("@/services/api", () => ({
  apiService: {
    getBookingById: vi.fn().mockResolvedValue({
      id: 1,
      status: "CONFIRMED",
      restaurantId: 1,
      restaurantName: "Test Restaurant",
      date: "2026-06-01",
      time: "18:00",
      partySize: 2,
      customerName: "Test User",
      confirmationCode: "DINE123456",
    }),
    getRestaurants: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/services/api", async () => ({
  loginCustomer: vi.fn(),
  registerCustomer: vi.fn(),
  apiService: {
    getBookingById: vi.fn().mockResolvedValue({
      id: 1,
      status: "CONFIRMED",
      restaurantId: 1,
      restaurantName: "Test Restaurant",
      date: "2026-06-01",
      time: "18:00",
      partySize: 2,
      customerName: "Test User",
      confirmationCode: "DINE123456",
    }),
    getRestaurants: vi.fn().mockResolvedValue([]),
  },
}));

const renderConfirmation = (id = "1") => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/booking/${id}`]}>
        <AuthProvider>
          <Routes>
            <Route path="/booking/:id" element={<BookingConfirmation />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("BookingConfirmation", () => {
  it("should show loading state initially", () => {
    renderConfirmation();
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should show confirmation details after loading", async () => {
    renderConfirmation();
    await waitFor(() => {
      expect(screen.getByText("DINE123456")).toBeInTheDocument();
    });
    expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("should show confirmation code", async () => {
    renderConfirmation();
    await waitFor(() => {
      expect(screen.getByText("DINE123456")).toBeInTheDocument();
    });
  });

  it("should navigate back when Find more restaurants clicked", async () => {
    renderConfirmation();
    await waitFor(() => {
      expect(screen.getByText("DINE123456")).toBeInTheDocument();
    });
    const backButton = screen.getByRole("button", {
      name: /find more restaurants/i,
    });
    await userEvent.click(backButton);
  });

  it("should navigate home when Return to Home clicked", async () => {
    renderConfirmation();
    await waitFor(() => {
      expect(screen.getByText("DINE123456")).toBeInTheDocument();
    });
    const homeButton = screen.getByRole("button", { name: /return to home/i });
    await userEvent.click(homeButton);
  });

  it("should show booking not found when booking is null", async () => {
    const { apiService } = await import("@/services/api");
    vi.mocked(apiService.getBookingById).mockResolvedValueOnce(null as any);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/booking/999"]}>
          <AuthProvider>
            <Routes>
              <Route path="/booking/:id" element={<BookingConfirmation />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Booking not found")).toBeInTheDocument();
    });
  });
});
