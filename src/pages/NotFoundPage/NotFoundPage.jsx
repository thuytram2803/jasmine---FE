import React from "react";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import ButtonNoBGComponent from "../../components/ButtonNoBGComponent/ButtonNoBGComponent";
import FooterComponent from "../../components/FooterComponent/FooterComponent";
import FormComponent from "../../components/FormComponent/FormComponent";
import SearchBoxComponent from "../../components/SearchBoxComponent/SearchBoxComponent";
import SideMenuComponent from "../../components/SideMenuComponent/SideMenuComponent";
import "./NotFoundPage.css";
import OTPComponent from "../../components/OTPComponent/OTPComponent";
import SizeComponent from "../../components/SizeComponent/SizeComponent";
import ModalComponent from "../../components/ModalComponent/ModalComponent";

const NotFoundPage = () => {
  return (
    <div className="bg">
      <h1>This page is unavailable</h1>
      <ButtonComponent>Đăng nhập</ButtonComponent>
      <SearchBoxComponent></SearchBoxComponent>
      <ButtonNoBGComponent className="custom_btn">home</ButtonNoBGComponent>
      <FormComponent
        id="emailInput"
        label="Email"
        type="email"
        placeholder="Nhập email"
      />
      {/* <FooterComponent></FooterComponent>
      <SideMenuComponent></SideMenuComponent>
      <OTPComponent></OTPComponent>
      <SizeComponent></SizeComponent> */}
      <ModalComponent></ModalComponent>
    </div>
  );
};

export default NotFoundPage;
