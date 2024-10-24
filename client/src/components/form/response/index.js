import React from "react";

const FormResponse = ({ sent, success, Form, Success, Error }) => {
  if (!sent) {
    return <Form />;
  } else if (success) {
    return <Success />;
  } else {
    return <Error />;
  }
};

export default FormResponse;
