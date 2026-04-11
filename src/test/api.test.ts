import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios", () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { default: mockAxios };
});

describe("api service", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it("should create axios instance with correct base URL", async () => {
    const { apiService } = await import("@/services/api");
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("should attach Bearer token from localStorage in request interceptor", async () => {
    localStorage.setItem("dineflexUser", JSON.stringify({ token: "test-token" }));
    const { apiService } = await import("@/services/api");
    const interceptorCall = (axios.interceptors.request.use as any).mock.calls[0];
    const requestInterceptor = interceptorCall[0];
    const config = { headers: {} };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBe("Bearer test-token");
  });

  it("should not attach token when localStorage is empty", async () => {
    const { apiService } = await import("@/services/api");
    const interceptorCall = (axios.interceptors.request.use as any).mock.calls[0];
    const requestInterceptor = interceptorCall[0];
    const config = { headers: {} };
    const result = requestInterceptor(config);
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("should call getRestaurants and return data", async () => {
  const mockData = [{ id: 1, name: "Test" }];
  (axios.get as any).mockResolvedValue({ data: mockData });
  const { apiService } = await import("@/services/api");
  const result = await apiService.getRestaurants();
  expect(result).toEqual(mockData);
  });

  it("should call getRestaurantById", async () => {
  const mockData = { id: "1", name: "Test Restaurant" };
  (axios.get as any).mockResolvedValue({ data: mockData });
  const { apiService } = await import("@/services/api");
  const result = await apiService.getRestaurantById("1");
  expect(result).toEqual(mockData);
});

it("should call getRestaurantAvailability", async () => {
  const mockData = { availableSlots: [] };
  (axios.get as any).mockResolvedValue({ data: mockData });
  const { apiService } = await import("@/services/api");
  const result = await apiService.getRestaurantAvailability("1", "2026-06-01");
  expect(result).toEqual(mockData);
});

it("should call createBooking", async () => {
  const mockData = { id: 1, confirmationCode: "DINE123" };
  (axios.post as any).mockResolvedValue({ data: mockData });
  const { apiService } = await import("@/services/api");
  const result = await apiService.createBooking({
    restaurantId: 1,
    date: "2026-06-01",
    time: "18:00",
    partySize: 2,
    customerName: "Test",
    customerEmail: "test@example.com",
    customerPhone: "123",
  });
  expect(result).toEqual(mockData);
});

it("should call loginCustomer", async () => {
  const mockData = { token: "jwt-token", customerName: "Test" };
  (axios.post as any).mockResolvedValue({ data: mockData });
  localStorage.clear();
  const { loginCustomer } = await import("@/services/api");
  const result = await loginCustomer({
    customerEmail: "test@example.com",
    password: "password123",
  });
  expect(result).toEqual(mockData);
});

it("should handle 401 response by clearing localStorage", async () => {
  localStorage.setItem("dineflexUser", JSON.stringify({ token: "test" }));
  localStorage.setItem("customer", JSON.stringify({ name: "test" }));
  
  const { apiService } = await import("@/services/api");
  
  const interceptorCall = (axios.interceptors.response.use as any).mock.calls[0];
  const errorInterceptor = interceptorCall[1];
  
  const mockLocation = { href: "" };
  Object.defineProperty(window, "location", { value: mockLocation, writable: true });
  
  const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
  
  try {
    await errorInterceptor({ response: { status: 401 } });
  } catch {}
  
  expect(localStorage.getItem("dineflexUser")).toBeNull();
  expect(localStorage.getItem("customer")).toBeNull();
  alertMock.mockRestore();
});
});