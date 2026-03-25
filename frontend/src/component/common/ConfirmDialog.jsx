import React from 'react';
import '../../style/adminPage.css';

const ConfirmDialog = ({show, title, message, onConfirm, onCancel}) => {
  if (!show) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title || 'Xác nhận hành động'}</h3>
        <p>{message || 'Bạn có chắc chắn muốn tiếp tục?'}</p>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>Hủy</button>
          <button className="btn-confirm" onClick={onConfirm}>Xác nhận</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
