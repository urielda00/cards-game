import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;

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
    font-size: 1.5rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 600px) {
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  font-size: 1rem;
  color: ${props => props.$isActive ? '#007bff' : '#343a40'};
  text-decoration: none;
  font-weight: ${props => props.$isActive ? '600' : '500'};
  transition: color 0.2s;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: -4px;
    left: 0;
    background-color: #007bff;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  }

  &:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }

  @media (max-width: 600px) {
    font-size: 0.9rem;
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
        <NavLink to="/" $isActive={location.pathname === '/'}>
          דף הבית
        </NavLink>
        <NavLink 
          to={listPath} 
          $isActive={location.pathname.startsWith('/lists') || location.pathname.startsWith('/image-lists')}
        >
          הרשימות שלי
        </NavLink>
      </Nav>
    </HeaderContainer>
  );
}

export default Header;