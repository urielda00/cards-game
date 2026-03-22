import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useListManager = (apiBaseUrl) => {
	const [lists, setLists] = useState([]);
	const [newListName, setNewListName] = useState('');
	const [editingListId, setEditingListId] = useState(null);
	const [editingName, setEditingName] = useState('');
	const [listToDelete, setListToDelete] = useState(null);
	const [listToReset, setListToReset] = useState(null);

	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [adminPassword, setAdminPassword] = useState('');
	const [passwordAction, setPasswordAction] = useState(null); // 'create' or 'delete'
	const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
	const [jsonInput, setJsonInput] = useState('');

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

	// Initiates Creation
	const handleInitiateCreate = (e) => {
		e.preventDefault();
		if (!newListName.trim()) {
			toast.error('נא להזין שם רשימה תחילה');
			return;
		}
		setPasswordAction('create');
		setIsPasswordModalOpen(true);
	};

	// Initiates Deletion
	const handleInitiateDelete = (list) => {
		setListToDelete(list);
		setPasswordAction('delete');
		setIsPasswordModalOpen(true);
	};

	// Generic function to close password modal and clear states
	const handleClosePasswordModal = () => {
		setIsPasswordModalOpen(false);
		setAdminPassword('');
		setPasswordAction(null);
		if (passwordAction === 'delete') setListToDelete(null);
	};

	// Verifies password for BOTH actions
	const verifyPassword = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}${apiBaseUrl}/verify-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: adminPassword })
			});
			
			if (response.ok) {
				setIsPasswordModalOpen(false);
				setAdminPassword('');

				// Decide what to do next based on the action
				if (passwordAction === 'create') {
					setIsBulkModalOpen(true);
				} else if (passwordAction === 'delete') {
					await performDelete();
				}
				
				setPasswordAction(null);
			} else {
				toast.error('סיסמה שגויה!');
			}
		} catch (error) {
			toast.error('שגיאה באימות הסיסמה');
		}
	};

	// The actual delete logic (runs only after password is verified)
	const performDelete = async () => {
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

	const handleBulkSubmit = async (e) => {
		e.preventDefault();
		try {
			const parsedData = JSON.parse(jsonInput);
			if (!Array.isArray(parsedData)) throw new Error('הנתונים חייבים להיות בפורמט של מערך (Array).');
			if (parsedData.length === 0) throw new Error('המערך ריק, נא להזין מילים.');

			for (let i = 0; i < parsedData.length; i++) {
				const item = parsedData[i];
				if (!item.front || !item.back) {
					throw new Error(`שגיאה בשורה ${i + 1}: לכל מילה חייבים להיות שדות 'front' ו-'back'.`);
				}
			}

			const response = await fetch(`${import.meta.env.VITE_API_URL}${apiBaseUrl}/bulk`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newListName, words: parsedData }),
			});

			if (!response.ok) throw new Error('שגיאה בשמירת הנתונים בשרת.');
			
			const data = await response.json();
			setLists([...lists, data.list]);
			setNewListName('');
			setJsonInput('');
			setIsBulkModalOpen(false);
			toast.success(`הרשימה "${data.list.name}" נוצרה בהצלחה יחד עם ${data.wordsAdded} מילים!`);

		} catch (error) {
			if (error instanceof SyntaxError) {
				toast.error('ה-JSON אינו תקין. נא לוודא שהעתקת נכון מה-AI.');
			} else {
				toast.error(error.message);
			}
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

	const handleResetCompletion = async (list) => {
		const targetList = list || listToReset;
		if (!targetList) return;

		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}${apiBaseUrl}/${targetList.id}/complete`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ completed: false }), 
			});
			if (!response.ok) throw new Error('Failed to update');
			const updatedList = await response.json();
			setLists(lists.map((l) => (l.id === targetList.id ? updatedList : l)));
			toast.success('הסימון הוסר');
			setListToReset(null);
		} catch (error) {
			console.error(error);
			toast.error('איפוס הסטטוס נכשל');
		}
	};

	return {
		lists,
		newListName, setNewListName,
		editingListId, editingName, setEditingName,
		listToReset, setListToReset,
		listToDelete,
		isPasswordModalOpen, 
		adminPassword, setAdminPassword,
		passwordAction,
		isBulkModalOpen, setIsBulkModalOpen,
		jsonInput, setJsonInput,
		handleInitiateCreate,
		handleInitiateDelete,
		handleClosePasswordModal,
		verifyPassword,
		handleBulkSubmit,
		handleStartEdit,
		handleCancelEdit,
		handleSaveEdit,
		handleResetCompletion,
	};
};