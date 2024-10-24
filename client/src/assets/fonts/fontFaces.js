import { createGlobalStyle } from "styled-components";
import InterRegular from "./Inter/Inter-Regular.ttf";
import InterMedium from "./Inter/Inter-Medium.ttf";
import InterSemiBold from "./Inter/Inter-SemiBold.ttf";
import InterBold from "./Inter/Inter-Bold.ttf";
import InterVariable from "./Inter/Inter-Variable.ttf";

export default createGlobalStyle`
  @font-face {
    font-family: 'InterRegular';
    src: url(${InterRegular}) format('truetype');
  }
  @font-face {
    font-family: 'InterMedium';
    src: url(${InterMedium}) format('truetype');
  }
  @font-face {
    font-family: 'InterSemiBold';
    src: url(${InterSemiBold}) format('truetype');
  }
  @font-face {
    font-family: 'InterBold';
    src: url(${InterBold}) format('truetype');
  }
  @font-face {
    font-family: 'InterVariable';
    src: url(${InterVariable}) format('truetype');
  }
`;
