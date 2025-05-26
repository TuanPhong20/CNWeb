import React from 'react';
import '../styles/Testimonials.css';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      role: 'Sinh viên',
      content: 'Tôi đã cải thiện kỹ năng tiếng Anh của mình đáng kể sau 3 tháng học tập tại HocTiengAnh. Phương pháp học dễ hiểu và hiệu quả.',
      avatar: '/images/avatar1.svg'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      role: 'Nhân viên văn phòng',
      content: 'HocTiengAnh giúp tôi tự tin giao tiếp với khách hàng nước ngoài. Tôi đặc biệt thích các bài tập tương tác và phát âm.',
      avatar: '/images/avatar2.svg'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      role: 'Giáo viên',
      content: 'Tôi đã sử dụng HocTiengAnh để hỗ trợ giảng dạy cho học sinh của mình. Các bài học được tổ chức rất khoa học và dễ tiếp cận.',
      avatar: '/images/avatar3.svg'
    }
  ];

  return (
    <section className="testimonials">
      <div className="container">
        <h2 className="section-title">Học viên nói gì về chúng tôi</h2>
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-avatar">
                <img src={testimonial.avatar} alt={testimonial.name} />
              </div>
              <h3>{testimonial.name}</h3>
              <span className="role">{testimonial.role}</span>
              <p>"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 