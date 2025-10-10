import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import ConfirmModal from '../components/ConfirmModal';
import { useListManager } from '../hooks/useListManager';

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: auto;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const ListLink = styled(Link)`
  text-decoration: none;
  color: #007bff;
  font-size: 1.2rem;
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 0.3rem 0.6rem;
  font-size: 0.9rem;
  cursor: pointer;
  background: transparent;
  border: 1px solid #ccc;
  border-radius: 5px;
  
  &:hover {
    background: #e9ecef;
  }
`;

const DeleteButton = styled(ActionButton)`
    color: #dc3545;
    border-color: #dc3545;
    &:hover { background: #dc3545; color: white; }
`;

const CreateForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const FormInput = styled.input`
  flex-grow: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const FormButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
`;

function ListPage() {
    const {
        lists,
        newListName, setNewListName,
        editingListId,
        editingName, setEditingName,
        listToDelete, setListToDelete,
        listToReset, setListToReset,
        handleCreateList,
        handleDeleteList,
        handleStartEdit,
        handleCancelEdit,
        handleSaveEdit,
        handleResetCompletion
    } = useListManager('/api/lists');

  return (
    <>
      <Header />
      <ConfirmModal
        isOpen={!!listToDelete}
        onClose={() => setListToDelete(null)}
        onConfirm={handleDeleteList}
        title="למחוק רשימה?"
      >
        <p>האם אתה בטוח שברצונך למחוק את הרשימה: <br/><strong>"{listToDelete?.name}"</strong>?</p>
        <p><small>פעולה זו תמחק גם את כל המילים שברשימה.</small></p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={!!listToReset}
        onClose={() => setListToReset(null)}
        onConfirm={handleResetCompletion}
        title="לאפס סטטוס?"
      >
        <p>האם לאפס את סטטוס ההשלמה של הרשימה: <br/><strong>"{listToReset?.name}"</strong>?</p>
      </ConfirmModal>
      
      <PageWrapper>
        <h1>רשימות המילים שלך</h1>
        <List>
          {lists.map(list => (
            <ListItem key={list.id}>
              {editingListId === list.id ? (
                <CreateForm onSubmit={handleSaveEdit} style={{ flexGrow: 1, marginTop: 0 }}>
                  <FormInput type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} autoFocus />
                  <ActionButton type="submit">שמור</ActionButton>
                  <ActionButton type="button" onClick={handleCancelEdit}>בטל</ActionButton>
                </CreateForm>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {list.completed && (
                        <span onClick={() => setListToReset(list)} style={{ cursor: 'pointer', fontSize: '1.5rem' }} title="אפס סטטוס השלמה">
                            ✅
                        </span>
                    )}
                    <ListLink to={`/lists/${list.id}`}>{list.name}</ListLink>
                  </div>
                  <ButtonGroup>
                    <ActionButton onClick={() => handleStartEdit(list)}>✏️ ערוך</ActionButton>
                    <DeleteButton onClick={() => setListToDelete(list)}>🗑️ מחק</DeleteButton>
                  </ButtonGroup>
                </>
              )}
            </ListItem>
          ))}
        </List>
        <CreateForm onSubmit={handleCreateList}>
          <FormInput
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="שם לרשימה חדשה"
          />
          <FormButton type="submit">צור רשימה</FormButton>
        </CreateForm>
      </PageWrapper>
    </>
  );
}

export default ListPage;