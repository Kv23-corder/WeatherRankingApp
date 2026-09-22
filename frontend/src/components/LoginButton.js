import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function LoginButton() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isAuthenticated) {
    return (
      <div className="auth-box">
        <span>Welcome, {user.name}</span>
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <button className="login-btn" onClick={() => loginWithRedirect()}>
      Log in
    </button>
  );
}

export default LoginButton;
