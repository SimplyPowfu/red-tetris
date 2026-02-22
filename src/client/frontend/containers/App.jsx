import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux'
import AuthPage from '../pages/AuthPage.jsx'
import LobbyPage from '../pages/LobbyPage.jsx'


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

const App = ({ user }) => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={ AuthPage } />
        <Route exact path="/:room/:player" component={ LobbyPage } />
        <Route path="/404" component={ <div>ciao</div> } />
        {/* user.username ? <LobbyPage /> : <AuthPage /> */}
      </Switch>
    </Router>
  )
}

const mapStateToProps = (state) => {
  return {
    message: state.alert.message,
    user: state.user
  }
}

export default connect(mapStateToProps, null)(App)


