import { t } from '@lingui/core/macro';
import { Logo } from '@/auth/components/Logo';
import { StyledAuthContent } from '@/auth/components/StyledAuthContent';
import { Title } from '@/auth/components/Title';
import { AnimatedEaseIn } from '@/auth/components/internal/AnimatedEaseIn/AnimatedEaseIn';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { WorkspaceSelectionFooter } from '@/auth/sign-in-up/components/WorkspaceSelectionFooter';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { styled } from '@linaria/react';
import { type JSX } from 'react';
import { AppPath } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';
import { type PublicWorkspaceData } from '~/generated-metadata/graphql';

const StyledTitleContainer = styled.div`
  line-height: 1.2;
  margin-top: ${themeCssVariables.spacing[10]};
`;

const StyledFormContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: ${themeCssVariables.spacing[6]};
  margin-top: ${themeCssVariables.spacing[6]};
  min-width: 0;
  width: 100%;
`;

const StyledSignInLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100%;
  align-items: center;
  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const StyledIntroduction = styled.aside`
  padding: clamp(32px, 6vw, 96px);
  color: ${themeCssVariables.font.color.primary};
  h1 {
    font-size: 44px;
    letter-spacing: -1.4px;
    line-height: 1.15;
    margin: 32px 0;
  }
  p {
    color: ${themeCssVariables.font.color.secondary};
    font-size: 16px;
    line-height: 1.8;
  }
  strong {
    font-size: 24px;
  }
  @media (max-width: 1000px) {
    display: none;
  }
`;

const StyledSignInCard = styled(StyledAuthContent)`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 14px;
  box-sizing: border-box;
  margin: 40px auto;
  max-width: 480px;
  padding: 32px;
  width: calc(100% - 48px);
`;

type SignInUpStandardContentProps = {
  workspacePublicData: PublicWorkspaceData | null;
  signInUpForm: JSX.Element | null;
  signInUpStep: SignInUpStep;
  title: string;
  onClickOnLogo: () => void;
};

export const SignInUpStandardContent = ({
  workspacePublicData,
  signInUpForm,
  signInUpStep,
  title,
  onClickOnLogo,
}: SignInUpStandardContentProps) => {
  return (
    <StyledSignInLayout>
      <StyledIntroduction>
        <strong>ToyStack CRM</strong>
        <h1>{t`Your customer work, in one place.`}</h1>
        <p>{t`Keep contacts connected, move opportunities forward and make every follow-up count.`}</p>
        <p>{t`Companies · People · Opportunities · Tasks`}</p>
      </StyledIntroduction>
      <StyledSignInCard>
        <AnimatedEaseIn>
          <Logo
            secondaryLogo={workspacePublicData?.logo}
            placeholder={workspacePublicData?.displayName}
            onClick={onClickOnLogo}
            to={AppPath.SignInUp}
          />
        </AnimatedEaseIn>
        <StyledTitleContainer>
          <Title animate>{title}</Title>
        </StyledTitleContainer>
        <StyledFormContainer>{signInUpForm}</StyledFormContainer>
        {signInUpStep === SignInUpStep.WorkspaceSelection && (
          <WorkspaceSelectionFooter />
        )}
        {![
          SignInUpStep.Password,
          SignInUpStep.TwoFactorAuthenticationProvision,
          SignInUpStep.TwoFactorAuthenticationVerification,
          SignInUpStep.WorkspaceSelection,
          SignInUpStep.WorkspaceCreation,
        ].includes(signInUpStep) && (
          <FooterNote secondaryAgreement="dataProcessingAgreement" />
        )}
      </StyledSignInCard>
    </StyledSignInLayout>
  );
};
