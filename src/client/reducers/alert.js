import { ALERT_POP, ALERT_CLEAR } from '../actions/alert'
import { LOGOUT_REPLY } from '../actions/auth';

const reducer = (state = {} , action) => {
  switch(action.type)
  {
    case ALERT_POP:
      return { message: action.message }
    case ALERT_CLEAR:
      return {};
    case LOGOUT_REPLY:
        return {};
    default: 
      return state
  }
}

export default reducer

