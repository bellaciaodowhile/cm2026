import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === 'true')

  function login(user, pass) {
    if (
      user === import.meta.env.VITE_ADMIN_USER &&
      pass === import.meta.env.VITE_ADMIN_PASS
    ) {
      sessionStorage.setItem('admin_auth', 'true')
      setAuthed(true)
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem('admin_auth')
    setAuthed(false)
  }

  return (
    <AuthContext.Provider value={{ authed, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
