import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  direction: rtl;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 0.8rem;
  margin: 1rem 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  direction: ltr;
  font-family: monospace;
  resize: vertical;
`;

function ListPage() {
    const {
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
        handleResetCompletion
    } = useListManager('/api/lists');

  return (
    <>
      <Header />

      {/* Dynamic Password Verification Modal */}
      {isPasswordModalOpen && (
        <ModalOverlay onClick={handleClosePasswordModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h2 style={{marginTop: 0}}>אימות מנהל</h2>
            <p>
              {passwordAction === 'create' 
                ? `הזן סיסמה כדי ליצור את הרשימה "${newListName}":` 
                : `הזן סיסמה כדי למחוק את הרשימה "${listToDelete?.name}":`}
            </p>
            <form onSubmit={verifyPassword}>
              <FormInput 
                type="password" 
                value={adminPassword} 
                onChange={e => setAdminPassword(e.target.value)} 
                placeholder="סיסמה..." 
                autoFocus 
                style={{ width: '100%', marginBottom: '1rem', boxSizing: 'border-box' }}
              />
              <div style={{display: 'flex', gap: '1rem'}}>
                <FormButton type="submit">המשך</FormButton>
                <ActionButton type="button" onClick={handleClosePasswordModal}>ביטול</ActionButton>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Bulk JSON Paste Modal */}
      {isBulkModalOpen && (
        <ModalOverlay onClick={() => setIsBulkModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <h2 style={{marginTop: 0}}>הוספת מילים: {newListName}</h2>
            <p>הדבק את ה-JSON שקיבלת מה-AI כאן (מערך של אובייקטים עם front ו-back):</p>
            <form onSubmit={handleBulkSubmit}>
              <TextArea 
                value={jsonInput} 
                onChange={e => setJsonInput(e.target.value)} 
                placeholder='[ {"front": "word", "back": "מילה"} ]'
                autoFocus
              />
              <div style={{display: 'flex', gap: '1rem'}}>
                <FormButton type="submit">שמור רשימה</FormButton>
                <ActionButton type="button" onClick={() => setIsBulkModalOpen(false)}>ביטול</ActionButton>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

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
                    {Boolean(list.completed) && (
                      <span 
                        style={{ fontSize: '1.4rem', cursor: 'pointer', userSelect: 'none' }} 
                        onClick={() => handleResetCompletion(list)}
                        title="לחץ לביטול ההשלמה"
                      >✅</span>
                    )}
                    <ListLink to={`/lists/${list.id}`}>{list.name}</ListLink>
                  </div>
                  <ButtonGroup>
                    <ActionButton onClick={() => handleStartEdit(list)}>✏️ ערוך</ActionButton>
                    <DeleteButton onClick={() => handleInitiateDelete(list)}>🗑️ מחק</DeleteButton>
                  </ButtonGroup>
                </>
              )}
            </ListItem>
          ))}
        </List>

        <CreateForm onSubmit={handleInitiateCreate}>
          <FormInput type="text" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="שם לרשימה חדשה..." />
          <FormButton type="submit">צור רשימה</FormButton>
        </CreateForm>
      </PageWrapper>
    </>
  );
}

export default ListPage;