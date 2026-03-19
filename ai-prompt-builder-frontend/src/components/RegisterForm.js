import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setMessage('Error: Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Error: Passwords do not match.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(process.env.REACT_APP_FRONTEND_API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Registration failed');
      }

      const result = await response.json();
      setMessage('Registration successful!');

      onRegisterSuccess?.({
        user: { _id: result._id, name: result.name, email: result.email },
        token: result.token
      });
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md border-secondary-100/80">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start building and testing AI prompts in minutes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="register-name">Name</Label>
            <Input id="register-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-confirm-password">Confirm password</Label>
            <Input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-secondary-600 hover:bg-secondary-700" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>

          {message && (
            <p
              className={`rounded-md border p-3 text-sm ${
                message.startsWith('Error')
                  ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
