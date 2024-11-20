import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaPaperPlane } from 'react-icons/fa';
import TailSpin from 'react-loading-icons/dist/esm/components/tail-spin';
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Heading1 } from './components/text/Heading';
import { Paragraph1 } from './components/text/Paragraph';
import DefaultButton from "./components/button/DefaultButton";
import backgroundImage from './background.png';
import einsteinIcon from './Albert-Einstein-Icon-PNG-621960607.png'; // Import the image

const backendUrl = process.env.REACT_APP_PRODUCTION_FLAG === 'true' ? process.env.REACT_APP_RUTA_BACK : process.env.REACT_APP_RUTA_LOCAL;

const Icon = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 10px;
`;

const BotContainer = styled.div`
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 600px;
`;

const StyledForm = styled(Form)`
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border: 2px solid #A1DA39;
  box-sizing: border-box;
  border-radius: 9px;
  padding: 30px 50px;
`;

const ChatContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled.div`
  background-color: ${props => props.isUser ? '#A1DA39' : '#e0e0e0'};
  color: ${props => props.isUser ? 'white' : 'black'};
  border-radius: 10px;
  padding: 10px;
  margin: 5px;
  max-width: 80%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  word-wrap: break-word;
`;

const InputContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
`;

const StyledInput = styled(Field)`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const SendButton = styled(DefaultButton)`
  height: 40px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledErrorMessage = styled.div`
  font-family: "InterRegular";
  color: #DE4C38;
  font-size: 1rem;
  text-align: left;
  width: 100%;
  margin-top: 5px;
`;



function Bot() {
  const [messages, setMessages] = useState([]);

  const validationSchema = Yup.object({
    message: Yup.string().required('Por favor, ingrese un mensaje'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const userMessage = values.message;
    const newMessage = { role: 'user', content: userMessage };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    try {
      const response = await axios.post(`${backendUrl}/api/chat`, { messages: [...messages, newMessage] });
      const botReply = { role: 'assistant', content: response.data.reply};
      setMessages(prevMessages => [...prevMessages, botReply]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'assistant', content: 'Lo siento, ocurrió un error. Por favor, intenta de nuevo.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }

    setSubmitting(false);
    resetForm();
  };

  return (
    <BotContainer>
      <Overlay />
      <ContentContainer>
        <Formik
          initialValues={{ message: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <StyledForm>
              <Heading1>
                <Icon src={einsteinIcon} alt="Einstein Icon" />
                Chat con EinsteinBot
              </Heading1>
              <Paragraph1>Conversa con nuestro EinsteinBot desarrollado mediante IA!</Paragraph1>

              <ChatContainer>
                {messages.map((message, index) => (
                  <MessageBubble key={index} isUser={message.role === 'user'}>
                    {message.content}
                  </MessageBubble>
                ))}
              </ChatContainer>

              <InputContainer>
                <StyledInput
                  type="text"
                  name="message"
                  placeholder="Escribe tu mensaje aquí..."
                />
                <SendButton
                  type="submit"
                  disabled={isSubmitting}
                  content={isSubmitting ? <TailSpin stroke="#000000" /> : <FaPaperPlane />}
                  secondary
                />
              </InputContainer>
              {errors.message && touched.message && (
                <StyledErrorMessage>{errors.message}</StyledErrorMessage>
              )}
            </StyledForm>
          )}
        </Formik>
      </ContentContainer>
    </BotContainer>
  );
}

export default Bot;