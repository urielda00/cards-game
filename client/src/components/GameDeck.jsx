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
	transition:
		transform 0.3s ease-in-out,
		opacity 0.3s;

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
	display: flex;
	/* Ensures the side menu stretches to the same height as the card */
	align-items: stretch; 
	margin-bottom: 2rem;
	flex-direction: row;
	direction: ltr;
`;

const CardContainer = styled.div`
	position: relative;
	/* Removing right radius to merge with the sidebar */
	& > div {
		border-top-right-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
`;

const CardActionsOverlay = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center; /* Centers buttons vertically in the sidebar */
	background: white;
	border: 1px solid #ddd;
	border-left: none;
	/* Matches the card's typical border radius on the outer side only */
	border-radius: 0 12px 12px 0; 
	box-shadow: 4px 0 8px rgba(0, 0, 0, 0.05);
	z-index: 10;
	overflow: hidden;
	width: 50px; /* Controlled width for the sidebar */
`;

const ActionButton = styled.button`
	background: transparent;
	border: none;
	width: 100%;
	height: 60px; /* Fixed height for better touch/click targets */
	font-size: 1.5rem;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background 0.2s ease-in-out;

	&:hover {
		background: #f9f9f9;
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
	width: 320px;
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
	transition:
		transform 0.2s,
		box-shadow 0.2s;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	background-color: ${(props) => (props.$failure ? '#dc3545' : '#28a745')};

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
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
		currentCard,
		handleAnswer,
		toggleStarred,
		handleDelete,
		startNewSession,
		speak,
	} = useGameDeck(filteredCards);

	if (isSessionComplete) {
		return (
			<SessionCompleteWrapper>
				<SessionCompleteTitle>🎉 כל הכבוד! 🎉</SessionCompleteTitle>
				<SessionCompleteText>עברת על {sessionDeck.length} כרטיסיות בסשן זה.</SessionCompleteText>
				<StartNewSessionButton to='/lists' onClick={startNewSession}>
					חזרה לרשימות
				</StartNewSessionButton>
			</SessionCompleteWrapper>
		);
	}

	if (!currentCard) {
		return (
			<NoCardsMessage>
				<h2>אין כרטיסיות ברשימה זו. הוסף כמה כדי להתחיל!</h2>
			</NoCardsMessage>
		);
	}

	return (
		<>
			<ConfirmModal
				isOpen={isConfirmModalOpen}
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={handleDelete}
				title='למחוק כרטיסייה?'
			>
				<p>
					האם למחוק את הכרטיסייה: <br />
					<strong>"{currentCard?.front}"</strong>?
				</p>
			</ConfirmModal>
			<GameDeckWrapper>
				<CardAnimationWrapper className={exitDirection ? `exit-${exitDirection}` : ''}>
					<FlashcardWithControls>
						<CardContainer>
							<Flashcard card={currentCard} isFlipped={isFlipped} setIsFlipped={setIsFlipped} />
							<BucketDisplay>רמה: {currentCard.bucket}</BucketDisplay>
						</CardContainer>

						<CardActionsOverlay>
							<ActionButton onClick={() => speak(currentCard.front)}>🔊</ActionButton>
							<ActionButton
								onClick={toggleStarred}
								className={currentCard.starred ? 'starred' : ''}
							>
								★
							</ActionButton>
							<ActionButton onClick={() => setIsConfirmModalOpen(true)}>🗑️</ActionButton>
						</CardActionsOverlay>
					</FlashcardWithControls>
				</CardAnimationWrapper>
				{isFlipped && (
					<KnowledgeControls>
						<KnowledgeButton $failure onClick={() => handleAnswer(false)}>
							לא ידעתי
						</KnowledgeButton>
						<KnowledgeButton onClick={() => handleAnswer(true)}>ידעתי!</KnowledgeButton>
					</KnowledgeControls>
				)}
				<NavigationControls>
					<span>
						כרטיסייה {sessionIndex + 1} מתוך {sessionDeck.length}
					</span>
				</NavigationControls>
			</GameDeckWrapper>
		</>
	);
}

export default GameDeck;