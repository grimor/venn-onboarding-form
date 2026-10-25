// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

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
let checkedCorporationNumbers: string[] = [];

const server = setupServer(
  http.get(
    `${env.apiBaseUrl}/corporation-number/:number`,
    ({ params: { number } }) => {
      checkedCorporationNumbers.push(String(number));
      return number === VALID_CORPORATION_NUMBER
        ? HttpResponse.json({ corporationNumber: number, valid: true })
        : HttpResponse.json(
            { valid: false, message: "Invalid corporation number" },
            { status: 404 },
          );
    },
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
  vi.restoreAllMocks();
  submittedBody = undefined;
  checkedCorporationNumbers = [];
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

/** Waits for the error message linked to the field via `aria-describedby`. */
function findFieldError(label: string) {
  const input = screen.getByLabelText(label);

  return waitFor(() => {
    const error = input
      .getAttribute("aria-describedby")
      ?.split(" ")
      .map((id) => document.getElementById(id)?.querySelector('[role="alert"]'))
      .find(Boolean);
    if (!error) throw new Error(`No error shown for "${label}"`);
    return error.textContent;
  });
}

/** Waits until the submit button is idle again after a submission. */
function waitForSubmitToFinish() {
  return waitFor(() => {
    expect(
      screen.getByRole("button", { name: "Submit" }).getAttribute("aria-busy"),
    ).toBeNull();
  });
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

  it("shows a required message under each empty field on submit", async () => {
    const user = renderPage();

    await user.click(screen.getByRole("button", { name: /submit/i }));

    for (const [label, message] of [
      ["First Name", "First name is required"],
      ["Last Name", "Last name is required"],
      ["Phone Number", "Phone number is required"],
      ["Corporation Number", "Corporation number is required"],
    ] as const) {
      expect(await findFieldError(label)).toBe(message);
    }
    expect(checkedCorporationNumbers).toEqual([]);
    expect(submittedBody).toBeUndefined();
  });

  it("shows required errors on blur for empty names", async () => {
    const user = renderPage();

    await user.click(screen.getByLabelText("First Name"));
    await user.tab();
    await user.tab();

    expect(await findFieldError("First Name")).toBe("First name is required");
    expect(await findFieldError("Last Name")).toBe("Last name is required");
  });

  it("doesn't check a malformed corporation number with the API", async () => {
    const user = renderPage();

    await user.type(screen.getByLabelText("Corporation Number"), "123");
    await user.tab();
    expect(await findFieldError("Corporation Number")).toBe(
      "Corporation number must be 9 digits",
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitForSubmitToFinish();

    expect(checkedCorporationNumbers).toEqual([]);
    expect(submittedBody).toBeUndefined();
  });

  it("allows only digits and a leading + in the phone number", async () => {
    const user = renderPage();
    const input = screen.getByLabelText<HTMLInputElement>("Phone Number");

    await user.type(input, "+1 (306) 277-6103+abc");

    expect(input.value).toBe("+13062776103");
  });

  it("allows only digits in the corporation number", async () => {
    const user = renderPage();
    const input = screen.getByLabelText<HTMLInputElement>("Corporation Number");

    await user.type(input, "8a2-6 4.1#7395");

    expect(input.value).toBe(VALID_CORPORATION_NUMBER);
  });

  it("blocks submission when the API rejects the corporation number", async () => {
    const user = renderPage();

    await fillStep1(user, { ...validValues, corporationNumber: "111111111" });
    expect(await screen.findByText("Invalid corporation number")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText("Step 1 of 5")).toBeTruthy();
    expect(submittedBody).toBeUndefined();
  });

  it("blocks submission when the corporation number can't be verified", async () => {
    server.use(
      http.get(`${env.apiBaseUrl}/corporation-number/:number`, () =>
        HttpResponse.json({ message: "Internal error" }, { status: 500 }),
      ),
    );
    const user = renderPage();

    await fillStep1(user, validValues);
    const unverified =
      "We couldn't verify the corporation number. Please try again.";
    expect(await findFieldError("Corporation Number")).toBe(unverified);

    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitForSubmitToFinish();

    expect(await findFieldError("Corporation Number")).toBe(unverified);
    expect(screen.getByText("Step 1 of 5")).toBeTruthy();
    expect(submittedBody).toBeUndefined();
  });

  it("shows a generic error when the submission can't be sent", async () => {
    server.use(
      http.post(`${env.apiBaseUrl}/profile-details`, () =>
        HttpResponse.error(),
      ),
    );
    const user = renderPage();

    await fillStep1(user, validValues);
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText("Something went wrong. Please try again."),
    ).toBeTruthy();
    expect(screen.getByText("Step 1 of 5")).toBeTruthy();
  });

  it("stops waiting and shows an error when the submission times out", async () => {
    const timeouts: AbortController[] = [];
    vi.spyOn(AbortSignal, "timeout").mockImplementation(() => {
      const controller = new AbortController();
      timeouts.push(controller);
      return controller.signal;
    });
    server.use(
      http.post(`${env.apiBaseUrl}/profile-details`, async () => {
        await delay("infinite");
      }),
    );
    const user = renderPage();

    await fillStep1(user, validValues);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(
      await screen.findByRole("button", { name: "Submitting…" }),
    ).toBeTruthy();

    for (const controller of timeouts) {
      controller.abort(new DOMException("timed out", "TimeoutError"));
    }

    expect(
      await screen.findByText("Something went wrong. Please try again."),
    ).toBeTruthy();
    await waitForSubmitToFinish();
    expect(screen.getByText("Step 1 of 5")).toBeTruthy();
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
