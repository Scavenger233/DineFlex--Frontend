import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RestaurantCard from "@/components/RestaurantCard";
import { Restaurant } from "@/types/api";

const mockRestaurant: Restaurant = {
  id: 1,
  name: "Test Restaurant",
  location: "Dublin",
  cuisine: "Irish",
  thumbnailUrl: "http://example.com/image.jpg",
  hasEarlyBird: false,
  hasLastMinute: false,
};

const renderCard = (restaurant: Restaurant) =>
  render(
    <MemoryRouter>
      <RestaurantCard restaurant={restaurant} />
    </MemoryRouter>,
  );

describe("RestaurantCard", () => {
  it("should render restaurant name", () => {
    renderCard(mockRestaurant);
    expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
  });

  it("should render location and cuisine", () => {
    renderCard(mockRestaurant);
    expect(screen.getByText("Dublin")).toBeInTheDocument();
    expect(screen.getByText("Irish")).toBeInTheDocument();
  });

  it("should render restaurant image", () => {
    renderCard(mockRestaurant);
    const img = screen.getByAltText("Test Restaurant");
    expect(img).toHaveAttribute("src", "http://example.com/image.jpg");
  });

  it("should render Early Bird badge when hasEarlyBird is true", () => {
    renderCard({ ...mockRestaurant, hasEarlyBird: true });
    expect(screen.getByText("Early Bird")).toBeInTheDocument();
  });

  it("should render Last Minute badge when hasLastMinute is true", () => {
    renderCard({ ...mockRestaurant, hasLastMinute: true });
    expect(screen.getByText("Last Minute")).toBeInTheDocument();
  });

  it("should not render badges when both are false", () => {
    renderCard(mockRestaurant);
    expect(screen.queryByText("Early Bird")).not.toBeInTheDocument();
    expect(screen.queryByText("Last Minute")).not.toBeInTheDocument();
  });

  it("should link to correct restaurant page", () => {
    renderCard(mockRestaurant);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/restaurant/1");
  });
});
