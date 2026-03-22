import { createContext, useContext, useReducer, useEffect } from 'react';

const CardContext = createContext();

const cardReducer = (state, action) => {
	switch (action.type) {
		case 'SET_CARDS':
			return action.payload;
		case 'ADD_CARD':
			return [...state, action.payload];
		case 'UPDATE_CARD':
			return state.map((card) => (card.id === action.payload.id ? action.payload : card));
		case 'DELETE_CARD':
			return state.filter((card) => card.id !== action.payload.id);
		default:
			return state;
	}
};

export function CardProvider({ children, listId }) {
	const [cards, dispatch] = useReducer(cardReducer, []);

	useEffect(() => {
		if (!listId) return;

		const fetchCards = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lists/${listId}/words`);
				const data = await response.json();
				dispatch({ type: 'SET_CARDS', payload: data });
			} catch (error) {
				console.error('Failed to fetch cards:', error);
				dispatch({ type: 'SET_CARDS', payload: [] });
			}
		};
		fetchCards();
	}, [listId]);

	const value = { cards, dispatch, listId };
	return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

export function useCards() {
	return useContext(CardContext);
}
