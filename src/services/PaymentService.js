import axios from "axios";

export const createPayment = async (data) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/payment/create-payment`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          // token: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    if (error.response) {
      throw {
        // status: error.response.data?.status || "ERR",
        message: error.response.data?.message || "Đã xảy ra lỗi.",
      };
    } else {
      throw { status: 500, message: "Không thể kết nối đến máy chủ." };
    }
  }
};

// Create VNPay payment
export const createVnpayPayment = async (data) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/payment/create-vnpay-payment`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    if (error.response) {
      throw {
        message: error.response.data?.message || "Đã xảy ra lỗi khi tạo thanh toán VNPay.",
      };
    } else {
      throw {
        status: 500,
        message: "Không thể kết nối đến máy chủ."
      };
    }
  }
};

// Get VNPay payment result
export const getVnpayResult = async (params) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/payment/vnpay-return`,
      { params }
    );
    return res.data;
  } catch (error) {
    if (error.response) {
      throw {
        message: error.response.data?.message || "Đã xảy ra lỗi khi xác thực thanh toán.",
      };
    } else {
      throw {
        status: 500,
        message: "Không thể kết nối đến máy chủ."
      };
    }
  }
};