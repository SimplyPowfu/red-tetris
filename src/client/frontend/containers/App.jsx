import React from 'react'
import { connect } from 'react-redux'
import AuthPage from '../pages/AuthPage'
import LobbyPage from '../pages/LobbyPage'


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
    user.username ? <LobbyPage /> : <AuthPage />
  )
}

const mapStateToProps = (state) => {
  return {
    message: state.alert.message,
    user: state.user
  }
}

export default connect(mapStateToProps, null)(App)


