import React from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import "../../style/privacy.css";

const Privacy = () => {
  useDocumentTitle("Chính Sách Bảo Mật");
  return (
      <div className="pri-wrapper">
    <div className="privacy-container">
      <h1>Chính sách bảo mật</h1>

      <div className="privacy-block">
        <h2>1. Mục đích thu thập thông tin</h2>
        <p>
          Chúng tôi thu thập thông tin cá nhân của khách hàng nhằm mục đích
          xử lý đơn hàng, hỗ trợ giao hàng, chăm sóc khách hàng và cải thiện
          chất lượng dịch vụ.
        </p>
      </div>

      <div className="privacy-block">
        <h2>2. Thông tin được thu thập</h2>
        <p>
          Các thông tin có thể được thu thập bao gồm: họ tên, số điện thoại,
          địa chỉ email, địa chỉ giao hàng và thông tin thanh toán.
        </p>
      </div>

      <div className="privacy-block">
        <h2>3. Phạm vi sử dụng thông tin</h2>
        <p>
          Thông tin cá nhân của khách hàng chỉ được sử dụng trong nội bộ
          công ty và cho các mục đích liên quan đến việc cung cấp sản phẩm,
          dịch vụ. Chúng tôi không chia sẻ thông tin cho bên thứ ba nếu
          không có sự đồng ý của khách hàng, trừ khi có yêu cầu từ cơ quan
          pháp luật.
        </p>
      </div>

      <div className="privacy-block">
        <h2>4. Thời gian lưu trữ thông tin</h2>
        <p>
          Thông tin cá nhân sẽ được lưu trữ trong suốt thời gian khách hàng
          sử dụng dịch vụ hoặc cho đến khi có yêu cầu xóa thông tin.
        </p>
      </div>

      <div className="privacy-block">
        <h2>5. Bảo mật thông tin</h2>
        <p>
          Chúng tôi cam kết bảo mật thông tin khách hàng bằng các biện pháp
          kỹ thuật phù hợp nhằm ngăn chặn truy cập trái phép, mất mát hoặc
          tiết lộ thông tin.
        </p>
      </div>

      <div className="privacy-block">
        <h2>6. Quyền của khách hàng</h2>
        <p>
          Khách hàng có quyền yêu cầu kiểm tra, cập nhật hoặc xóa thông tin
          cá nhân của mình bằng cách liên hệ với chúng tôi.
        </p>
      </div>

      <div className="privacy-block">
        <h2>7. Thay đổi chính sách</h2>
        <p>
          Chính sách bảo mật có thể được cập nhật theo thời gian.
          Mọi thay đổi sẽ được đăng tải trên website.
        </p>
      </div>
    </div>
    </div>
  );
};

export default Privacy;