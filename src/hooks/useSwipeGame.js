import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { GLOBAL_DISTRACTORS } from '../constants/distractors';

export const useSwipeGame = () => {
    const [lists, setLists] = useState([]);
    const [selectedListIds, setSelectedListIds] = useState([]);
    const [gameState, setGameState] = useState('setup');
    const [allWords, setAllWords] = useState([]);
    const [currentPair, setCurrentPair] = useState(null);
    const [lastWordId, setLastWordId] = useState(null); // Memory for the last word
    const [score, setScore] = useState(0);
    
    // Game Settings
    const [timerMode, setTimerMode] = useState('up'); 
    const [isLimitedLives, setIsLimitedLives] = useState(false);
    const [useGlobalDistractors, setUseGlobalDistractors] = useState(true); // New Toggle
    const [timer, setTimer] = useState(0);
    const [lives, setLives] = useState(3);
    const [feedback, setFeedback] = useState(null);

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

    const generatePair = useCallback((pool, prevId) => {
        if (!pool || pool.length === 0) return;

        // Filter out the last word to prevent immediate repetition
        const availableWords = pool.length > 1 
            ? pool.filter(w => w.id !== prevId) 
            : pool;

        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        setLastWordId(word.id); // Update memory

        const isCorrect = Math.random() > 0.5;
        let displayTranslation;

        if (isCorrect) {
            displayTranslation = word.back;
        } else {
            // Logic for distractors based on the toggle
            const shouldShowGlobal = useGlobalDistractors && Math.random() > 0.3;
            
            if (shouldShowGlobal && GLOBAL_DISTRACTORS.length > 0) {
                displayTranslation = GLOBAL_DISTRACTORS[Math.floor(Math.random() * GLOBAL_DISTRACTORS.length)];
            } else {
                const otherWords = pool.filter(w => w.id !== word.id);
                displayTranslation = otherWords.length > 0 
                    ? otherWords[Math.floor(Math.random() * otherWords.length)].back 
                    : "No Translation Available";
            }
        }

        setCurrentPair({ word, displayTranslation, isCorrect });
    }, [useGlobalDistractors]);

    const startGame = async () => {
        if (selectedListIds.length === 0) {
            toast.error("חובה לבחור לפחות רשימה אחת!");
            return;
        }

        try {
            const promises = selectedListIds.map(id => 
                fetch(`${import.meta.env.VITE_API_URL}/api/lists/${id}/words`).then(res => res.json())
            );
            const results = await Promise.all(promises);
            const pool = results.flat();

            if (pool.length < 2) {
                toast.error("צריך לפחות 2 מילים ברשימה");
                return;
            }

            setAllWords(pool);
            setScore(0);
            setLives(3);
            setTimer(timerMode === 'up' ? 0 : 60);
            setFeedback(null);
            setLastWordId(null);
            
            generatePair(pool, null);
            setGameState('playing');
        } catch (e) {
            toast.error("Error starting game");
        }
    };

    const handleAnswer = (userChoice) => {
        if (feedback || !currentPair) return;

        if (userChoice === currentPair.isCorrect) {
            setScore(s => s + 10);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
            if (isLimitedLives) {
                setLives(l => {
                    const newLives = l - 1;
                    if (newLives <= 0) setTimeout(() => setGameState('lost'), 500);
                    return newLives;
                });
            }
        }

        setTimeout(() => {
            setFeedback(null);
            generatePair(allWords, lastWordId); // Pass the current ID to avoid it in the next round
        }, 500);
    };

    useEffect(() => {
        let interval;
        if (gameState === 'playing') {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (timerMode === 'up') return prev + 1;
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

    return { 
        lists, selectedListIds, setSelectedListIds, gameState, setGameState, 
        currentPair, score, timer, timerMode, setTimerMode, isLimitedLives, 
        setIsLimitedLives, useGlobalDistractors, setUseGlobalDistractors, 
        lives, feedback, startGame, handleAnswer 
    };
};