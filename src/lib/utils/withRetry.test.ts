
/** @jest-environment node */
import { withRetry } from "./withRetry";

describe("withRetry", () => {
  it("should return the result of the function on the first try if it succeeds", async () => {
    const successfulFn = jest.fn().mockResolvedValue("success");
    const result = await withRetry(successfulFn, 3, 10);
    expect(result).toBe("success");
    expect(successfulFn).toHaveBeenCalledTimes(1);
  });

  it("should retry the function up to the specified number of times on failure", async () => {
    const failingFn = jest.fn().mockRejectedValue(new Error("failure"));
    await expect(withRetry(failingFn, 3, 10)).rejects.toThrow("failure");
    expect(failingFn).toHaveBeenCalledTimes(3);
  });

  it("should return the result if the function succeeds on a retry attempt", async () => {
    const eventuallySuccessfulFn = jest
      .fn()
      .mockRejectedValueOnce(new Error("failure"))
      .mockResolvedValue("success");
    const result = await withRetry(eventuallySuccessfulFn, 3, 10);
    expect(result).toBe("success");
    expect(eventuallySuccessfulFn).toHaveBeenCalledTimes(2);
  });

  it("should use exponential backoff for delays", async () => {
    jest.useFakeTimers();
    const failingFn = jest.fn().mockRejectedValue(new Error("failure"));
    const promise = withRetry(failingFn, 3, 100);

    // Let the first call fail
    await Promise.resolve();
    await Promise.resolve();

    // First retry delay
    await jest.advanceTimersByTimeAsync(100);
    expect(failingFn).toHaveBeenCalledTimes(2);

    // Second retry delay
    await jest.advanceTimersByTimeAsync(200);
    expect(failingFn).toHaveBeenCalledTimes(3);

    await expect(promise).rejects.toThrow("failure");
    jest.useRealTimers();
  });
});