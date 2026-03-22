import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.25);
  animation: ${scaleUp} 0.25s ease-out;
`;

const ModalTitle = styled.h2`
    font-size: 1.5rem;
    color: #333;
    margin: 0 0 1rem 0;
`;

const ModalBody = styled.div`
    margin: 1.5rem 0;
    font-size: 1.1rem;
    color: #555;
    line-height: 1.6;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(ModalButton)`
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const ConfirmButton = styled(ModalButton)`
  background-color: #dc3545;
  color: white;

  &:hover {
    background-color: #c82333;
    transform: translateY(-2px);
  }
`;


function ConfirmModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>
        <ModalBody>
          {children}
        </ModalBody>
        <ModalActions>
          <CancelButton onClick={onClose}>ביטול</CancelButton>
          <ConfirmButton onClick={onConfirm}>אישור</ConfirmButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
}

export default ConfirmModal;