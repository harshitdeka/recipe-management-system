// pages/AuthPage.jsx
// Shows Login or Signup form, toggled by user action

import { useState } from 'react';
import LoginForm  from '../components/LoginForm.jsx';
import SignupForm from '../components/SignupForm.jsx';

export default function AuthPage({ onLogin }) {
  const [view, setView] = useState('login'); // 'login' | 'signup'

  return view === 'login'
    ? <LoginForm  onLogin={onLogin} onSwitchToSignup={() => setView('signup')} />
    : <SignupForm onLogin={onLogin} onSwitchToLogin={()  => setView('login')}  />;
}
