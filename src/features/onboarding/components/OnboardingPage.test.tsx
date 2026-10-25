// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { env } from "../../../shared/config/env";
import { OnboardingPage } from "./OnboardingPage";

const VALID_CORPORATION_NUMBER = "826417395";

const validValues = {
  firstName: "Hello",
  lastName: "World",
  phone: "+13062776103",
  corporationNumber: VALID_CORPORATION_NUMBER,
};

let submittedBody: unknown;

const server = setupServer(
  http.get(`${env.apiBaseUrl}/corporation-number/:number`, ({ params }) =>
    params.number === VALID_CORPORATION_NUMBER
      ? HttpResponse.json({ corporationNumber: params.number, valid: true })
      : HttpResponse.json(
          { valid: false, message: "Invalid corporation number" },
          { status: 404 },
        ),
  ),
  http.post(`${env.apiBaseUrl}/profile-details`, async ({ request }) => {
    submittedBody = await request.json();
    return new HttpResponse(null, { status: 200 });
  }),
);

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  submittedBody = undefined;
});
afterAll(() => {
  server.close();
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <OnboardingPage />
    </QueryClientProvider>,
  );
  return userEvent.setup();
}

async function fillStep1(
  user: ReturnType<typeof userEvent.setup>,
  values: typeof validValues,
) {
  await user.type(screen.getByLabelText("First Name"), values.firstName);
  await user.type(screen.getByLabelText("Last Name"), values.lastName);
  await user.type(screen.getByLabelText("Phone Number"), values.phone);
  await user.type(
    screen.getByLabelText("Corporation Number"),
    values.corporationNumber,
  );
  await user.tab();
}

describe("OnboardingPage", () => {
  it("submits valid profile details and moves to the next step", async () => {
    const user = renderPage();
    expect(screen.getByText("Step 1 of 5")).toBeTruthy();

    await fillStep1(user, validValues);
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText("Step 2 of 5")).toBeTruthy();
    expect(submittedBody).toEqual(validValues);
  });

  it("shows field errors on blur for invalid input", async () => {
    const user = renderPage();

    await fillStep1(user, {
      ...validValues,
      phone: "123",
      corporationNumber: "123",
    });

    expect(
      screen.getByText("Phone number must start with +1 followed by 10 digits"),
    ).toBeTruthy();
    expect(
      screen.getByText("Corporation number must be 9 digits"),
    ).toBeTruthy();
  });

  it("blocks submission when the API rejects the corporation number", async () => {
    const user = renderPage();

    await fillStep1(user, { ...validValues, corporationNumber: "111111111" });
    expect(await screen.findByText("Invalid corporation number")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText("Step 1 of 5")).toBeTruthy();
    expect(submittedBody).toBeUndefined();
  });

  it("shows the server error and stays on the step when submission fails", async () => {
    server.use(
      http.post(`${env.apiBaseUrl}/profile-details`, () =>
        HttpResponse.json({ message: "Invalid phone number" }, { status: 400 }),
      ),
    );
    const user = renderPage();

    await fillStep1(user, validValues);
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText("Invalid phone number")).toBeTruthy();
    expect(screen.getByText("Step 1 of 5")).toBeTruthy();
  });
});
