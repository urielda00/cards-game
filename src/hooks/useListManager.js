import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useListManager = (apiBaseUrl) => {
	const [lists, setLists] = useState([]);
	const [newListName, setNewListName] = useState('');
	const [editingListId, setEditingListId] = useState(null);
	const [editingName, setEditingName] = useState('');
	const [listToDelete, setListToDelete] = useState(null);
	const [listToReset, setListToReset] = useState(null);

	useEffect(() => {
		const fetchLists = async () => {
			try {
				const response = await fetch(`${import.meta.env.VITE_API_URL}${apiBaseUrl}`);
				setLists(await response.json());
			} catch (error) {
				console.error(`Failed to fetch lists from ${apiBaseUrl}:`, error);
			}
		};
		fetchLists();
	}, [apiBaseUrl]);

	const handleCreateList = async (e) => {
		e.preventDefault();
		if (!newListName.trim()) return;
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}${apiBaseUrl}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newListName }),
			});
			const newList = await response.json();
			setLists([...lists, newList]);
			setNewListName('');
			toast.success(`הרשימה "${newList.name}" נוצרה!`);
		} catch (error) {
			toast.error('יצירת הרשימה נכשלה.');
		}
	};

	const handleDeleteList = async () => {
		if (!listToDelete) return;
		try {
			await fetch(`${import.meta.env.VITE_API_URL}${apiBaseUrl}/${listToDelete.id}`, { method: 'DELETE' });
			setLists(lists.filter((list) => list.id !== listToDelete.id));
			toast.success(`הרשימה "${listToDelete.name}" נמחקה.`);
			setListToDelete(null);
		} catch (error) {
			toast.error('מחיקת הרשימה נכשלה.');
			setListToDelete(null);
		}
	};

	const handleStartEdit = (list) => {
		setEditingListId(list.id);
		setEditingName(list.name);
	};

	const handleCancelEdit = () => {
		setEditingListId(null);
		setEditingName('');
	};

	const handleSaveEdit = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}${apiBaseUrl}/${editingListId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: editingName }),
			});
			const updatedList = await response.json();
			setLists(lists.map((list) => (list.id === editingListId ? updatedList : list)));
			handleCancelEdit();
			toast.success('שם הרשימה עודכן!');
		} catch (error) {
			toast.error('עדכון שם הרשימה נכשל.');
		}
	};

	const handleResetCompletion = async () => {
		if (!listToReset) return;
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}${apiBaseUrl}/${listToReset.id}/complete`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ completed: false }),
			});
			const updatedList = await response.json();
			setLists(lists.map((list) => (list.id === listToReset.id ? updatedList : list)));
			toast('סטטוס ההשלמה אופס!');
			setListToReset(null);
		} catch (error) {
			toast.error('איפוס הסטטוס נכשל.');
			setListToReset(null);
		}
	};

	return {
		lists,
		newListName,
		setNewListName,
		editingListId,
		editingName,
		setEditingName,
		listToDelete,
		setListToDelete,
		listToReset,
		setListToReset,
		handleCreateList,
		handleDeleteList,
		handleStartEdit,
		handleCancelEdit,
		handleSaveEdit,
		handleResetCompletion,
	};
};
