import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AvailabilitySelector from "@/components/AvailabilitySelector";
import { AvailableSlot } from "@/types/api";

const mockSlots: AvailableSlot[] = [
  { time: "17:00", type: "EARLY_BIRD", discount: "20%" },
  { time: "18:00", type: "REGULAR" },
  { time: "21:00", type: "LAST_MINUTE", discount: "15%" },
];

const defaultProps = {
  date: new Date("2026-06-01"),
  setDate: vi.fn(),
  slots: mockSlots,
  selectedTime: null,
  setSelectedTime: vi.fn(),
  isLoading: false,
};

describe("AvailabilitySelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Check Availability heading", () => {
    render(<AvailabilitySelector {...defaultProps} />);
    expect(screen.getByText("Check Availability")).toBeInTheDocument();
  });

  it("should render Early Bird slots", () => {
    render(<AvailabilitySelector {...defaultProps} />);
    expect(screen.getByText("Early Bird Offers")).toBeInTheDocument();
    expect(screen.getByText("17:00")).toBeInTheDocument();
  });

  it("should render Regular slots", () => {
    render(<AvailabilitySelector {...defaultProps} />);
    expect(screen.getByText("Regular Times")).toBeInTheDocument();
    expect(screen.getByText("18:00")).toBeInTheDocument();
  });

  it("should render Last Minute slots with discount", () => {
    render(<AvailabilitySelector {...defaultProps} />);
    expect(screen.getByText("Last Minute Deals")).toBeInTheDocument();
    expect(screen.getByText("21:00 (-15%)")).toBeInTheDocument();
  });

  it("should call setSelectedTime when a slot is clicked", async () => {
    render(<AvailabilitySelector {...defaultProps} />);
    await userEvent.click(screen.getByText("18:00"));
    expect(defaultProps.setSelectedTime).toHaveBeenCalledWith("18:00");
  });

  it("should show no availability message when slots is empty", () => {
    render(<AvailabilitySelector {...defaultProps} slots={[]} />);
    expect(
      screen.getByText(/No availability for this date/i),
    ).toBeInTheDocument();
  });

  it("should show loading state when isLoading is true", () => {
    render(<AvailabilitySelector {...defaultProps} isLoading={true} />);
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should not show slots when isLoading is true", () => {
    render(<AvailabilitySelector {...defaultProps} isLoading={true} />);
    expect(screen.queryByText("18:00")).not.toBeInTheDocument();
  });
});
