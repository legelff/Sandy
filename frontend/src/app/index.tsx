import React, { useState } from 'react';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';

export default function AuthScreen() {
  const [showLogin, setShowLogin] = useState(true);

  if (showLogin) {
    return <LoginScreen onNavigateToRegister={() => setShowLogin(false)} />;
  }

  return <RegistrationScreen onNavigateToLogin={() => setShowLogin(true)} />;
}
