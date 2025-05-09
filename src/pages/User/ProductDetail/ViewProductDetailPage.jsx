import { React, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ViewProductDetailPage.css";
import SizeComponent from "../../../components/SizeComponent/SizeComponent";
import ButtonComponent from "../../../components/ButtonComponent/ButtonComponent";
import QuantityBtn from "../../../components/QuantityBtn/QuantityBtn";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../redux/slides/cartSlide";
import RecommendationCarouselComponent from "../../../components/RecommendationCarouselComponent/RecommendationCarouselComponent";
import { getProductsByCategory } from "../../../services/productServices";

const ViewProductDetailPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const { state: productData } = useLocation();
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  const [product, setProduct] = useState(
    productData || {
      productName: "",
      productPrice: "",
      productSize: "",
      productCategory: "",
      productImage: null,
      productDescription: "",
    }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [imagePreview, setImagePreview] = useState(
    product.productImage || null
  );

  const [relatedProducts, setRelatedProducts] = useState([]);

  //Lay danh sach Category
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/category/get-all-category",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        if (Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          console.error("Categories data is not in expected format");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Lấy category name dựa trên product.productCategory
  const getCategoryName = () => {
    if (Array.isArray(categories) && categories.length > 0) {
      const category = categories.find(cat => cat._id === product.productCategory);
      return category ? category.categoryName : "Không xác định";
    }
    return "Đang tải...";
  };

  // Lấy sản phẩm cùng category
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        if (!product.productCategory || !product.productId) {
          return;
        }

        const queryParams = new URLSearchParams({
          page: 0,
          limit: 8,
        }).toString();

        const url = `http://localhost:3001/api/product/get-product-by-category/${product.productCategory}?${queryParams}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        if (Array.isArray(data.data)) {
          const filteredProducts = data.data.filter(
            (p) => p._id !== product.productId
          );
          setRelatedProducts(filteredProducts);
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setRelatedProducts([]);
      }
    };

    if (product.productCategory && product.productId) {
      fetchRelatedProducts();
    }
  }, [product]);

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  // Xử lý thay đổi size
  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = () => {
    const { productName, productPrice, productImage, productId } = product;

    // Dispatch action để thêm vào giỏ hàng
    dispatch(
      addToCart({
        id: productId,
        img: productImage,
        title: productName,
        price: productPrice,
        quantity: quantity
      })
    );

    // Hiển thị thông báo thêm thành công
    setAddedToCart(true);

    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
      setAddedToCart(false);
    }, 3000);
  };

  // Hàm quay lại trang sản phẩm
  const handleBackToProducts = () => {
    navigate("/products", { state: { categoryIds: product.productCategory } });
  };

  // Kiểm tra nếu không có mô tả sản phẩm
  const hasDescription = product.productDescription && product.productDescription.trim() !== "";

  return (
    <div className="product-detail-page-wrapper">
      <div className="product-detail-container">
        {/* Breadcrumb */}
        <div className="product-breadcrumb">
          <span onClick={() => navigate("/")}>Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span onClick={() => navigate("/products")}>Sản phẩm</span>
          <span className="breadcrumb-separator">/</span>
          <span onClick={handleBackToProducts}>{getCategoryName()}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="current-page">{product.productName}</span>
        </div>

        {/* Product detail section */}
        <div className="product-detail-section">
          {/* Product image */}
          <div className="product-detail-image-container">
            <div className="product-main-image">
              <img src={product.productImage} alt={product.productName} />
            </div>
          </div>

          {/* Product info */}
          <div className="product-detail-info">
            <h1 className="product-detail-title">{product.productName}</h1>

            <div className="product-detail-price">
              {`${product.productPrice?.toLocaleString("en-US") || 0} VND`}
            </div>

            <div className="product-detail-category">
              <span className="detail-label">Danh mục:</span>
              <span className="detail-value">{getCategoryName()}</span>
            </div>

            <div className="product-detail-size">
              <span className="detail-label">Kích thước:</span>
              <div className="size-options">
                <SizeComponent>{product.productSize}</SizeComponent>
              </div>
            </div>

            <div className="product-detail-quantity">
              <span className="detail-label">Số lượng:</span>
              <div className="quantity-selector">
                <button
                  className="quantity-btn minus"
                  onClick={() => quantity > 1 && handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-btn plus"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-detail-actions">
              <ButtonComponent
                className="add-to-cart-btn"
                onClick={handleAddToCart}
              >
                <i className="fas fa-shopping-cart"></i> Thêm vào giỏ hàng
              </ButtonComponent>

              <ButtonComponent
                className="back-btn"
                onClick={handleBackToProducts}
              >
                <i className="fas fa-arrow-left"></i> Quay lại
              </ButtonComponent>
            </div>

            {addedToCart && (
              <div className="cart-success-message">
                <i className="fas fa-check-circle"></i> Sản phẩm đã được thêm vào giỏ hàng!
              </div>
            )}
          </div>
        </div>

        {/* Product description - Only show if there's a description */}
        {hasDescription && (
          <div className="product-detail-description-section">
            <div className="description-header">
              <h3 className="description-title">Mô tả sản phẩm</h3>
            </div>
            <div className="description-content">
              {product.productDescription}
            </div>
          </div>
        )}

        {/* Related products - Only show if there are related products */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-products-title">Sản phẩm liên quan</h2>
            <RecommendationCarouselComponent products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProductDetailPage;
