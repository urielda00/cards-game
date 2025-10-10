import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCards } from '../context/CardContext';
import toast from 'react-hot-toast';

const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};

export const useGameDeck = (filteredCards) => {
	const { dispatch, listId } = useCards();
	const [sessionDeck, setSessionDeck] = useState([]);
	const [sessionIndex, setSessionIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [exitDirection, setExitDirection] = useState(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [isSessionComplete, setIsSessionComplete] = useState(false);

	const cardIds = useMemo(
		() =>
			filteredCards
				.map((c) => c.id)
				.sort()
				.join(','),
		[filteredCards]
	);

	const startNewSession = useCallback(() => {
		if (filteredCards && filteredCards.length > 0) {
			const weightedDeck = [];
			const weights = [5, 4, 3, 2, 1];
			filteredCards.forEach((card) => {
				const weight = weights[card.bucket - 1] || 1;
				for (let i = 0; i < weight; i++) {
					weightedDeck.push(card);
				}
			});
			setSessionDeck(shuffleArray(weightedDeck));
			setSessionIndex(0);
			setIsSessionComplete(false);
		} else {
			setSessionDeck([]);
		}
	}, [cardIds]);

	useEffect(() => {
		startNewSession();
	}, [startNewSession]);

	const handleSessionComplete = useCallback(async () => {
		setIsSessionComplete(true);
		try {
			await fetch(`${import.meta.env.VITE_API_URL}/api/lists/${listId}/complete`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ completed: true }),
			});
		} catch (error) {
			console.error('Failed to mark list as complete:', error);
		}
	}, [listId]);

	const currentCardFromSession = useMemo(() => {
		if (isSessionComplete || !sessionDeck || !sessionDeck.length || sessionIndex >= sessionDeck.length) return null;
		return sessionDeck[sessionIndex];
	}, [sessionDeck, sessionIndex, isSessionComplete]);

	const currentCard = useMemo(() => {
		if (!currentCardFromSession) return null;
		return filteredCards.find((c) => c.id === currentCardFromSession.id);
	}, [currentCardFromSession, filteredCards]);

	const updateCard = async (cardId, updates) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/words/${cardId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates),
			});
			const updatedCard = await response.json();
			dispatch({ type: 'UPDATE_CARD', payload: updatedCard });
			return updatedCard;
		} catch (error) {
			console.error('Failed to update card:', error);
		}
	};

	const handleAnswer = useCallback(
		(isSuccess) => {
			if (!currentCard) return;

			const currentBucket = currentCard.bucket;
			if (isSuccess) {
				updateCard(currentCard.id, { bucket: Math.min(currentBucket + 1, 5) });
				setExitDirection('right');
			} else {
				updateCard(currentCard.id, { bucket: Math.max(currentBucket - 1, 1) });
				setExitDirection('left');
			}
			setTimeout(() => {
				if (sessionIndex >= sessionDeck.length - 1) {
					handleSessionComplete();
				} else {
					setSessionIndex((prev) => prev + 1);
					setExitDirection(null);
					setIsFlipped(false);
				}
			}, 300);
		},
		[currentCard, sessionDeck, sessionIndex, handleSessionComplete]
	);

	const toggleStarred = async () => {
		const updatedCard = await updateCard(currentCard.id, { starred: !currentCard.starred });
		if (updatedCard.starred) {
			toast.success('נוספה למועדפים! ⭐');
		} else {
			toast('הוסרה מהמועדפים.');
		}
	};

	const handleDelete = async () => {
		try {
			await fetch(`${import.meta.env.VITE_API_URL}/api/words/${currentCard.id}`, { method: 'DELETE' });
			toast.success(`"${currentCard.front}" נמחקה.`);
			dispatch({ type: 'DELETE_CARD', payload: { id: currentCard.id } });
			setIsConfirmModalOpen(false);
		} catch (error) {
			toast.error('מחיקת הכרטיסייה נכשלה.');
			console.error('Failed to delete card:', error);
		}
	};

	const handleKeyDown = useCallback(
		(event) => {
			if (!currentCard || isConfirmModalOpen) return;
			if (event.key === ' ') {
				event.preventDefault();
				setIsFlipped((prev) => !prev);
			}
			if (isFlipped) {
				if (event.key === 'ArrowRight') {
					handleAnswer(false);
				}
				if (event.key === 'ArrowLeft') {
					handleAnswer(true);
				}
			}
		},
		[isFlipped, handleAnswer, currentCard, isConfirmModalOpen, setIsFlipped]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown]);

	return {
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
	};
};
