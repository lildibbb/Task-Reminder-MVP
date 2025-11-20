import type React from "react";
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
import { AdminAPI } from "@/api/admin/index";

interface TeamInvitationEmailProps {
  name: string;
  role: string;
  email: string;
  returnUrl: string;
  to: string;
}

const previewText = "You are invited to join the team!";

const TeamInvitationEmail = ({
  name = "User",
  role,
  email,
  returnUrl,
}: TeamInvitationEmailProps) => {
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
              className="items-center mb-5  rounded-full p-2 mx-auto"
              width={40}
              height={40}
            />
            <Heading as="h1" className="text-emerald-500 text-center">
              You're Invited to Join Our Team!
            </Heading>

            <Text className="text-gray-700 mt-4">
              Dear <strong>{name}</strong>,
            </Text>
            <Text className="text-gray-700 mt-2">
              We would like to invite you to join our team as a{" "}
              <strong>{role}</strong>. We believe your skills and experience
              would be a valuable addition to our organization.
            </Text>

            <Text className="text-gray-700 mt-4">
              <strong>Your Email:</strong> {email}
            </Text>

            <Text className="text-gray-700 mt-4">
              Please click the button below to accept your invitation.
              <br />
              This link will expire in <strong>30 minutes</strong>.
            </Text>

            <Button
              className="box-border w-full rounded-[8px] bg-emerald-600 px-[12px] py-[12px] text-center font-semibold text-white my-4"
              href={returnUrl}
            >
              Accept Invitation
            </Button>

            <Text className="text-gray-700 mt-4">
              If you have any questions or need assistance, feel free to reach
              out to our support team.
            </Text>
            <Text className="text-gray-700 mt-6">
              Best regards,
              <br />
              The Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export const sendTeamInvitationEmail = async (
  props: TeamInvitationEmailProps,
) => {
  const htmlContent = renderToStaticMarkup(<TeamInvitationEmail {...props} />);
  try {
    const result = await APIService.post(AdminAPI.mail.create, {
      email: props.to,
      subject: previewText,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send team invitation email:", error);
  }
};

export default TeamInvitationEmail;
