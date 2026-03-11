import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useGridMatch = () => {
    const [lists, setLists] = useState([]);
    const [selectedListIds, setSelectedListIds] = useState([]);
    const [gameState, setGameState] = useState('setup'); // setup, playing, finished, lost
    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [matches, setMatches] = useState([]);
    
    // Game Mode States
    const [timerMode, setTimerMode] = useState('up'); // 'up' or 'down'
    const [isLimitedLives, setIsLimitedLives] = useState(false);
    const [timer, setTimer] = useState(0);
    const [lives, setLives] = useState(3);
    
    // Visual Feedback State
    const [feedback, setFeedback] = useState({ type: null, ids: [] });

    // Fetch lists on component mount
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lists`);
                const data = await res.json();
                setLists(data);
            } catch (e) {
                toast.error("Error loading lists");
            }
        };
        fetchLists();
    }, []);

    const startGame = async () => {
        if (selectedListIds.length === 0) {
            toast.error("Please select at least one list!");
            return;
        }

        try {
            const promises = selectedListIds.map(id => 
                fetch(`${import.meta.env.VITE_API_URL}/api/lists/${id}/words`).then(res => res.json())
            );
            const results = await Promise.all(promises);
            const pool = results.flat().sort(() => 0.5 - Math.random()).slice(0, 6);

            if (pool.length < 3) {
                toast.error("Need at least 3 words to play!");
                return;
            }

            const gameCards = [];
            pool.forEach(word => {
                // Create two separate cards for each word
                gameCards.push({ id: `${word.id}-en`, wordId: word.id, text: word.front, lang: 'en' });
                gameCards.push({ id: `${word.id}-he`, wordId: word.id, text: word.back, lang: 'he' });
            });

            setCards(gameCards.sort(() => 0.5 - Math.random()));
            setMatches([]);
            setLives(3);
            setTimer(timerMode === 'up' ? 0 : 60);
            setGameState('playing');
            setSelectedCard(null);
            setFeedback({ type: null, ids: [] });
        } catch (e) {
            toast.error("Error starting game");
        }
    };

    const handleCardClick = (card) => {
        // Prevent clicking if already matched, already selected, or animation is running
        if (
            matches.includes(card.wordId) || 
            (selectedCard && selectedCard.id === card.id) || 
            feedback.type
        ) return;

        if (!selectedCard) {
            setSelectedCard(card);
        } else {
            // Check for match
            if (selectedCard.wordId === card.wordId && selectedCard.lang !== card.lang) {
                // Correct Match Logic
                setFeedback({ type: 'correct', ids: [selectedCard.id, card.id] });
                
                setTimeout(() => {
                    setMatches(prev => [...prev, card.wordId]);
                    setFeedback({ type: null, ids: [] });
                    setSelectedCard(null);
                }, 600);
            } else {
                // Incorrect Match Logic
                setFeedback({ type: 'incorrect', ids: [selectedCard.id, card.id] });
                
                if (isLimitedLives && selectedCard.lang !== card.lang) {
                    setLives(l => {
                        const newLives = l - 1;
                        if (newLives <= 0) {
                            setTimeout(() => setGameState('lost'), 600);
                        }
                        return newLives;
                    });
                }

                setTimeout(() => {
                    setFeedback({ type: null, ids: [] });
                    setSelectedCard(null);
                }, 600);
            }
        }
    };

    // Timer Interval Logic
    useEffect(() => {
        let interval;
        if (gameState === 'playing') {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (timerMode === 'up') return prev + 1;
                    
                    // Countdown Logic
                    if (prev <= 1) {
                        setGameState('lost');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, timerMode]);

    // Win Condition Observer
    useEffect(() => {
        if (gameState === 'playing' && matches.length === cards.length / 2 && cards.length > 0) {
            setGameState('finished');
        }
    }, [matches, cards, gameState]);

    return { 
        lists, 
        selectedListIds, 
        gameState, 
        cards, 
        selectedCard, 
        matches, 
        timer, 
        timerMode, 
        setTimerMode, 
        isLimitedLives, 
        setIsLimitedLives, 
        lives, 
        feedback,
        setSelectedListIds, 
        setGameState, 
        startGame, 
        handleCardClick 
    };
};