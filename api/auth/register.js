// File: /api/auth/register.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  // Normally, you'd validate input, hash the password, and save the user in your database.
  // For illustration, we'll simulate a successful registration:
  const newUser = { id: 'dummyId', username, email }
  const token = 'dummyJWTtoken' // Replace with actual JWT creation

  return res.status(200).json({ user: newUser, token })
}
