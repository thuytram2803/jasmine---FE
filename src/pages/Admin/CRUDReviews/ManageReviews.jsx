import React, { useState, useEffect } from "react";
import "./ManageReviews.css";
import { getAllReviews, toggleReviewVisibility, deleteReview } from "../../../services/ReviewService";
import StarRating from "../../../components/StarRating/StarRating";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, visible, hidden

  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  // Check if user is admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch reviews on component mount and when page changes
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await getAllReviews(currentPage, 10);

        if (response.status === "OK") {
          setReviews(response.data);
          setTotalPages(response.pagination.pages);
        } else {
          setError("Không thể tải danh sách đánh giá");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError("Đã xảy ra lỗi khi tải danh sách đánh giá");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage]);

  // Format the review date
  const formatReviewDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Handle toggling review visibility
  const handleToggleVisibility = async (reviewId) => {
    try {
      const response = await toggleReviewVisibility(reviewId);

      if (response.status === "OK") {
        // Update the review in the list
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review._id === reviewId
              ? { ...review, isVisible: !review.isVisible }
              : review
          )
        );
      }
    } catch (error) {
      console.error("Error toggling review visibility:", error);
    }
  };

  // Handle deleting a review
  const handleDeleteReview = async (reviewId) => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
        const response = await deleteReview(reviewId);

        if (response.status === "OK") {
          // Remove the review from the list
          setReviews(prevReviews =>
            prevReviews.filter(review => review._id !== reviewId)
          );
        }
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  // Filter and search reviews
  const filteredReviews = reviews.filter(review => {
    // Apply visibility filter
    if (selectedFilter === "visible" && !review.isVisible) return false;
    if (selectedFilter === "hidden" && review.isVisible) return false;

    // Apply search term filter
    if (searchTerm.trim() === "") return true;

    const searchTermLower = searchTerm.toLowerCase();
    return (
      (review.comment && review.comment.toLowerCase().includes(searchTermLower)) ||
      (review.username && review.username.toLowerCase().includes(searchTermLower))
    );
  });

  // Pagination component
  const Pagination = () => {
    return (
      <div className="reviews-pagination">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage <= 1}
        >
          <i className="fas fa-chevron-left"></i> Trước
        </button>

        <div className="pagination-info">
          Trang {currentPage} / {totalPages}
        </div>

        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage >= totalPages}
        >
          Sau <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="manage-reviews-container">
        <div className="loading-reviews">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-reviews-container">
      <div className="manage-reviews-header">
        <h1 className="manage-reviews-title">
          <i className="fas fa-star"></i> Quản lý đánh giá sản phẩm
        </h1>

        <div className="reviews-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm theo nội dung hoặc người dùng"
              value={searchTerm}
              onChange={handleSearch}
            />
            <i className="fas fa-search"></i>
          </div>

          <div className="filter-box">
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
            >
              <option value="all">Tất cả đánh giá</option>
              <option value="visible">Đánh giá hiển thị</option>
              <option value="hidden">Đánh giá đã ẩn</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="reviews-error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {filteredReviews.length === 0 ? (
            <div className="no-reviews-message">
              <i className="fas fa-comment-slash"></i>
              <p>Không tìm thấy đánh giá nào</p>
            </div>
          ) : (
            <div className="reviews-table-container">
              <table className="reviews-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Đánh giá</th>
                    <th>Nội dung</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map(review => (
                    <tr
                      key={review._id}
                      className={review.isVisible ? "" : "hidden-review-row"}
                    >
                      <td className="username-cell">{review.username}</td>
                      <td className="rating-cell">
                        <StarRating rating={review.rating} readOnly={true} size="small" />
                      </td>
                      <td className="comment-cell">{review.comment}</td>
                      <td className="date-cell">{formatReviewDate(review.createdAt)}</td>
                      <td className="status-cell">
                        <span className={`status-badge ${review.isVisible ? "visible" : "hidden"}`}>
                          {review.isVisible ? "Hiển thị" : "Đã ẩn"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className={`visibility-btn ${review.isVisible ? "hide-btn" : "show-btn"}`}
                          onClick={() => handleToggleVisibility(review._id)}
                          title={review.isVisible ? "Ẩn đánh giá" : "Hiện đánh giá"}
                        >
                          {review.isVisible ? (
                            <i className="fas fa-eye-slash"></i>
                          ) : (
                            <i className="fas fa-eye"></i>
                          )}
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteReview(review._id)}
                          title="Xóa đánh giá"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination />
        </>
      )}
    </div>
  );
};

export default ManageReviews;