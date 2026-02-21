import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isOwn = !id || id === currentUser.id

  useEffect(() => {
    const url = isOwn ? '/users/me' : `/users/${id}`
    api.get(url).then(r => { setUser(r.data); setForm(r.data) })
  }, [id])

  const set = (key, val) => setForm({ ...form, [key]: val })

  const save = async () => {
    try {
      const payload = { ...form, skills: typeof form.skills === 'string' ? form.skills : form.skills?.join(', ') }
      const { data } = await api.put('/users/me', payload)
      setUser(data)
      setEditing(false)
      setMsg('Saved!')
      setTimeout(() => setMsg(''), 2000)
    } catch { setMsg('Failed to save') }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')

    try {
      const payload = user.googleId ? {} : { password: deletePassword }
      
      if (!user.googleId && !deletePassword.trim()) {
        setDeleteError('Password is required')
        setDeleting(false)
        return
      }

      await api.delete('/users/me', { data: payload })
      localStorage.clear()
      window.location.href = '/login'
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account')
      setDeleting(false)
    }
  }

  if (!user) return <p className="muted">Loading...</p>

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar avatar-lg">{user.name?.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="muted">{user.college} {user.year ? `· Year ${user.year}` : ''}</p>
          <span className={`badge badge-${user.availability === 'available' ? 'open' : 'muted'}`}>{user.availability}</span>
        </div>
        {isOwn && !editing && <button className="btn btn-outline" onClick={() => setEditing(true)}>Edit Profile</button>}
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {editing ? (
        <div className="edit-form">
          <div className="form-group"><label>Name</label><input value={form.name || ''} onChange={e => set('name', e.target.value)} /></div>
          <div className="form-group"><label>Bio</label><textarea value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={3} /></div>
          <div className="form-group"><label>College</label><input value={form.college || ''} onChange={e => set('college', e.target.value)} /></div>
          <div className="form-group"><label>Year</label>
            <select value={form.year || 1} onChange={e => set('year', e.target.value)}>
              {[1,2,3,4,5].map(y => <option key={y} value={y}>{y === 5 ? 'Post-grad' : `Year ${y}`}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Skills (comma separated)</label><input value={typeof form.skills === 'string' ? form.skills : form.skills?.join(', ')} onChange={e => set('skills', e.target.value)} /></div>
          <div className="form-group"><label>Availability</label>
            <select value={form.availability || 'available'} onChange={e => set('availability', e.target.value)}>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="in-team">In a Team</option>
            </select>
          </div>
          <div className="form-group"><label>GitHub</label><input value={form.github || ''} onChange={e => set('github', e.target.value)} /></div>
          <div className="form-group"><label>LinkedIn</label><input value={form.linkedin || ''} onChange={e => set('linkedin', e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={save}>Save</button>
            <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
          </div>
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--danger)', marginBottom: 10 }}>Danger Zone</h3>
            <button className="btn" style={{ background: 'var(--danger)', color: 'white' }} onClick={() => setShowDeleteModal(true)}>Delete Account</button>
          </div>
        </div>
      ) : (
        <>
          {user.bio && <div className="profile-section"><h3>About</h3><p>{user.bio}</p></div>}
          <div className="profile-section">
            <h3>Skills</h3>
            <div className="skill-tags">
              {user.skills?.length === 0 && <p className="muted">No skills added</p>}
              {user.skills?.map((s, i) => <span key={i} className="tag tag-lg">{s}</span>)}
            </div>
          </div>
          {(user.github || user.linkedin) && (
            <div className="profile-section">
              <h3>Links</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {user.github && <a href={user.github} target="_blank" className="btn btn-sm btn-outline">GitHub</a>}
                {user.linkedin && <a href={user.linkedin} target="_blank" className="btn btn-sm btn-outline">LinkedIn</a>}
              </div>
            </div>
          )}
        </>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: 'var(--danger)' }}>Delete Account</h3>
            <p>This action cannot be undone. {user.googleId ? 'Click delete to confirm.' : 'Enter your password to confirm.'}</p>
            {deleteError && <div className="alert alert-error">{deleteError}</div>}
            {!user.googleId && (
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={deleting}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                className="btn"
                style={{ background: 'var(--danger)', color: 'white', flex: 1 }}
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
