export const ALERT_POP = 'alert/pop'
export const ALERT_CLEAR = 'alert/clear'

export const alert = (message) => {
  return {
    type: ALERT_POP,
    message
  }
}


export const alertclear = () => {
  return {
    type: ALERT_CLEAR
  }
}

