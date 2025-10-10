import { useState, useEffect } from 'react';
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
  color: #28a745;
  font-size: 1.2rem;
  font-weight: bold;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const DeleteButton = styled.button`
    color: #dc3545;
    border: 1px solid #dc3545;
    padding: 0.3rem 0.6rem;
    font-size: 0.9rem;
    cursor: pointer;
    background: transparent;
    border-radius: 5px;

    &:hover { 
        background: #dc3545; 
        color: white; 
    }
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

function ImageListPage() {
    const {
        lists,
        newListName, setNewListName,
        listToDelete, setListToDelete,
        handleCreateList,
        handleDeleteList,
    } = useListManager('/api/image-lists');

  return (
    <>
      <Header />
      <ConfirmModal
        isOpen={!!listToDelete}
        onClose={() => setListToDelete(null)}
        onConfirm={handleDeleteList}
        title="למחוק רשימת תמונות?"
      >
        <p>האם למחוק את הרשימה: <br/><strong>"{listToDelete?.name}"</strong>?</p>
        <p><small>פעולה זו תמחק גם את כל התמונות שברשימה.</small></p>
      </ConfirmModal>
      
      <PageWrapper>
        <h1>רשימות התמונות שלך</h1>
        <List>
          {lists.map(list => (
            <ListItem key={list.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ListLink to={`/image-lists/${list.id}`}>{list.name}</ListLink>
                </div>
                <ButtonGroup>
                    <DeleteButton onClick={() => setListToDelete(list)}>🗑️ מחק</DeleteButton>
                </ButtonGroup>
            </ListItem>
          ))}
        </List>
        <CreateForm onSubmit={handleCreateList}>
          <FormInput
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="שם לרשימת תמונות חדשה"
          />
          <FormButton type="submit">צור רשימה</FormButton>
        </CreateForm>
      </PageWrapper>
    </>
  );
}

export default ImageListPage;