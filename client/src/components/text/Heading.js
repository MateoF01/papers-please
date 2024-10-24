import styled, { css } from "styled-components";

export const Heading1 = styled.h1(
  ({ theme: { colors, typography, downTo } }) => css`
    font-size: ${typography.sizes.xxxlarge};
    font-family: "InterBold";
    font-style: normal;
    position: relative;
    width: 100%;
    /*
    padding: 1rem;
    margin: 0.25rem;
    */
    color: ${colors.textHeading};

    ${downTo("md")} {
      font-size: ${typography.sizes.xxlarge};
    }
    ${downTo("sm")} {
      font-size: ${typography.sizes.large};
    }
  `
);

export const Heading2 = styled.h2(
  ({ theme: { colors, typography, downTo } }) => css`
    font-size: ${typography.sizes.xxlarge};
    font-family: "InterSemiBold";
    font-style: normal;
    position: relative;
    width: 100%;
    /*
    padding: 1rem;
    margin: 0.25rem;
    */
    color: ${colors.textHeading};

    ${downTo("md")} {
      font-size: ${typography.sizes.xlarge};
    }
    ${downTo("sm")} {
      font-family: "InterMedium";
      font-size: ${typography.sizes.large};
      /*
      padding: 0;
      margin: 0;
      */
    }
  `
);
