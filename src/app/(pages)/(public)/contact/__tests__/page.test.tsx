import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactPage from "../page";
import ContactForm from "../_components/ContactForm";

// Mock the toast hook
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("Contact Page", () => {
  it("renders the contact page with title", () => {
    render(<ContactPage />);
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });

  describe("ContactForm", () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockClear();
      mockToast.mockClear();
    });

    it("renders the contact form with all fields", () => {
      render(<ContactForm />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /send message/i })
      ).toBeInTheDocument();
    });

    it("validates required fields", async () => {
      render(<ContactForm />);
      const submitButton = screen.getByRole("button", {
        name: /send message/i,
      });

      await userEvent.click(submitButton);

      expect(screen.getByLabelText(/name/i)).toBeInvalid();
      expect(screen.getByLabelText(/email/i)).toBeInvalid();
      expect(screen.getByLabelText(/message/i)).toBeInvalid();
    });

    it("submits the form successfully", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<ContactForm />);

      await userEvent.type(screen.getByLabelText(/name/i), "John Doe");
      await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      await userEvent.type(screen.getByLabelText(/message/i), "Test message");

      const submitButton = screen.getByRole("button", {
        name: /send message/i,
      });
      await userEvent.click(submitButton);

      expect(global.fetch).toHaveBeenCalledWith("/api/email/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          message: "Test message",
        }),
      });

      await waitFor(() => {
        expect(
          screen.getByText(/thank you for reaching out/i)
        ).toBeInTheDocument();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Message Sent",
        description:
          "Thank you for reaching out! We will get back to you soon.",
      });
    });

    it("handles form submission error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      render(<ContactForm />);

      await userEvent.type(screen.getByLabelText(/name/i), "John Doe");
      await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      await userEvent.type(screen.getByLabelText(/message/i), "Test message");

      const submitButton = screen.getByRole("button", {
        name: /send message/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent("Send Message");
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description:
          "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    });

    it("disables submit button while submitting", async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ContactForm />);

      await userEvent.type(screen.getByLabelText(/name/i), "John Doe");
      await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      await userEvent.type(screen.getByLabelText(/message/i), "Test message");

      const submitButton = screen.getByRole("button", {
        name: /send message/i,
      });
      await userEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent("Sending...");
    });
  });
});
