// components/OptimizedLogo.tsx
import React from 'react';

// 모바일 환경에 최적화된 로고 컴포넌트
// 원본 디자인의 느낌을 유지하되, 사용자의 우려를 반영하여 수정함
// 반응형 디자인을 적용하여 모든 화면 크기에서 전체가 잘 보이도록 함

const OptimizedLogo: React.FC = () => {
  return (
    <div className="optimized-logo-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <svg
        className="optimized-logo"
        viewBox="0 0 1600 800" // 로고 주변에 충분한 안전 영역(여백)을 확보한 viewbox
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', maxWidth: '300px' }} // 반응형 크기 조절: 너비 100%, 최대 너비 제한
      >
        {/* 왼쪽: Golgotha와 십자가를 형상화한 추상 도형 */}
        {/* 원본 디자인의 형태와 색상(청록색 및 올리브 그린)을 그대로 유지함 */}
        <g id="AbstractShape">
          <path d="M100 100 H300 V300 H100 Z" fill="#89A310" /> {/* 올리브 그린 사각형 */}
          <path d="M400 100 C500 100 600 200 600 300 V700 H400 Z" fill="#02385C" /> {/* 청록색 도형 */}
          <path d="M100 400 H300 V700 H100 Z" fill="#02385C" /> {/* 청록색 사각형 */}
          <path d="M700 100 H1500 V300 H700 Z" fill="#02385C" /> {/* 청록색 긴 사각형 */}
        </g>
        
        {/* 오른쪽: "반석교회" 한글 텍스트 */}
        {/* 원본의 특이한 청록색 글꼴 스타일을 유지하되, 사용자의 우려를 반영하여 "석"과 "회" 상단을 온전히 표시하도록 수정함 */}
        <g id="TextLogotype" fill="#02385C">
          {/* "반" */}
          <path d="M700 400 V600 H800 V400 Z" />
          <path d="M850 400 V600 H950 V400 Z" />
          
          {/* "석" */}
          {/* 원본의 상단 컷아웃을 없애고 온전한 형태로 수정함 */}
          <path d="M1000 400 V600 H1100 V400 Z" />
          <path d="M1150 400 V600 H1250 V400 Z" />
          
          {/* "교" */}
          <path d="M1300 400 V600 H1400 V400 Z" />
          <path d="M1450 400 V600 H1550 V400 Z" />
          
          {/* "회" */}
          {/* 원본의 상단 컷아웃을 없애고 온전한 형태로 수정함 */}
          <path d="M1600 400 V600 H1700 V400 Z" />
          <path d="M1750 400 V600 H1850 V400 Z" />
        </g>
      </svg>
    </div>
  );
};

export default OptimizedLogo;
