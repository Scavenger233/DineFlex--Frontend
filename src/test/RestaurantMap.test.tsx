import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import RestaurantMap from "@/components/RestaurantMap";

// mock @react-google-maps/api
vi.mock("@react-google-maps/api", () => ({
  LoadScript: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="load-script">{children}</div>
  ),
  GoogleMap: ({
    onLoad,
    children,
  }: {
    onLoad?: () => void;
    children?: React.ReactNode;
  }) => {
    return (
      <div data-testid="google-map" onClick={onLoad}>
        {children}
      </div>
    );
  },
  Marker: ({ title }: { title: string }) => (
    <div data-testid="marker">{title}</div>
  ),
}));

describe("RestaurantMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render LoadScript wrapper", () => {
    render(
      <RestaurantMap address="1 Main St, Dublin" name="Test Restaurant" />,
    );
    expect(screen.getByTestId("load-script")).toBeInTheDocument();
  });

  it("should render GoogleMap with Dublin fallback when no coordinates", () => {
    render(
      <RestaurantMap address="1 Main St, Dublin" name="Test Restaurant" />,
    );
    expect(screen.getByTestId("google-map")).toBeInTheDocument();
  });

  it("should not render Marker when coordinates are not loaded", () => {
    render(
      <RestaurantMap address="1 Main St, Dublin" name="Test Restaurant" />,
    );
    expect(screen.queryByTestId("marker")).not.toBeInTheDocument();
  });

  it("should handle missing window.google gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const originalGoogle = (window as any).google;
    delete (window as any).google;

    render(
      <RestaurantMap address="1 Main St, Dublin" name="Test Restaurant" />,
    );
    const map = screen.getByTestId("google-map");
    map.click();

    expect(consoleSpy).toHaveBeenCalledWith("Google Maps JS SDK not loaded");
    consoleSpy.mockRestore();
    if (originalGoogle) (window as any).google = originalGoogle;
  });

  it("should call geocoder when window.google is available", () => {
    const mockGeocode = vi.fn((_, callback) => {
      callback(
        [{ geometry: { location: { lat: () => 53.34, lng: () => -6.26 } } }],
        "OK",
      );
    });

    (window as any).google = {
      maps: {
        Geocoder: vi.fn(() => ({ geocode: mockGeocode })),
      },
    };

    render(
      <RestaurantMap address="1 Main St, Dublin" name="Test Restaurant" />,
    );
    const map = screen.getByTestId("google-map");
    map.click();

    expect(mockGeocode).toHaveBeenCalledWith(
      { address: "1 Main St, Dublin" },
      expect.any(Function),
    );

    delete (window as any).google;
  });

  it("should handle geocoding failure gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockGeocode = vi.fn((_, callback) => {
      callback(null, "ZERO_RESULTS");
    });

    (window as any).google = {
      maps: {
        Geocoder: vi.fn(() => ({ geocode: mockGeocode })),
      },
    };

    render(<RestaurantMap address="Invalid Address" name="Test Restaurant" />);
    const map = screen.getByTestId("google-map");
    map.click();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Geocoding failed:",
      "ZERO_RESULTS",
    );
    consoleSpy.mockRestore();
    delete (window as any).google;
  });
});
