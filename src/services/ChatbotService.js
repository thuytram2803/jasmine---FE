import axios from "axios";

/**
 * Process a user query and get a response from the chatbot
 * @param {string} query - The user's query text
 * @param {string} userId - Optional user ID for personalized responses
 * @returns {Promise} - The response from the chatbot API
 */
export const processQuery = async (query, userId = null) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/chatbot/process-query`,
      { query, userId },
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
        message: error.response.data?.message || "Đã xảy ra lỗi khi xử lý tin nhắn.",
      };
    } else {
      throw { message: "Không thể kết nối đến máy chủ." };
    }
  }
};

/**
 * Get details of a specific book
 * @param {string} productId - The product/book ID
 * @returns {Promise} - The book details
 */
export const getBookDetails = async (productId) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/chatbot/book-details/${productId}`,
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
        message: error.response.data?.message || "Đã xảy ra lỗi khi lấy thông tin sách.",
      };
    } else {
      throw { message: "Không thể kết nối đến máy chủ." };
    }
  }
};

/**
 * Process query using Google Gemini API
 * @param {string} query - The user's query text
 * @returns {Promise} - The response from Google Gemini API
 */
export const processGoogleAloudQuery = async (query) => {
  try {
    const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

    // Using Gemini 1.5 Flash model
    // 1
    const MODEL = 'gemini-1.5-flash-002';
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

    

    // Prepare the prompt with instructions for the AI assistant
    // 2
    const prompt = `
      Bạn là trợ lý AI "Jasmine" của hiệu sách trực tuyến BookStore. Bạn có các chức năng sau:

      1. Giúp khách hàng tìm sách:
         - Khi khách hỏi về một cuốn sách, tên tác giả, hoặc thể loại, hãy cung cấp thông tin và gợi ý truy cập đường dẫn:
         - Đường dẫn trang sản phẩm: http://localhost:3000/products ( chỉ cung cấp 1 lần vào cuối đoạn chat nếu cần)
         - Nếu khách hỏi về sách cụ thể, hãy gợi ý "Bạn có thể xem chi tiết sách tại [đường dẫn]"

      2. Gợi ý sách tương tự:
         - Dựa trên thể loại, tác giả hoặc chủ đề mà khách hàng quan tâm
         - Giới thiệu 2-3 sách phù hợp với sở thích của khách hàng
         - Luôn gợi ý khách hàng truy cập trang sản phẩm để xem nhiều sách hơn

      3. Cung cấp thông tin về sách:
         - Nếu được hỏi về một cuốn sách cụ thể, cung cấp thông tin ngắn gọn về nội dung, tác giả, giá
         - Gợi ý đường dẫn chi tiết sản phẩm để khách hàng xem đánh giá và thông tin đầy đủ

      4. Thông tin về website BookStore Jasmine:
         - Địa chỉ: 123 Đường Sách, Quận 1, TP.HCM
         - Email: contact@jasminebooks.com
         - Hotline: 1900-6868
         - Giờ làm việc: 8:00 - 21:00 hàng ngày
         - Website: jasminebooks.com
         - Mạng xã hội: Facebook/Instagram: @JasmineBooks

      5. Chính sách mua hàng và vận chuyển:
         - Giao hàng miễn phí cho đơn từ 200.000 VNĐ
         - Đổi trả trong vòng 7 ngày nếu sách lỗi
         - Nhiều phương thức thanh toán: Thẻ tín dụng, chuyển khoản, COD
         - Thời gian giao hàng: 3-5 ngày trong nội thành, 5-7 ngày cho tỉnh thành khác

      6. các thể loại sản phẩm hiện có trong trang /products:
        - Văn học
        - Kinh tế
        - giáo dục
        - lịch sử
        - tiểu thuyết

      7. Thông tin thêm về cửa hàng:
       - địa chỉ: 6 Lê Văn Miến, Thảo Điền, Thủ Đức, Hồ Chí Minh
       -hotline: 0999.888.777
       -email: contact@bookstore.vn
         - BookStore Jasmine chuyên cung cấp sách trong và ngoài nước
         - Hơn 10.000 đầu sách thuộc nhiều thể loại: Văn học, Kinh tế, Tâm lý, Kỹ năng sống...
         - Không gian đọc sách thoải mái tại cửa hàng với khu cà phê sách
         - Tổ chức các buổi giao lưu tác giả và ra mắt sách hàng tháng

      8.một số sản phẩm của cửa hàng:
       - thể loại kinh tế:
           + tên Bất động sản: giá 120000vnđ
           + NỀN KINH TẾ VẬN HÀNH : 170000vnđ
           +LƯỢC SỬ KINH TẾ HỌC: 70000vnđ
           +KẾ TOÁN TÀI CHÍNH: 40000vnđ
       - thể loại văn học:
           +Chí Phèo: 80000
           + Dế mèn phiêu lưu ký: 120000
           +TẮT ĐÈN: 80000
           +NHỮNG NGƯỜI KHỐN KHỔ: 80000
           +Số đỏ: 120000
       - thể loại lịch sử:
          +ĐẠI VIỆT SỬ KÝ TOÀN THƯ 150000
          +LỊCH SỬ THẾ GIỚI: 80000
          +PYOTR - ĐẠI ĐẾ: 160000
          +LỊCH SỬ ĐẢNG CỘNG SẢN VN:85000
       - thể loại tiểu thuyết:
          +CHIẾC XE SẮT: 70000vnd
       - thể loại giáo dục:
         +Giáo dục thể chất: 770000vnd
         +MĨ THUẬT: 55000vnd
         +LỊCH SỬ và ĐỊA LÍ: 60000
         +TRIẾT HỌC: 130000
    9. nếu các thông khác về sách chưa được tôi cung cấp, bạn có thể search theo công nghệ AI của bạn


      Khi trả lời khách hàng:
      - Luôn trả lời bằng tiếng Việt thân thiện, ngắn gọn và đầy đủ thông tin
      - Khi khách hỏi về sách, luôn gợi ý đường dẫn đến trang sản phẩm hoặc chi tiết sản phẩm
      - Nếu không biết thông tin về một cuốn sách cụ thể, gợi ý khách hàng tìm kiếm trên trang sản phẩm của website
      - Nếu khách hỏi về chủ đề không liên quan đến hiệu sách, vẫn trả lời thân thiện và hữu ích

    10. có thể chèn thêm các icon để tin nhắn được sinh động hơn

    11. Nếu người dùng hỏi về các thông tin của sách mà bạn chưa được train trước đó thì có thể search để lấy thông tin từ google hoặc từ thông tin của bạn để trả lời rõ thông tin về sách đó.

    12. Các sách dang bán chạy nhất của jasmine 
        - Lược sử kinh tế học
        - Những người khốn khổ
        - Triết học
        Chỉ dẫn link đến cửa hàng một lần tại cuối đoạn chat
    13. Nếu bạn không có câu trả lời được câu hỏi (kể cả search rồi) thì hiển thị vui lòng liên hệ thêm chứ đừng chat hỏi ngược lại người dùng
      Câu hỏi của khách hàng: ${query}
    14. Nếu khách muốn biết thông tin cụ thể về một cuốn sách nào đó thì bạn cứ trả lời theo những gì bạn search và nếu cuốn sách mà khách hỏi hiện chưa có trong cửa hàng thì thông báo cho khách "Rất tiếc, cuốn sách mà bạn đang tìm kiếm hiện tại chưa có trong cửa hàng. Bạn có thể tham khảo các sách khác tương tự trong cửa hàng nhé". Và dẫn link đến trang sản phẩm của cửa hàng để khách có thể xem thêm các sách khác.
    `;    

    //3
    const apiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    };
 
   //4
    const response = await axios.post(
      API_URL,
      apiRequest,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the response text from the Gemini API response
    //5
    let responseText = '';
    if (response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0]) {
      responseText = response.data.candidates[0].content.parts[0].text;    
    } else {     
      throw new Error('Không tìm thấy nội dung phản hồi từ API');
    }

    return {
      status: "OK",
      message: responseText,
      data: null
    };
  } catch (error) {
    console.error("Error in Google Gemini API call:", error);

    // Detailed error logging
    if (error.response) {
      console.error("API response error status:", error.response.status);
      console.error("API response error data:", JSON.stringify(error.response.data, null, 2));

      // Check for specific error types
      if (error.response.status === 400) {
        console.error("Bad request - Check API key and request format");
      } else if (error.response.status === 401) {
        console.error("Unauthorized - Check API key validity");
      } else if (error.response.status === 404) {
        console.error("Not found - The specified model may not exist or is inaccessible");
      }
    } else if (error.request) {
      console.error("No response received from API");
    }

    throw {
      message: "Đã xảy ra lỗi khi kết nối đến Google Gemini API. Vui lòng kiểm tra kết nối mạng và thử lại sau."
    };
  }
};