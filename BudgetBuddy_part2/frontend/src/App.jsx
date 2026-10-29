import { useState } from 'react'
import api from './api'
import Dashboard from './Dashboard'

export default function App() {
  const [mode, setMode] = useState('register')
  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('bb_access') || '')
  const [profile, setProfile] = useState(null)

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      if (mode === 'register') {
        await api.post('/auth/register/', form)
        setMessage('Account created. You can now log in.')
        setMode('login')
      } else {
        const response = await api.post('/auth/token/', { username: form.username, password: form.password })
        localStorage.setItem('bb_access', response.data.access)
        localStorage.setItem('bb_refresh', response.data.refresh)
        setToken(response.data.access)
        setMessage('Login successful.')
      }
    } catch (error) {
      const data = error.response?.data
      setMessage(data ? Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : value}`).join(' | ') : 'Could not connect to the API. Check that the backend is running.')
    } finally { setBusy(false) }
  }

  async function loadProfile() {
    try {
      const response = await api.get('/auth/me/', { headers: { Authorization: `Bearer ${token}` } })
      setProfile(response.data)
      setMessage('Authenticated profile loaded.')
    } catch { setMessage('Could not load profile. Please log in again.') }
  }

  function logout() {
    localStorage.removeItem('bb_access'); localStorage.removeItem('bb_refresh')
    setToken(''); setProfile(null); setMessage('You have logged out.')
  }

  if (token) return <Dashboard onLogout={logout} />

  return <main className="page">
    <nav className="nav"><div className="brand-mark">B</div><span>BudgetBuddy</span><span className="nav-tag">STUDENT FINANCE</span></nav>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">YOUR MONEY, MORE INTENTIONAL</p><h1>Small steps today.<br/><em>Better habits tomorrow.</em></h1><p className="intro">A simple starting point for understanding your money, building healthy habits, and working toward your goals.</p><div className="feature-row"><span>✓ Track spending</span><span>✓ Plan ahead</span><span>✓ Save with purpose</span></div></div>
      <div className="auth-card"><div className="card-heading"><p className="eyebrow">WELCOME TO BUDGETBUDDY</p><h2>{token ? 'You’re signed in' : mode === 'register' ? 'Create your account' : 'Welcome back'}</h2><p>{token ? 'Your account authentication is ready to test.' : mode === 'register' ? 'Start building better money habits.' : 'Log in to continue.'}</p></div>
      {token ? <div className="signed-in"><p>JWT access token saved in this browser.</p><button onClick={loadProfile} className="primary">Load my profile</button>{profile && <pre>{JSON.stringify(profile, null, 2)}</pre>}<button onClick={logout} className="secondary">Log out</button></div> : <form onSubmit={submit}>
        <label>Username<input name="username" autoComplete="username" value={form.username} onChange={update} required minLength="3" placeholder="Choose a username" /></label>
        {mode === 'register' && <label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required placeholder="you@example.com" /></label>}
        <label>Password<input name="password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={form.password} onChange={update} required minLength="8" placeholder="At least 8 characters" /></label>
        {mode === 'register' && <label>Confirm password<input name="password_confirm" type="password" autoComplete="new-password" value={form.password_confirm} onChange={update} required placeholder="Enter password again" /></label>}
        <button className="primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Log in'}</button>
        <p className="switch">{mode === 'register' ? 'Already registered?' : 'New to BudgetBuddy?'} <button type="button" className="link" onClick={() => {setMode(mode === 'register' ? 'login' : 'register');setMessage('')}}>{mode === 'register' ? 'Log in' : 'Create an account'}</button></p>
      </form>}
      {message && <p className="message" role="status">{message}</p>}
      </div>
    </section>
    <footer>BudgetBuddy · Part 1 foundation · Account setup and authentication</footer>
  </main>
}
