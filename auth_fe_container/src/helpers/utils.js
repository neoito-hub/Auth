import jwtDecode from 'jwt-decode'

export function getLocalStorage(name) {
  return JSON.parse(localStorage?.getItem(name))
}

export const isLoggedIn = () => {
  // Check if the user is logged in here
  // For example, you could check for a token in local storage
  const token = localStorage.getItem('REFRESH_TOKEN')
  console.log('token is :', token)
  if (!token) {
    return false
  }

  // Decode the JWT token
  const decodedToken = jwtDecode(token)

  // Check if the token is expired
  const now = new Date()
  const expiryDate = new Date(decodedToken.exp * 1000)
  if (now > expiryDate) {
    return false
  }

  return true
}
