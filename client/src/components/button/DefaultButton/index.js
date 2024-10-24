import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { StyledDefaultButton } from "./styles";

const DefaultButton = ({
  destination,
  content,
  secondary,
  handleClick,
  disabled = false,
  type = "button",
}) => {
  const navigate = useNavigate(); 
  
  const handleButtonClick = () => {
    if (destination && destination !== undefined) {
      navigate(destination);
    } else if (handleClick) {
      handleClick();
    }
  };
  
  return (
    <StyledDefaultButton
      secondary={secondary}
      onClick={type === 'button' ? handleButtonClick : undefined}
      type={type}
      disabled={disabled}
    >
      {content}
    </StyledDefaultButton>
  );
};
export default DefaultButton;

DefaultButton.propTypes = {
  /* *
   *  Destination route path
   */
  destination: PropTypes.string,
  /* *
   * Button's text
   */
  content: PropTypes.string,
  /* *
   * Activate secondary color styles
   */
  secondary: PropTypes.bool,
  /* *
   * Callback handler when clicked
   */
  handleClick: PropTypes.func,
  /* *
   * Button type
   */
  type: PropTypes.string,
  /* *
   * Button disabled
   */
  disabled: PropTypes.bool,
};
