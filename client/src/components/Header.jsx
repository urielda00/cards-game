import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  box-sizing: border-box; /* מבטיח שה-padding לא יגדיל את ה-width */
  direction: rtl;

  @media (max-width: 600px) {
    padding: 0.75rem 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: #007bff;
  text-decoration: none;
  letter-spacing: -1px;

  @media (max-width: 600px) {
    display: none; /* הסרת הלוגו בנייד */
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 600px) {
    width: 100%; /* תופס את כל הרוחב הזמין */
    justify-content: space-between; /* פיזור הקישורים */
    gap: 0;
  }
`;

const NavLink = styled(Link)`
  font-size: 1rem;
  color: ${props => props.$isActive ? '#007bff' : '#343a40'};
  text-decoration: none;
  font-weight: ${props => props.$isActive ? '600' : '500'};
  transition: color 0.2s;
  position: relative;
  white-space: nowrap;
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 3px;
    bottom: -6px;
    left: 0;
    background-color: #007bff;
    transition: transform 0.25s ease-out;
  }

  ${props => props.$isActive && `
    &::after {
      transform: scaleX(1);
    }
  `}

  @media (max-width: 600px) {
    font-size: 0.95rem;
  }
`;

function Header() {
  const location = useLocation();
  const isImageGame = location.pathname.startsWith('/image-lists');
  const listPath = isImageGame ? '/image-lists' : '/lists';

  return (
    <HeaderContainer>
      <Logo to="/">Flashcards</Logo>
      <Nav>
        <NavLink to="/" $isActive={location.pathname === '/'}>דף הבית</NavLink>
        <NavLink to="/games" $isActive={location.pathname.startsWith('/games')}>משחקים</NavLink>
        <NavLink to={listPath} $isActive={location.pathname.startsWith('/lists') || location.pathname.startsWith('/image-lists')}>הרשימות שלי</NavLink>
      </Nav>
    </HeaderContainer>
  );
}

export default Header;