import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import { getPaymentResult } from '../../../services/PaymentService';
import './PaymentResult.css';

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [codPayment, setCodPayment] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Check if this is a COD payment result (from state)
        if (location.state && location.state.paymentMethod === "COD") {
          setCodPayment({
            orderId: location.state.orderId,
            amount: location.state.amount,
            paymentMethod: "COD"
          });
          setLoading(false);
          return;
        }

        // Otherwise, treat as VNPay payment
        const queryParams = new URLSearchParams(location.search);

        // If there are no query parameters, this is a direct access (not from VNPay)
        if (!queryParams.get('vnp_ResponseCode')) {
          setError("Không có thông tin thanh toán để xác thực.");
          setLoading(false);
          return;
        }

        // Send verification request to backend
        const response = await getPaymentResult(queryParams);
        setResult(response);
      } catch (err) {
        setError(err.message || 'Không thể xác thực thanh toán');
        console.error('Lỗi xác thực:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search, location.state]);

  const getStatusText = (code) => {
    switch (code) {
      case '00':
        return 'Giao dịch thành công';
      case '07':
        return 'Trừ tiền thành công, giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)';
      case '09':
        return 'Giao dịch không thành công do Thẻ/Tài khoản không đủ số dư';
      case '10':
        return 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần';
      case '11':
        return 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán';
      case '12':
        return 'Giao dịch không thành công do: Thẻ/Tài khoản bị khóa';
      case '24':
        return 'Giao dịch không thành công do: Khách hàng hủy giao dịch';
      case '51':
        return 'Giao dịch không thành công do: Tài khoản không đủ số dư để thực hiện giao dịch';
      case '65':
        return 'Giao dịch không thành công do: Tài khoản đã vượt quá hạn mức giao dịch trong ngày';
      case '75':
        return 'Ngân hàng thanh toán đang bảo trì';
      case '79':
        return 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định';
      case '99':
        return 'Các lỗi khác';
      default:
        return 'Giao dịch thất bại';
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToOrders = () => {
    navigate('/order-history');
  };

  if (loading) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-loading">
          <div className="spinner"></div>
          <p>Đang xác thực kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-error">
          <h2>Lỗi xác thực</h2>
          <p>{error}</p>
          <div className="payment-result-buttons">
            <ButtonComponent onClick={handleGoHome}>Về trang chủ</ButtonComponent>
            <ButtonComponent onClick={() => navigate('/payment')}>Thử lại</ButtonComponent>
          </div>
        </div>
      </div>
    );
  }

  // Handle COD payment result
  if (codPayment) {
    return (
      <div className="payment-result-container">
        <div className="payment-result-card success">
          <div className="payment-result-header">
            <h2>Đặt hàng thành công</h2>
          </div>
          <div className="payment-result-body">
            <p><strong>Mã đơn hàng:</strong> {codPayment.orderId}</p>
            <p><strong>Số tiền:</strong> {codPayment.amount.toLocaleString()} VND</p>
            <p><strong>Phương thức thanh toán:</strong> Thanh toán khi nhận hàng (COD)</p>
            <p><strong>Trạng thái:</strong> Đang xử lý</p>
            <p className="cod-instruction">
              Quý khách sẽ thanh toán khi nhận hàng. Vui lòng chuẩn bị đúng số tiền khi nhận hàng.
            </p>
          </div>
          <div className="payment-result-buttons">
            <ButtonComponent onClick={handleGoHome}>Về trang chủ</ButtonComponent>
            <ButtonComponent onClick={handleGoToOrders}>Xem đơn hàng</ButtonComponent>
          </div>
        </div>
      </div>
    );
  }

  // Handle VNPay payment result
  const isSuccess = result && result.code === '00';

  return (
    <div className="payment-result-container">
      <div className={`payment-result-card ${isSuccess ? 'success' : 'error'}`}>
        <div className="payment-result-header">
          <h2>{isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}</h2>
        </div>
        <div className="payment-result-body">
          {result && (
            <>
              <p><strong>Mã phản hồi:</strong> {result.code}</p>
              <p><strong>Trạng thái:</strong> {getStatusText(result.code)}</p>
              <p><strong>Phương thức thanh toán:</strong> VNPay</p>
              {result.data && (
                <>
                  <p><strong>Mã giao dịch:</strong> {result.data.vnp_TxnRef}</p>
                  <p><strong>Số tiền:</strong> {parseInt(result.data.vnp_Amount) / 100} VND</p>
                  <p><strong>Nội dung thanh toán:</strong> {result.data.vnp_OrderInfo}</p>
                  <p><strong>Mã ngân hàng:</strong> {result.data.vnp_BankCode || 'N/A'}</p>
                  <p><strong>Thời gian:</strong> {result.data.vnp_PayDate}</p>
                </>
              )}
            </>
          )}
        </div>
        <div className="payment-result-buttons">
          <ButtonComponent onClick={handleGoHome}>Về trang chủ</ButtonComponent>
          <ButtonComponent onClick={handleGoToOrders}>Xem đơn hàng</ButtonComponent>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
