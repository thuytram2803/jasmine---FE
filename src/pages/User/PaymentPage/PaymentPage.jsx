import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentPage.css";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import ProductInforCustom from "../../../components/ProductInfor/ProductInforCustom";
import { useSelector } from "react-redux";
import * as PaymentService from "../../../services/PaymentService";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = useSelector((state) => state.order);
  console.log("orderDetails", orderDetails);
  const cart = useSelector((state) => state.cart); // Lấy danh sách sản phẩm từ Redux

  const lastOrder = orderDetails.orders?.[orderDetails.orders.length - 1] || {};
  const {
    orderItems = [],
    totalPrice,
    shippingAddress,
    paymentMethod,
  } = lastOrder;
  console.log("lastOrder", lastOrder);

  // Tìm thông tin chi tiết của sản phẩm từ `cart.products` dựa trên `orderItems`
  const resolvedOrderItems = orderItems.map((item) => {
    const product = cart.products.find((p) => p.id === item.product);
    return {
      ...item,
      img: product?.img || "default_image_url",
      name: product?.title || "Unknown Product",
      price:
        typeof product?.price === "number"
          ? product.price
          : parseFloat((product?.price || "0").replace(/[^0-9.-]+/g, "")) || 0,
    };
  });

  const [paymentType, setPaymentType] = useState("bank"); // "bank", "wallet", or "vnpay"
  const [paymentInfo, setPaymentInfo] = useState({
    userBank: "",
    userBankNumber: "",
    phoneNumber: "",
    wallet: "",
  });
  const [vnpayOptions, setVnpayOptions] = useState({
    bankCode: "",
    language: "vn"
  });

  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value);
    setPaymentInfo({
      ...paymentInfo,
      userBank: "",
      userBankNumber: "",
      wallet: "",
    }); // Reset thông tin
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    if (field === "phoneNumber" && !/^\d*$/.test(value)) return;
    setPaymentInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleVnpayOptionChange = (field) => (e) => {
    setVnpayOptions((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const [value, setValue] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const handleChange1 = (e) => {
    const value2 = e.target.value;
    // Kiểm tra chỉ nhập số và không vượt quá 10 ký tự
    if (/^\d{0,10}$/.test(value2)) {
      setPhoneNumber(value2);
      setError("");
    }
  };
  const handleChange2 = (e) => {
    const inputValue = e.target.value;

    // Chỉ cho phép nhập các ký tự số
    if (/^\d*$/.test(inputValue)) {
      setValue(inputValue);
    }
  };

  const handleBlur = () => {
    // Kiểm tra độ dài chính xác là 10 số
    if (phoneNumber.length !== 10) {
      setError("Số điện thoại phải bao gồm đúng 10 số.");
    } else {
      setError(""); // Xóa lỗi nếu nhập đúng
    }
  };
  //Su kien click
  const handleClickBack = () => {
    navigate("/order-information", { state: { ...location.state } });
  };
  console.log("orderId", lastOrder?.orderId);

  const handleClickPay = async () => {
    try {
      if (paymentType === "vnpay") {
        // Xử lý thanh toán VNPay
        const vnpayData = {
          amount: lastOrder.totalItemPrice + lastOrder.shippingPrice,
          orderInfo: `Thanh toan don hang ${lastOrder?.orderId}`,
          bankCode: vnpayOptions.bankCode,
          language: vnpayOptions.language,
          orderId: lastOrder?.orderId
        };

        const response = await PaymentService.createVnpayPayment(vnpayData);

        if (response?.status === "OK" && response?.code === '00') {
          // Chuyển hướng đến cổng thanh toán VNPay
          window.location.href = response.data;
        } else {
          alert("Không thể tạo liên kết thanh toán. Vui lòng thử lại.");
        }
        return;
      }

      // Xử lý thanh toán truyền thống (bank/wallet)
      if (!paymentInfo.userBank || !paymentInfo.userBankNumber) {
        alert("Vui lòng điền đầy đủ thông tin thanh toán!");
        return;
      }

      const paymentData = {
        paymentCode: `PAY-${Date.now()}`, // Sinh mã thanh toán
        userBank: paymentInfo.userBank,
        userBankNumber: paymentInfo.userBankNumber,
        paymentMethod: paymentType,
        ...(paymentType === "bank"
          ? {
              userBank: paymentInfo.userBank,
              userBankNumber: paymentInfo.userBankNumber,
            }
          : { wallet: paymentInfo.wallet }),
        orderId: lastOrder?.orderId, // Gắn ID đơn hàng
      };

      localStorage.setItem("paymentData", JSON.stringify(paymentData));

      const response = await PaymentService.createPayment(paymentData);

      if (response?.status === "OK") {
        alert("Đã lưu thông tin thanh toán!");

        navigate("/banking-info", {
          state: {
            paymentCode: response.data.paymentCode, // Mã thanh toán từ API
          },
        });
      } else {
        alert("Thanh toán thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error in handleClickPay:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container-xl">
      <div className="container-xl-pay">
        {/* =========================THONG TIN THANH TOAN=========================        */}
        <div className="PaymentInfor">
          <p className="pThongtin">Thông tin thanh toán</p>
          {/* ==========Ngan hang-Vi dien tu========= */}
          {/* Chọn hình thức thanh toán */}
          <div
            className="PaymentTypeHolder"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 20px",
            }}
          >
            <label>
              <input
                type="radio"
                value="bank"
                checked={paymentType === "bank"}
                onChange={handlePaymentTypeChange}
              />
              Ngân hàng
            </label>
            <label>
              <input
                type="radio"
                value="wallet"
                checked={paymentType === "wallet"}
                onChange={handlePaymentTypeChange}
              />
              Ví điện tử
            </label>
            <label>
              <input
                type="radio"
                value="vnpay"
                checked={paymentType === "vnpay"}
                onChange={handlePaymentTypeChange}
              />
              VNPay
            </label>
          </div>

          {/* Form Ngân hàng */}
          {paymentType === "bank" && (
            <div className="BankHolder ">
              <select
                className="Bank"
                name="Bank"
                value={paymentInfo.userBank}
                onChange={handleInputChange("userBank")}
                style={{
                  width: "100%",
                  margin: "10px 0",
                }}
              >
                <option value="" disabled>
                  Chọn ngân hàng
                </option>
                <option value="vietcombank">Vietcombank</option>
                <option value="techcombank">Techcombank</option>
              </select>
              <input
                type="text"
                className="input1"
                placeholder="Nhập số tài khoản"
                value={paymentInfo.userBankNumber}
                onChange={handleInputChange("userBankNumber")}
                style={{
                  width: "100%",
                }}
              />
            </div>
          )}

          {/* Form Ví điện tử */}
          {paymentType === "wallet" && (
            <div className="WalletHolder">
              <select
                className="E-wallet"
                name="Wallet"
                value={paymentInfo.userBank}
                onChange={handleInputChange("wallet")}
                style={{
                  width: "100%",
                  margin: "10px 0",
                }}
              >
                <option value="" disabled>
                  Chọn ví điện tử
                </option>
                <option value="momo">Momo</option>
                <option value="zalopay">Zalo Pay</option>
              </select>
              <div className="inputSdt">
                <span>
                  <input
                    type="text"
                    className="input2"
                    placeholder="Nhập số điện thoại"
                    onBlur={handleBlur}
                    //   onChange={handleChange1}
                    //   value={phoneNumber}
                    value={paymentInfo.userBankNumber}
                    onChange={handleInputChange("phoneNumber")}
                    style={{
                      width: "100%",
                    }}
                  ></input>
                </span>
                <span style={{ color: "red", fontSize: "12px" }}>{error}</span>
              </div>
            </div>
          )}

          {/* Form VNPay */}
          {paymentType === "vnpay" && (
            <div className="VnpayHolder">
              <select
                className="BankCode"
                name="BankCode"
                value={vnpayOptions.bankCode}
                onChange={handleVnpayOptionChange("bankCode")}
                style={{
                  width: "100%",
                  margin: "10px 0",
                }}
              >
                <option value="">Hiển thị cổng thanh toán VNPay</option>
                <option value="NCB">NCB</option>
                <option value="VIETCOMBANK">VIETCOMBANK</option>
                <option value="VIETINBANK">VIETINBANK</option>
                <option value="BIDV">BIDV</option>
                <option value="AGRIBANK">AGRIBANK</option>
                <option value="SACOMBANK">SACOMBANK</option>
                <option value="TECHCOMBANK">TECHCOMBANK</option>
                <option value="MBBANK">MBBANK</option>
                <option value="TPBANK">TPBANK</option>
              </select>
              <select
                className="Language"
                name="Language"
                value={vnpayOptions.language}
                onChange={handleVnpayOptionChange("language")}
                style={{
                  width: "100%",
                  margin: "10px 0",
                }}
              >
                <option value="vn">Tiếng Việt</option>
                <option value="en">Tiếng Anh</option>
              </select>
              <p style={{ fontSize: "14px", color: "#888", padding: "10px" }}>
                Chọn "Thanh toán" để tiếp tục đến cổng thanh toán VNPay
              </p>
            </div>
          )}

          {/* ==================Button=========== */}
          <div className="Button-area-pay">
            <div className="button1">
              <ButtonComponent onClick={handleClickBack}>
                Quay lại
              </ButtonComponent>
            </div>
            <div className="button2">
              <ButtonComponent className="customBtn2" onClick={handleClickPay}>
                {paymentType === "vnpay" ? "Thanh toán qua VNPay" : "Thanh toán"}
              </ButtonComponent>
            </div>
          </div>
        </div>

        {/* ======================= THONG TIN DON HANG (CO PHI VAN CHUYEN)===============       */}
        <div className="final-order">
          {resolvedOrderItems.length > 0 ? (
            resolvedOrderItems.map((product, index) => (
              <ProductInforCustom
                key={index}
                // id={product._id}
                image={product.img}
                name={product.name}
                price={(product.price || 0).toLocaleString() + " VND"}
                quantity={product.quantity}
              />
            ))
          ) : (
            <p>Không có sản phẩm nào trong đơn hàng</p>
          )}
          {/* ===============TIEN CAN THANH TOAN============   */}
          <div className="footerAreaPayment">
            <div className="tamtinh" style={{ marginBottom: "10px" }}>
              <label style={{ paddingLeft: "10px" }}>Tạm tính:</label>
              <p className="tamtinh2">
                {lastOrder.totalItemPrice.toLocaleString()} VND
              </p>
            </div>
            <div className="tamtinhVanChuyen">
              <label style={{ paddingLeft: "10px" }}>
                Tổng tiền (gồm phí vận chuyển):
              </label>
              <p className="tamtinhVanChuyen2">
                {(
                  lastOrder.totalItemPrice + lastOrder.shippingPrice
                ).toLocaleString()}{" "}
                VND
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
