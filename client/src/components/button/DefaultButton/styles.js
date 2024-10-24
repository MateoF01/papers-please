import styled, { css } from "styled-components";

export const StyledDefaultButton = styled.button(
  ({ theme: { colors, shadows, typography, downTo } }) => css`
    font-family: "InterRegular";
    color: ${colors.mainPrimary30};
    font-size: ${typography.sizes.large};
    font-weight: 600;
    line-height: 26px;
    padding-left: 20px;
    padding-right: 20px;

    background: ${colors.neutral00};
    min-width: 124px;
    height: 55px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
    }

    &:hover {
      color: ${colors.mainPrimary40};
      box-shadow: ${shadows.soft};
    }
    
    &:active {
      background-color: ${colors.mainPrimary60};
      box-shadow: 0 5px #666;
      transform: translateY(4px);
    }
    
    ${(props) =>
      props.secondary &&
      css`
        background: ${colors.mainPrimary30};
        color: ${colors.neutral00};

        &:hover {
          background: ${colors.mainPrimary40};
          color: ${colors.neutral00};
        }
      `}

    ${downTo("md")} {
      font-size: ${typography.sizes.medium};
      font-weight: 500;
      line-height: 22px;
      height: 44px;
    }
  `
);
