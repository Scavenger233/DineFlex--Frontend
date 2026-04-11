import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import BookingForm from "@/components/BookingForm";

const mockOnSubmit = vi.fn();

const defaultProps = {
  restaurantId: "1",
  date: new Date("2026-06-01"),
  time: "18:00",
  onSubmit: mockOnSubmit,
  isSubmitting: false,
};

describe("BookingForm", () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("should render all form fields", () => {
    render(<BookingForm {...defaultProps} />);
    expect(screen.getByLabelText("Number of Guests")).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
  });

  it("should show validation error when name is too short", async () => {
    render(<BookingForm {...defaultProps} />);
    await userEvent.type(screen.getByLabelText("Full Name"), "A");
    await userEvent.click(
      screen.getByRole("button", { name: /complete booking/i }),
    );
    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  it("should show validation error when email is empty", async () => {
    render(<BookingForm {...defaultProps} />);
    await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
    // 不填 email
    await userEvent.type(
      screen.getByLabelText("Phone Number"),
      "+353 87 123 4567",
    );
    fireEvent.submit(
      screen
        .getByRole("button", { name: /complete booking/i })
        .closest("form")!,
    );
    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });

  it("should show validation error when phone is too short", async () => {
    render(<BookingForm {...defaultProps} />);
    await userEvent.type(screen.getByLabelText("Phone Number"), "123");
    await userEvent.click(
      screen.getByRole("button", { name: /complete booking/i }),
    );
    await waitFor(() => {
      expect(
        screen.getByText("Valid phone number is required"),
      ).toBeInTheDocument();
    });
  });

  it("should call onSubmit with correct data when form is valid", async () => {
    render(<BookingForm {...defaultProps} />);
    await userEvent.clear(screen.getByLabelText("Number of Guests"));
    await userEvent.type(screen.getByLabelText("Number of Guests"), "2");
    await userEvent.type(screen.getByLabelText("Full Name"), "Test User");
    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(
      screen.getByLabelText("Phone Number"),
      "+353 87 123 4567",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /complete booking/i }),
    );
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledOnce();
    });
  });

  it("should show Processing when isSubmitting is true", () => {
    render(<BookingForm {...defaultProps} isSubmitting={true} />);
    expect(
      screen.getByRole("button", { name: /processing/i }),
    ).toBeInTheDocument();
  });
});
