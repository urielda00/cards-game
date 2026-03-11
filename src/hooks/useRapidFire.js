import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useRapidFire = () => {
	const [lists, setLists] = useState([]);
	const [selectedListIds, setSelectedListIds] = useState([]);
	const [gameState, setGameState] = useState('setup');
	const [allWords, setAllWords] = useState([]);
	const [currentQuestion, setCurrentQuestion] = useState(null);
	const [score, setScore] = useState(0);
	const [timeLeft, setTimeLeft] = useState(60);
	const [feedback, setFeedback] = useState(null);
	const [isLimitedMode, setIsLimitedMode] = useState(false); // מצב הגבלת ניסיונות
	const [lives, setLives] = useState(3); // מספר פסילות התחלתי

	useEffect(() => {
		const fetchLists = async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lists`);
				const data = await res.json();
				setLists(data);
			} catch (e) {
				toast.error('Error loading lists');
			}
		};
		fetchLists();
	}, []);

	const generateQuestion = useCallback((pool) => {
		if (pool.length < 4) return;
		const correct = pool[Math.floor(Math.random() * pool.length)];
		const wrongs = pool
			.filter((w) => w.id !== correct.id)
			.sort(() => 0.5 - Math.random())
			.slice(0, 3);

		const options = [correct, ...wrongs].sort(() => 0.5 - Math.random());
		setCurrentQuestion({ word: correct, options });
	}, []);

	const startGame = async () => {
		try {
			const promises = selectedListIds.map((id) =>
				fetch(`${import.meta.env.VITE_API_URL}/api/lists/${id}/words`).then((res) => res.json()),
			);
			const results = await Promise.all(promises);
			const pool = results.flat();

			if (pool.length < 4) {
				toast.error('Need at least 4 words!');
				return;
			}

			setAllWords(pool);
			setScore(0);
			setTimeLeft(60);
			setLives(3); // איפוס פסילות בתחילת משחק
			setGameState('playing');
			generateQuestion(pool);
		} catch (e) {
			toast.error('Error starting game');
		}
	};

	const handleAnswer = (optionId) => {
		if (feedback) return;

		if (optionId === currentQuestion.word.id) {
			setScore((s) => s + 10);
			setFeedback('correct');
		} else {
			setFeedback('incorrect');
			if (isLimitedMode) {
				const newLives = lives - 1;
				setLives(newLives);
				if (newLives <= 0) {
					// אם נגמרו הפסילות, נסיים את המשחק אחרי האנימציה
					setTimeout(() => {
						setGameState('finished');
						setFeedback(null);
					}, 500);
					return;
				}
			}
		}

		setTimeout(() => {
			setFeedback(null);
			generateQuestion(allWords);
		}, 500);
	};

	const toggleList = (id) => {
		setSelectedListIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	useEffect(() => {
		let timer;
		if (gameState === 'playing' && timeLeft > 0) {
			timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
		} else if (timeLeft === 0) {
			setGameState('finished');
		}
		return () => clearInterval(timer);
	}, [gameState, timeLeft]);

	return {
		lists,
		selectedListIds,
		gameState,
		currentQuestion,
		score,
		timeLeft,
		feedback,
		isLimitedMode,
		lives,
		setIsLimitedMode,
		setGameState,
		toggleList,
		startGame,
		handleAnswer,
	};
};