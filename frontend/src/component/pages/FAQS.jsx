import React, { useState } from "react";
import "../../style/faqs.css";

const Faqs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Laptop có phải hàng chính hãng không?",
      answer:
        "Tất cả sản phẩm tại Laptop Mart đều là hàng chính hãng 100%, có đầy đủ hóa đơn và bảo hành từ nhà sản xuất.",
    },
    {
      question: "Thời gian giao hàng bao lâu?",
      answer:
        "Thời gian giao hàng từ 1-3 ngày tại nội thành và 3-5 ngày đối với các tỉnh thành khác.",
    },
    {
      question: "Chính sách đổi trả như thế nào?",
      answer:
        "Khách hàng có thể đổi trả trong vòng 7 ngày nếu sản phẩm lỗi do nhà sản xuất.",
    },
    {
      question: "Có hỗ trợ trả góp không?",
      answer:
        "Chúng tôi hỗ trợ trả góp qua thẻ tín dụng và các công ty tài chính với lãi suất ưu đãi.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h1 className="faq-title">Câu hỏi thường gặp (FAQs)</h1>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${activeIndex === index ? "active" : ""}`}
          >
            <div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span>{activeIndex === index ? "-" : "+"}</span>
            </div>

            {activeIndex === index && (
              <div className="faq-answer">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faqs;