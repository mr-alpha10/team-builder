import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import api from '../api/axiosClient'

export default function Signup() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ valid: false, errors: [] })

  const set = (key, val) => {
    setForm({ ...form, [key]: val })
    if (key === 'password') validatePassword(val)
  }

  const validatePassword = (password) => {
    const errors = []
    if (!password || password.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
    if (!/\d/.test(password)) errors.push('One number')
    
    setPasswordStrength({ 
      valid: errors.length === 0 && password.length > 0, 
      errors 
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!passwordStrength.valid) {
      setError('Please meet all password requirements')
      return
    }

    setLoading(true)
    
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Redirect based on profile completion
      window.location.href = data.user.profileComplete ? '/dashboard' : '/complete-profile'
    } catch (err) {
      if (err.response?.data?.details) {
        setError(err.response.data.details.map(d => d.message).join(', '))
      } else {
        setError(err.response?.data?.error || 'Signup failed')
      }
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    
    try {
      const { data } = await api.post('/auth/google', {
        credential: credentialResponse.credential
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      window.location.href = data.user.profileComplete ? '/dashboard' : '/complete-profile'
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Google signup failed. Please try again.'
      setError(errorMsg)
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google signup failed. Please try again.')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🚀 Join TeamBuilder</h2>
          <p className="muted">Create your account in seconds</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="google-auth">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            size="large"
            text="signup_with"
            width="100%"
            ux_mode="popup"
          />
        </div>

        <div className="divider">
          <span>or sign up with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              value={form.name} 
              onChange={e => set('name', e.target.value)} 
              required 
              placeholder="John Doe"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={form.email} 
              onChange={e => set('email', e.target.value)} 
              required 
              placeholder="you@college.edu"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={form.password} 
              onChange={e => set('password', e.target.value)} 
              required 
              placeholder="Min 8 characters"
              disabled={loading}
            />
            {form.password && (
              <div className="password-strength">
                {passwordStrength.valid ? (
                  <span className="text-success">✓ Strong password</span>
                ) : (
                  <ul className="password-requirements">
                    {passwordStrength.errors.map((err, i) => (
                      <li key={i} className="text-muted">• {err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading || !passwordStrength.valid}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
