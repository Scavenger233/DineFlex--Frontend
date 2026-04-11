import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestaurantGrid from "@/components/RestaurantGrid";
import { Restaurant } from "@/types/api";

const mockRestaurants: Restaurant[] = [
  {
    id: 1,
    name: "Restaurant One",
    location: "Dublin",
    cuisine: "Irish",
    thumbnailUrl: "http://example.com/1.jpg",
    hasEarlyBird: false,
    hasLastMinute: false,
  },
  {
    id: 2,
    name: "Restaurant Two",
    location: "Cork",
    cuisine: "Italian",
    thumbnailUrl: "http://example.com/2.jpg",
    hasEarlyBird: true,
    hasLastMinute: false,
  },
];

const renderGrid = (restaurants: Restaurant[], isLoading: boolean) =>
  render(
    <MemoryRouter>
      <RestaurantGrid restaurants={restaurants} isLoading={isLoading} />
    </MemoryRouter>,
  );

describe("RestaurantGrid", () => {
  it("should show loading skeleton when isLoading is true", () => {
    renderGrid([], true);
    expect(document.querySelectorAll(".animate-pulse")).toHaveLength(6);
  });

  it("should show no restaurants message when list is empty", () => {
    renderGrid([], false);
    expect(screen.getByText("No restaurants found.")).toBeInTheDocument();
  });

  it("should render all restaurant cards", () => {
    renderGrid(mockRestaurants, false);
    expect(screen.getByText("Restaurant One")).toBeInTheDocument();
    expect(screen.getByText("Restaurant Two")).toBeInTheDocument();
  });

  it("should render correct number of cards", () => {
    renderGrid(mockRestaurants, false);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
