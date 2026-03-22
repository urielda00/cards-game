import { useState } from 'react';
import { useCards } from '../context/CardContext';
import toast from 'react-hot-toast';
import styled from 'styled-components';

const FormContainer = styled.div`
	background: #ffffff;
	padding: 1.5rem 2rem;
	border-radius: 16px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	max-width: 800px;
	margin: 1rem auto 2rem auto;
	padding: 1.5rem;

	@media (max-width: 768px) {
		margin-left: 1rem;
		margin-right: 1rem;
		padding: 1rem;
	}
`;

const StyledForm = styled.form`
	display: flex;
	gap: 1rem;

	@media (max-width: 600px) {
		flex-direction: column;
	}
`;

const FormInput = styled.input`
	flex-grow: 1;
	padding: 0.75rem 1rem;
	font-size: 1rem;
	border: 1px solid #ccc;
	border-radius: 8px;
	transition: border-color 0.2s, box-shadow 0.2s;

	&:focus {
		outline: none;
		border-color: #007bff;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
	}

	&[placeholder='פירוש בעברית'] {
		direction: rtl;
	}
`;

const SubmitButton = styled.button`
	padding: 0.75rem 1.5rem;
	font-size: 1rem;
	background-color: #28a745;
	color: white;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	font-weight: bold;
	transition: background-color 0.2s;

	&:hover {
		background-color: #218838;
	}
`;

function AddWordForm({ listId }) {
	const [front, setFront] = useState('');
	const [back, setBack] = useState('');
	const { dispatch } = useCards();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!front.trim() || !back.trim() || !listId) return;

		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lists/${listId}/words`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ front, back }),
			});
			if (!response.ok) throw new Error('Failed to add card');

			const newCard = await response.json();
			dispatch({ type: 'ADD_CARD', payload: newCard });

			toast.success(`המילה '${newCard.front}' נוספה בהצלחה!`);

			setFront('');
			setBack('');
		} catch (error) {
			toast.error('הוספת המילה נכשלה.');
			console.error('Error adding card:', error);
		}
	};

	return (
		<FormContainer>
			<StyledForm onSubmit={handleSubmit}>
				<FormInput type='text' value={front} onChange={(e) => setFront(e.target.value)} placeholder='מילה באנגלית' required />
				<FormInput type='text' value={back} onChange={(e) => setBack(e.target.value)} placeholder='פירוש בעברית' required />
				<SubmitButton type='submit'>הוסף מילה</SubmitButton>
			</StyledForm>
		</FormContainer>
	);
}

export default AddWordForm;
