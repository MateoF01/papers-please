import styled, { css } from "styled-components";

const sharedInputStyle = ({ theme: { colors, typography, downTo } }) => css`
  margin: 0.5rem 0;
  border: 2px solid ${colors.mainPrimary20};
  width: 100%;
  box-sizing: border-box;
  border-radius: 9px;
  font-size: ${typography.sizes.large};
  font-family: "InterRegular";
  font-style: normal;
  color: ${colors.textMedium};

  ${downTo("md")} {
    font-size: ${typography.sizes.medium};
  }
  &:focus {
    outline: none;
    box-shadow: 0px 0px 4px ${colors.mainPrimary20};
  }
`;
export const StyledTextInput = styled.input`
  ${sharedInputStyle}
  height: 2.75rem;
`;

export const StyledTextareaInput = styled.textarea`
  ${sharedInputStyle}
  flex-grow: 1;
  resize: none;
  min-height: 8rem;
  padding: 0.5rem;
`;

export const TextInputContainer = styled.div(
  ({ type, theme: { downTo } }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%%;
    position: relative;
    ${type === "textarea" &&
    css`
      height: 100%;
    `};
    ${downTo("md")} {
      width: 100%;
    }
  `
);

export const StyledLabel = styled.label(
  ({ theme: { colors, typography, downTo } }) => css`
    font-size: ${typography.sizes.large};
    font-family: "InterRegular";
    font-style: normal;
    color: ${colors.textMedium};
    padding-top: 2rem;

    ${downTo("md")} {
      font-size: ${typography.sizes.medium};
    }
  `
);
export const StyledErrorMessage = styled.div(
  ({ theme: { colors, typography } }) => css`
    font-size: ${typography.sizes.medium};
    font-family: "InterRegular";
    color: ${colors.feedbackErrorMedium};
    margin-top: -5px;
    max-width: 320px;
    word-wrap: break-word;
    white-space: normal;
  `
);
