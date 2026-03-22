import styled from 'styled-components';

const FlashcardScene = styled.div`
  width: 300px;
  height: 200px;
  perspective: 600px;
  cursor: pointer;
`;

const FlashcardContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d; /* THE FIX IS HERE */
  transform: ${props => props.$isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const CardFace = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  color: #333;
`;

const CardFaceFront = styled(CardFace)`
  background-color: #ffffff;
`;

const CardFaceBack = styled(CardFace)`
  background-color: #f8f9fa;
  transform: rotateY(180deg);
`;

const CardImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  border-radius: 5px;
  user-select: none;
`;

function Flashcard({ card, isFlipped, setIsFlipped }) {
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <FlashcardScene onClick={handleFlip}>
      <FlashcardContainer $isFlipped={isFlipped}>
        <CardFaceFront>
          {card.type === 'image' ? (
            <CardImage 
              src={card.front} 
              alt={card.back} 
              loading="lazy"
            />
          ) : (
            card.front
          )}
        </CardFaceFront>
        <CardFaceBack>{card.back}</CardFaceBack>
      </FlashcardContainer>
    </FlashcardScene>
  );
}

export default Flashcard;