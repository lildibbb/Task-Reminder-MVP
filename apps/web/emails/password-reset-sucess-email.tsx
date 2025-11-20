import { renderToStaticMarkup } from "react-dom/server";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import APIService from "@/api/apiService";
import { AdminAPI } from "@/api/admin";

interface PasswordResetSuccessEmailProps {
  name: string;
  email: string;
  to: string;
  resetTime?: string;
}

const previewText = "Password successfully reset - Confirmation";

const PasswordResetSuccessEmail = ({
  name = "User",
  email,
  resetTime = new Date().toLocaleString(),
}: PasswordResetSuccessEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Img
              src="https://lh3.googleusercontent.com/p/AF1QipMwB6he98SnoT6l6gDZtMaVNup-iSyzHhaLfYkP=s680-w680-h510"
              alt="Logo"
              className="items-center mb-5 rounded-full p-2 mx-auto"
              width={40}
              height={40}
            />
            <Heading as="h1" className="text-emerald-500 text-center">
              Password Successfully Reset
            </Heading>

            <Text className="text-gray-700 mt-4">
              Dear <strong>{name}</strong>,
            </Text>
            <Text className="text-gray-700 mt-2">
              Your password has been successfully reset. You can now use your
              new password to access your account.
            </Text>

            <Text className="text-gray-700 mt-4">
              <strong>Account Email:</strong> {email}
            </Text>

            <Text className="text-gray-700 mt-4">
              <strong>Reset Time:</strong> {resetTime}
            </Text>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 my-6">
              <Text className="text-emerald-800 font-semibold text-sm mb-2">
                ✓ Password Reset Successful
              </Text>
              <Text className="text-emerald-700 text-sm">
                Your account is now secured with your new password.
              </Text>
            </div>

            <Text className="text-gray-700 mt-4">
              <strong>Security Recommendations:</strong>
            </Text>
            <Text className="text-gray-700 mt-2 text-sm">
              • Use a strong, unique password for your account
              <br />• Don't share your password with anyone
            </Text>

            <Text className="text-gray-700 mt-4 text-sm">
              <strong>Security Notice:</strong> If you didn't reset your
              password, please contact our support team immediately as your
              account may have been compromised.
            </Text>

            <Text className="text-gray-700 mt-4">
              If you have any questions or need assistance, feel free to reach
              out to our support team.
            </Text>
            <Text className="text-gray-700 mt-6">
              Best regards,
              <br />
              The Security Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export const sendPasswordResetSuccessEmail = async (
  props: PasswordResetSuccessEmailProps,
) => {
  const htmlContent = renderToStaticMarkup(
    <PasswordResetSuccessEmail {...props} />,
  );
  try {
    return await APIService.post(AdminAPI.mail.create, {
      email: props.to,
      subject: previewText,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send password reset success email:", error);
    throw error;
  }
};

export default PasswordResetSuccessEmail;
