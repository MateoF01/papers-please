import styled, { css } from "styled-components";

export const Paragraph1 = styled.p(
  ({ theme: { colors, typography } }) => css`
    font-size: ${typography.sizes.medium};
    font-family: "InterRegular";
    font-style: normal;
    line-height: 24px;
    margin: 0;
    color: ${colors.textMedium};
  `
);
export const Paragraph2 = styled.p(
  ({ theme: { colors, typography, downTo } }) => css`
    font-size: ${typography.sizes.medium};
    font-family: "InterSemiBold";
    font-style: normal;
    color: ${colors.textMedium};
    margin: 0;

    ${downTo("sm")} {
      font-family: "InterMedium";
    }
  `
);
export const Paragraph3 = styled.p(
  ({ theme: { typography, downTo } }) => css`
    font-style: normal;
    font-size: ${typography.sizes.medium};
    font-family: "InterMedium";
    margin: 0.5rem 0;
    ${downTo("md")} {
      font-family: "InterBold";
    }
  `
);

export const Feedback = styled.p(
  ({ theme: { typography, downTo } }) => css`
    font-size: ${typography.sizes.medium};
    font-family: "InterRegular";
    font-style: normal;
    line-height: 24px;
    ${downTo("md")} {
      font-size: ${typography.sizes.small};
    }
  `
);
