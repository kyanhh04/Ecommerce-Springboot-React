import { useEffect } from 'react';

const useDocumentTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} - TechNova` : 'TechNova - Cửa Hàng Công Nghệ';
    
    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};

export default useDocumentTitle;
