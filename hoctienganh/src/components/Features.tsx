import React from 'react';
import '../styles/Features.css';

const Features: React.FC = () => {
  const features = [
    {
      id: 1,
      title: 'Học từ vựng',
      description: 'Hơn 5000+ từ vựng được phân loại theo chủ đề, cấp độ giúp bạn học hiệu quả.',
      icon: '📚'
    },
    {
      id: 2,
      title: 'Luyện ngữ pháp',
      description: 'Các bài học ngữ pháp được thiết kế đơn giản, dễ hiểu với nhiều ví dụ thực tế.',
      icon: '📝'
    },
    {
      id: 3,
      title: 'Bài tập tương tác',
      description: 'Hàng nghìn bài tập tương tác giúp bạn thực hành và củng cố kiến thức.',
      icon: '✏️'
    },
    {
      id: 4,
      title: 'Theo dõi tiến độ',
      description: 'Hệ thống theo dõi tiến độ thông minh giúp bạn nắm rõ quá trình học tập.',
      icon: '📊'
    }
  ];

  return (
    <section className="features">
      <div className="container">
        <h2 className="section-title">Tính năng nổi bật</h2>
        <div className="features-grid">
          {features.map(feature => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 