import { createContext, useContext, useReducer, useEffect } from 'react';

const ImageCardContext = createContext();

const imageCardReducer = (state, action) => {
	switch (action.type) {
		case 'SET_CARDS':
			return action.payload;
		// --- ADD THIS CASE ---
		case 'UPDATE_CARD':
			return state.map((card) => (card.id === action.payload.id ? action.payload : card));
		case 'DELETE_CARD':
			return state.filter((card) => card.id !== action.payload.id);
		default:
			return state;
	}
};

export function ImageCardProvider({ children, listId }) {
	const [cards, dispatch] = useReducer(imageCardReducer, []);

	useEffect(() => {
		if (!listId) return;
		const fetchCards = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/api/image-lists/${listId}/cards`);
				const data = await response.json();
				dispatch({ type: 'SET_CARDS', payload: data });
			} catch (error) {
				console.error('Failed to fetch image cards:', error);
				dispatch({ type: 'SET_CARDS', payload: [] });
			}
		};
		fetchCards();
	}, [listId]);

	// Pass listId through the context
	const value = { cards, dispatch, listId };
	return <ImageCardContext.Provider value={value}>{children}</ImageCardContext.Provider>;
}

export function useImageCards() {
	return useContext(ImageCardContext);
}
