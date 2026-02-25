import React, { useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';
import { connect } from 'react-redux'
import AuthPage from '../pages/AuthPage.jsx'
import LobbyPage from '../pages/LobbyPage.jsx'
import NotFound from '../pages/NotFound.jsx'

// Redux
import { useDispatch } from 'react-redux';
import { logout } from '../../actions/auth.js';

// Socket
import { disconnectSocket, createSocket, getSocket } from '../../services/socket.js';


// const App = ({message}) => {
//   return (
//     <span>{message}</span>
//   )
// }

// const mapStateToProps = (state) => {
//   return {
//     message: state.alert.message
//   }
// }
// export default connect(mapStateToProps, null)(App)

const AppContent = ({ logout }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.pathname === "/") {
      dispatch(logout());   // clears redux
      disconnectSocket();   // closes socket
      createSocket({ dispatch });       // reconnects
    }
    else
    {
      const socket = getSocket();
      if (socket === undefined) createSocket({ dispatch });
    }
  }, [location.pathname]);

  return (
    <Switch>
      <Route exact path="/" component={AuthPage} />
      <Route exact path="/:room/:player" component={LobbyPage} />
      <Route path="*" component={NotFound} />
    </Switch>
  )
};

const App = ({ logout }) => {
  return (
    <Router>
      <AppContent logout={logout} />
    </Router>
  )
};

// const App = ({ logout, user }) => {

//   useEffect(() => {
//   if (location.pathname === "/") {
//     dispatch(logout());   // clears redux
//     disconnectSocket();   // closes socket
//     createSocket();       // reconnects
//   }
// }, [location.pathname]);

//   return (
//     <Router>
//       <Switch>
//         <Route exact path="/" component={ AuthPage } />
//         <Route exact path="/:room/:player" component={ LobbyPage } />
//         <Route path="*" component={ NotFound } />
//       </Switch>
//     </Router>
//   )
// }

const mapDispatchToProps = { logout };
const mapStateToProps = (state) => {
  return {
    message: state.alert.message,
    user: state.user
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)


