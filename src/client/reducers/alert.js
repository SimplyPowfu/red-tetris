import { ALERT_POP, ALERT_CLEAR } from '../actions/alert'

const reducer = (state = {} , action) => {
  switch(action.type)
  {
    case ALERT_POP:
      return { message: action.message }
    case ALERT_CLEAR:
      return {};
    default: 
      return state
  }
}

export default reducer

