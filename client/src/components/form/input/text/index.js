import React from "react";
import propTypes from "prop-types";
import { Field } from "formik";
import {
  StyledTextInput,
  TextInputContainer,
  StyledTextareaInput,
  StyledLabel,
  StyledErrorMessage,
} from "./styles";

const TextInput = ({ type = "text", name, label, validate, placeholder }) => (
  <TextInputContainer type={type}>
    <StyledLabel htmlFor={name}>{label}</StyledLabel>
    <Field name={name} type={type} validate={validate}>
      {({ field, meta }) => (
        <>
          {type === "textarea" ? (
            <StyledTextareaInput
              type={type}
              name={name}
              {...field}
              placeholder={placeholder}
            />
          ) : (
            <StyledTextInput
              type={type}
              name={name}
              {...field}
              placeholder={placeholder}
            />
          )}
          {meta.touched && meta.error && (
            <StyledErrorMessage>{meta.error}</StyledErrorMessage>
          )}
        </>
      )}
    </Field>
  </TextInputContainer>
);

export default TextInput;

TextInput.propTypes = {
  /**
   Input Type
   */
  type: propTypes.oneOf(["text", "textarea"]),
  /**
   Input name
   */
  name: propTypes.string.isRequired,
  /**
   Input label
   */
  label: propTypes.string.isRequired,
  /**
   Input validation function
   */
  validate: propTypes.func,
  /**
   Input placeholder
   */
  placeholder: propTypes.string,
};
