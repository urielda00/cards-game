import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Flashcard from './Flashcard';
import ConfirmModal from './ConfirmModal';
import { useGameDeck } from '../hooks/useGameDeck';

const GameDeckWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding-top: 2rem;
  box-sizing: border-box;
  overflow-x: hidden;
`;

const CardAnimationWrapper = styled.div`
  transition: transform 0.3s ease-in-out, opacity 0.3s;
  
  &.exit-left {
    transform: translateX(150%) rotate(15deg);
    opacity: 0;
  }
  &.exit-right {
    transform: translateX(-150%) rotate(-15deg);
    opacity: 0;
  }
`;

const FlashcardWithControls = styled.div`
  position: relative;
  margin-bottom: 2rem;
`;

const CardActionsOverlay = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  &:hover {
    background: white;
    transform: scale(1.1);
  }
  
  &.starred {
    color: #ffc107;
  }
`;

const BucketDisplay = styled.div`
  position: absolute;
  bottom: 15px;
  left: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-family: monospace;
`;

const KnowledgeControls = styled.div`
  display: flex;
  width: 100%;
  max-width: 350px;
  gap: 1rem;
`;

const KnowledgeButton = styled.button`
  flex-grow: 1;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  background-color: ${props => props.$failure ? '#dc3545' : '#28a745'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  }
`;

const NavigationControls = styled.div`
  margin-top: 1.5rem;
  font-size: 1rem;
  font-family: monospace;
  color: #777;
`;

const SessionCompleteWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    min-height: 50vh;
`;

const SessionCompleteTitle = styled.h2`
    font-size: 2.5rem;
    margin-bottom: 1rem;
`;

const SessionCompleteText = styled.p`
    font-size: 1.2rem;
    color: #555;
    margin-bottom: 2rem;
`;

const StartNewSessionButton = styled(Link)`
    padding: 1rem 2rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    text-decoration: none;

    &:hover {
        background-color: #0056b3;
    }
`;

const NoCardsMessage = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    font-size: 1.5rem;
    color: #555;
    text-align: center;

    h2 {
      font-weight: 500;
    }
`;

function GameDeck({ filteredCards }) {
    const {
        sessionDeck,
        sessionIndex,
        isFlipped,
        setIsFlipped,
        exitDirection,
        isConfirmModalOpen,
        setIsConfirmModalOpen,
        isSessionComplete,
        displayCard,
        handleAnswer,
        toggleStarred,
        handleDelete,
        startNewSession
    } = useGameDeck(filteredCards);

    if (isSessionComplete) {
        return (
            <SessionCompleteWrapper>
                <SessionCompleteTitle>🎉 כל הכבוד! 🎉</SessionCompleteTitle>
                <SessionCompleteText>עברת על {sessionDeck.length} כרטיסיות בסשן זה.</SessionCompleteText>
                <StartNewSessionButton to="/lists" onClick={startNewSession}>
                    חזרה לרשימות
                </StartNewSessionButton>
            </SessionCompleteWrapper>
        );
    }

    if (!displayCard) {
        return <NoCardsMessage><h2>אין כרטיסיות ברשימה זו. הוסף כמה כדי להתחיל!</h2></NoCardsMessage>;
    }

    return (
        <>
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="למחוק כרטיסייה?"
            >
                <p>האם למחוק את הכרטיסייה: <br /><strong>"{displayCard?.front}"</strong>?</p>
            </ConfirmModal>
            <GameDeckWrapper>
                <CardAnimationWrapper className={exitDirection ? `exit-${exitDirection}` : ''}>
                    <FlashcardWithControls>
                        <Flashcard card={displayCard} isFlipped={isFlipped} setIsFlipped={setIsFlipped} />
                        <CardActionsOverlay>
                            <ActionButton onClick={toggleStarred} className={displayCard.starred ? 'starred' : ''}>★</ActionButton>
                            <ActionButton onClick={() => setIsConfirmModalOpen(true)}>🗑️</ActionButton>
                        </CardActionsOverlay>
                        <BucketDisplay>רמה: {displayCard.bucket}</BucketDisplay>
                    </FlashcardWithControls>
                </CardAnimationWrapper>
                {isFlipped && (
                    <KnowledgeControls>
                        <KnowledgeButton $failure onClick={() => handleAnswer(false)}>לא ידעתי</KnowledgeButton>
                        <KnowledgeButton onClick={() => handleAnswer(true)}>ידעתי!</KnowledgeButton>
                    </KnowledgeControls>
                )}
                <NavigationControls>
                    <span>כרטיסייה {sessionIndex + 1} מתוך {sessionDeck.length}</span>
                </NavigationControls>
            </GameDeckWrapper>
        </>
    );
}

export default GameDeck;