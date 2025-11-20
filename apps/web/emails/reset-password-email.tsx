import { renderToStaticMarkup } from "react-dom/server";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Heading,
  Tailwind,
  Button,
  Img,
} from "@react-email/components";
import APIService from "@/api/apiService";
import { AdminAPI } from "@/api/admin";

interface PasswordResetEmailProps {
  name: string;
  email: string;
  resetUrl: string;
  to: string;
}

const previewText = "Reset your password - Action required";

const PasswordResetEmail = ({
  name = "User",
  email,
  resetUrl,
}: PasswordResetEmailProps) => {
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
              Reset Your Password
            </Heading>

            <Text className="text-gray-700 mt-4">
              Dear <strong>{name}</strong>,
            </Text>
            <Text className="text-gray-700 mt-2">
              We received a request to reset the password for your account. If
              you made this request, please click the button below to create a
              new password.
            </Text>

            <Text className="text-gray-700 mt-4">
              <strong>Account Email:</strong> {email}
            </Text>

            <Text className="text-gray-700 mt-4">
              Please click the button below to reset your password.
              <br />
              This link will expire in <strong>30 minutes</strong> for security
              reasons.
            </Text>

            <Button
              className="box-border w-full rounded-[8px] bg-emerald-600 px-[12px] py-[12px] text-center font-semibold text-white my-4"
              href={resetUrl}
            >
              Reset Password
            </Button>

            <Text className="text-gray-700 mt-4 text-sm">
              <strong>Security Notice:</strong> If you didn't request this
              password reset, please ignore this email. Your password will
              remain unchanged.
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

export const sendPasswordResetEmail = async (
  props: PasswordResetEmailProps,
) => {
  const htmlContent = renderToStaticMarkup(<PasswordResetEmail {...props} />);
  try {
    const result = await APIService.post(AdminAPI.mail.create, {
      email: props.to,
      subject: previewText,
      html: htmlContent,
    });
    return result;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};

export default PasswordResetEmail;
