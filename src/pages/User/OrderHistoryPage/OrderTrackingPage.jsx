import React, { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import SideMenuComponent from "../../../components/SideMenuComponent/SideMenuComponent";
import * as OrderService from "../../../services/OrderService";
import * as StatusService from "../../../services/StatusService";
import "./OrderTrackingPage.css";
import { useSelector } from "react-redux";

const OrderTrackingPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const handleDetail = (order) => {
    navigate("/order-detail-history/" + order._id, { state: { order } });
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const userId = user.id;

      if (!token || !userId) {
        throw new Error("Vui lòng đăng nhập để xem đơn hàng");
      }

      const response = await OrderService.getOrdersByUser(token, userId);
      setOrders(response?.data || []);
      setFilteredOrders(response?.data || []);
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await StatusService.getAllStatus(token);
      const statusOptions = [
        { label: "Tất cả", value: null },
        ...response.data.map((status) => ({
          label: status.statusName,
          value: status.statusCode,
        })),
      ];
      setStatuses(statusOptions);
    } catch (error) {
      console.error("Không thể tải danh sách trạng thái", error.message);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchStatuses();
      fetchOrders();
    }
  }, [user]);

  const handleFilter = (statusCode) => {
    setSelectedStatus(statusCode);
    if (!statusCode) {
      setFilteredOrders(orders); // Hiển thị tất cả đơn hàng
    } else {
      setFilteredOrders(
        orders.filter((order) => order.status?.statusCode === statusCode)
      );
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeClass = (statusName) => {
    if (!statusName) return "secondary";

    const statusMap = {
      "PENDING": "warning",
      "PROCESSING": "info",
      "SHIPPED": "primary",
      "DELIVERED": "success",
      "CANCELLED": "danger"
    };

    // Default case - convert status name to status code format
    const statusKey = statusName.toUpperCase();
    return statusMap[statusKey] || "secondary";
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Format currency with thousand separator
  const formatCurrency = (amount) => {
    if (!amount) return "0 VND";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format order code to show only ORD and 4 characters
  const formatOrderCode = (code) => {
    if (!code) return "";

    // If the format is already ORD-XXXX, just return it
    if (code.startsWith('ORD-') && code.length <= 8) return code;

    // Extract just the first 4 characters after ORD- prefix
    if (code.startsWith('ORD-')) {
      const parts = code.split('-');
      if (parts.length > 1) {
        return `ORD-${parts[1].substring(0, 4)}`;
      }
    }

    // If it's another format, take first 4 characters
    return `ORD-${code.substring(0, 4)}`;
  };

  return (
    <div className="order-tracking-container">
      <div className="container-xl">
        <div className="order-tracking__info">
          <div className="order-tracking__content">
            <div className="order-tracking__header">
              <h2 className="order-tracking__title">Theo dõi đơn hàng</h2>

              <div className="order-tracking__meta">
                <div className="order-count">
                  <span className="count-label">Tổng số đơn hàng:</span>
                  <span className="count-value">{filteredOrders.length}</span>
                </div>

                <div className="filter-order">
                  <DropdownButton
                    className="filter-order__status"
                    title={
                      <span>
                        <i className="fas fa-filter me-2"></i>
                        {selectedStatus
                          ? statuses.find((s) => s.value === selectedStatus)?.label ||
                          "Chọn trạng thái"
                          : "Chọn trạng thái"}
                      </span>
                    }
                    onSelect={handleFilter}
                  >
                    {statuses.map((status, index) => (
                      <Dropdown.Item key={index} eventKey={status.value}>
                        {status.label}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </div>
              </div>
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredOrders.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-inbox fa-3x mb-3"></i>
                <p>Bạn chưa có đơn hàng nào</p>
                <ButtonComponent onClick={() => navigate("/products")}>
                  Mua sắm ngay
                </ButtonComponent>
              </div>
            )}

            {/* Table */}
            {!loading && filteredOrders.length > 0 && (
              <div className="table-container">
                <table className="order-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Mã đơn</th>
                      <th>Trạng thái</th>
                      <th>Ngày đặt</th>
                      <th>Ngày giao dự kiến</th>
                      <th>Tổng tiền</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => (
                      <tr
                        key={order._id}
                        className="order-row"
                      >
                        <td>{index + 1}</td>
                        <td className="order-code">{formatOrderCode(order.orderCode)}</td>
                        <td>
                          <Badge
                            bg={getStatusBadgeClass(order.status?.statusName)}
                            className="status-badge"
                          >
                            {order.status?.statusName || "Không xác định"}
                          </Badge>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{formatDate(order.deliveryDate)}</td>
                        <td className="price-column">{formatCurrency(order.totalPrice)}</td>
                        <td>
                          <ButtonComponent
                            className="btn-detail"
                            onClick={() => handleDetail(order)}
                          >
                            Chi tiết
                          </ButtonComponent>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Status Timeline UI */}
            {!loading && filteredOrders.length > 0 && (
              <div className="status-timeline-container mt-4">
                <h3 className="timeline-title">Diễn giải trạng thái đơn hàng</h3>
                <div className="status-timeline">
                  <div className="timeline-step">
                    <div className="timeline-icon pending">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="timeline-content">
                      <h4>Đang chờ xử lý</h4>
                      <p>Đơn hàng của bạn đã được tiếp nhận và đang chờ xác nhận.</p>
                    </div>
                  </div>
                  <div className="timeline-step">
                    <div className="timeline-icon processing">
                      <i className="fas fa-cog"></i>
                    </div>
                    <div className="timeline-content">
                      <h4>Đang xử lý</h4>
                      <p>Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.</p>
                    </div>
                  </div>
                  <div className="timeline-step">
                    <div className="timeline-icon shipped">
                      <i className="fas fa-truck"></i>
                    </div>
                    <div className="timeline-content">
                      <h4>Đang giao hàng</h4>
                      <p>Đơn hàng của bạn đang được vận chuyển đến địa chỉ nhận hàng.</p>
                    </div>
                  </div>
                  <div className="timeline-step">
                    <div className="timeline-icon delivered">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="timeline-content">
                      <h4>Đã giao hàng</h4>
                      <p>Đơn hàng của bạn đã được giao thành công.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;