import React from "react";
import "./StatusComponent.css";

const StatusComponent = ({ status }) => {
  const isDelivered = status.trim() === "Đơn hàng đã được giao"; // Kiểm tra trạng thái

  return (
    <div className={`status-container ${isDelivered ? "status-delivered" : ""}`}>
      <svg
        className={`status-icon ${isDelivered ? "status-icon-delivered" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="16"
        viewBox="0 0 22 16"
        fill="none"
      >
        <path
          d="M17 14.5C17.83 14.5 18.5 13.83 18.5 13C18.5 12.17 17.83 11.5 17 11.5C16.17 11.5 15.5 12.17 15.5 13C15.5 13.83 16.17 14.5 17 14.5ZM18.5 5.5H16V8H20.46L18.5 5.5ZM5 14.5C5.83 14.5 6.5 13.83 6.5 13C6.5 12.17 5.83 11.5 5 11.5C4.17 11.5 3.5 12.17 3.5 13C3.5 13.83 4.17 14.5 5 14.5ZM19 4L22 8V13H20C20 14.66 18.66 16 17 16C15.34 16 14 14.66 14 13H8C8 14.66 6.66 16 5 16C3.34 16 2 14.66 2 13H0V2C0 0.89 0.89 0 2 0H16V4H19ZM2 2V11H2.76C3.31 10.39 4.11 10 5 10C5.89 10 6.69 10.39 7.24 11H14V2H2Z"
        />
      </svg>
      <label className={`status-name ${isDelivered ? "status-name-delivered" : ""}`}>
        {status}
      </label>
    </div>
  );
};

export default StatusComponent;
