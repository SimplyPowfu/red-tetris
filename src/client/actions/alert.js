export const ALERT_POP = 'ALERT_POP'
export const ALERT_CLEAR = 'ALERT_CLEAR'

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

