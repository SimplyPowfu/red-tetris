import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { login } from '../../actions/auth.js';
import { startmatch, readystate, move } from '../../actions/tetris.js';

import LobbyPageMobile from './LobbyPageMobile.jsx';
import LobbyPagePC from './LobbyPagePC.jsx';


function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export const LobbyPage = (props) => {
    
    const isMobile = useIsMobile();

    return isMobile
        ? <LobbyPageMobile {...props} />
        : <LobbyPagePC {...props} />;
    

}

const mapDispatchToProps = { login, startmatch, readystate, move };
const mapStateToProps = (state) => ({
    message: state.alert.message,
    user: state.user,
    lobby: state.lobby,
    winner: state.tetris.winner,
});

export default connect(mapStateToProps, mapDispatchToProps)(LobbyPage);

// export default LobbyPage;