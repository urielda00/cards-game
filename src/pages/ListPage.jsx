import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
import ConfirmModal from '../components/ConfirmModal';
import { useListManager } from '../hooks/useListManager';

const PageWrapper = styled.div`
  padding: 2rem 1rem;
  max-width: 800px;
  margin: auto;
  direction: rtl;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 1.2rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  transition: transform 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
    gap: 1.2rem;
  }
`;

const ListLink = styled(Link)`
  text-decoration: none;
  color: #007bff;
  font-size: 1.25rem;
  font-weight: 700;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.8rem;
  align-items: center;

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  cursor: pointer;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  
  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
  }
`;

const DeleteButton = styled(ActionButton)`
  color: #dc3545;
  &:hover {
    background: #fff5f5;
    border-color: #dc3545;
  }
`;

const CreateForm = styled.form`
  display: flex;
  gap: 0.8rem;
  margin-top: 2.5rem;
  background: #fff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const FormInput = styled.input`
  flex-grow: 1;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: right;
`;

const FormButton = styled.button`
  padding: 0.8rem 1.5rem;
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
      <ConfirmModal isOpen={!!listToDelete} onClose={() => setListToDelete(null)} onConfirm={handleDeleteList} title="למחוק רשימה?">
        <p>האם למחוק את הרשימה: <br/><strong>"{listToDelete?.name}"</strong>?</p>
      </ConfirmModal>

      <PageWrapper>
        <Title>רשימות המילים שלך</Title>
        <List>
          {lists.map(list => (
            <ListItem key={list.id}>
              {editingListId === list.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <FormInput type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} autoFocus />
                  <ActionButton onClick={handleSaveEdit}>שמור</ActionButton>
                  <ActionButton onClick={handleCancelEdit}>בטל</ActionButton>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   {list.completed && (
                   <span 
                        style={{ fontSize: '1.4rem', cursor: 'pointer' }} 
                        onClick={() => handleResetCompletion(list)}
                        title="לחץ לביטול ההשלמה"
                      >
                        ✅
                   </span>
                    )}
                    <ListLink to={`/lists/${list.id}`}>{list.name}</ListLink>
                  </div>
                  <ButtonGroup>
                    <ActionButton onClick={() => handleStartEdit(list)}>✏️ ערוך</ActionButton>
                    <DeleteButton onClick={() => setListToDelete(list)}>🗑️ מחק</DeleteButton>
                    <ActionButton onClick={() => handleResetCompletion(list)}>🔄 אפס</ActionButton>
                  </ButtonGroup>
                </>
              )}
            </ListItem>
          ))}
        </List>
        <CreateForm onSubmit={handleCreateList}>
          <FormInput type="text" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="שם לרשימה חדשה..." />
          <FormButton type="submit">צור רשימה</FormButton>
        </CreateForm>
      </PageWrapper>
    </>
  );
}

export default ListPage;