import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import Page from "./page";

describe("Genetic Potential page", () => {
  it("renders and calculates", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByText("Calculate"));
    expect(screen.getByTestId("result")).toBeInTheDocument();
  });
});
