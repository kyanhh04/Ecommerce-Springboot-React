import React from "react";
import "../../style/about.css";

const About = () => {
  return (
    <section className="about-wrapper">

      {/* ===== CONTENT BOX ===== */}
      <div className="about-box">
        <h1 className="about-title">Về LaptopSinhVien</h1>

        <div className="about-content">

          <h2>1. Lịch sử hình thành</h2>
          <p>
            LaptopSinhVien được thành lập với mong muốn mang đến cho người dùng Việt Nam
            những sản phẩm công nghệ chất lượng cao với mức giá hợp lý nhất.
            Khởi nguồn từ một cộng đồng yêu công nghệ, chúng tôi từng bước xây dựng
            thương hiệu dựa trên sự minh bạch, uy tín và dịch vụ hậu mãi tận tâm.
          </p>

          <p>
            Trải qua quá trình phát triển, LaptopSinhVien không ngừng mở rộng hệ thống
            showroom, hoàn thiện quy trình bán hàng và nâng cao chất lượng tư vấn.
            Mỗi sản phẩm đến tay khách hàng đều được kiểm tra kỹ lưỡng, đảm bảo
            hiệu năng ổn định và đáp ứng đúng nhu cầu sử dụng.
          </p>

          <ul>
            <li>Hơn 500 chủ đề thảo luận công nghệ và gần 1.4 triệu lượt xem.</li>
            <li>Đội ngũ tư vấn viên am hiểu chuyên môn, hỗ trợ tận tình.</li>
            <li>Cam kết đặt quyền lợi khách hàng lên hàng đầu.</li>
          </ul>

          <h2>2. Tầm nhìn – Sứ mệnh</h2>
          <p>
            Chúng tôi hướng tới việc trở thành hệ thống bán lẻ laptop và thiết bị công nghệ
            được tin tưởng hàng đầu tại Việt Nam. Với định hướng phát triển bền vững,
            LaptopSinhVien luôn chú trọng vào trải nghiệm khách hàng, chất lượng sản phẩm
            và dịch vụ sau bán hàng.
          </p>

          <p>
            Sứ mệnh của chúng tôi là giúp sinh viên, nhân viên văn phòng và người làm sáng tạo
            tiếp cận được những thiết bị phù hợp nhất với nhu cầu học tập và công việc,
            đồng thời tối ưu chi phí một cách hợp lý.
          </p>

          <h2>3. Sản phẩm & Dịch vụ cung cấp</h2>
          <p>
            LaptopSinhVien cung cấp đa dạng các dòng sản phẩm từ laptop văn phòng,
            doanh nhân cao cấp cho đến laptop đồ họa, gaming hiệu năng cao.
            Bên cạnh đó, chúng tôi còn cung cấp các thiết bị công nghệ khác
            như MacBook, iPhone, iPad và phụ kiện chính hãng.
          </p>

          <ul>
            <li>Laptop doanh nhân: ThinkPad, Dell Latitude, HP EliteBook.</li>
            <li>Laptop đồ họa – gaming cấu hình mạnh, tối ưu hiệu năng.</li>
            <li>MacBook và thiết bị Apple chính hãng.</li>
            <li>Dịch vụ bảo hành, vệ sinh – nâng cấp – cài đặt phần mềm.</li>
          </ul>

          <p>
            Với phương châm “Uy tín tạo nên thương hiệu”, LaptopSinhVien cam kết
            đồng hành cùng khách hàng trong suốt quá trình sử dụng sản phẩm,
            mang đến sự an tâm và hài lòng lâu dài.
          </p>

        </div>
      </div>

      {/* ===== SHOWROOM BOX RIÊNG ===== */}
      <div className="showroom-box">
        <h2 className="showroom-heading">Hệ Thống Showroom</h2>
        <p className="showroom-time">Thời gian mở cửa: 8h30 - 20h (T2-CN)</p>

        <div className="showroom-content">

          <div className="showroom-left">

            <div className="branch-item">
              <div className="branch-number">01</div>
              <div>
                <h3>HÀ ĐÔNG</h3>
                <p>Số 96A Trần Phú, Hà Đông, Hà Nội</p>
                <p>Bán hàng: 093 669 3388</p>
                <p>Kỹ thuật: 0911 992 995</p>
              </div>
            </div>

            <div className="branch-item">
              <div className="branch-number">02</div>
              <div>
                <h3>BÁN HÀNG ONLINE</h3>
                <p>Website: laptopsinhvien.vn</p>
                <p>Hotline: 0988 888 888</p>
                <p>Hỗ trợ toàn quốc</p>
              </div>
            </div>

          </div>

          <div className="showroom-right">
            <iframe
              src="https://www.google.com/maps?q=96A+Trần+Phú+Hà+Đông+Hà+Nội&output=embed"
              loading="lazy"
              title="Google Map"
            ></iframe>
          </div>

        </div>
      </div>

    </section>
  );
};

export default About;