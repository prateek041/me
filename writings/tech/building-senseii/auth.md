---
title: "Auth"
description: "How I implemented Auth in Senseii"
date: November 24, 2024
status: WIP
---

## Components

There are Four major components in the system:

- Frontend
- Backend
- AuthJS
- Database

### Tokens

There are two types of tokens:

- Backend tokens: signin/verify access tokens and refresh tokens.
- Frontend tokens: session cookies.

### Auth JS

It has the following four functions that make the application possible.

- authorize: Triggered when the user triggers the SignIn. This returns the user
  information along with Json Web Token and refresh token.
- jwt: Gets called after the **authorize** function successfully returns.
- session: called whenever session is checked. Determines what data is available
  to the Frontend.
- authorized: called on every page navigation.

```javascript
// stores the Auth.js session
async jwt({token, user}) {
  // token is the Auth.js's session token.
  // user is what was returned from the authorize callback.

  if (user){
    // First time sign
    // here we are storing the backend tokens into the Auth.js session token
    return {
      ...token,
      id: user.id,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken
    }
  }

  // Token already has the data.
  return token
}
```

```javascript
const sessionToken = encrypt({
  user,
  backendAccessToken: accessToken,
});
```

```javascript
// session callback makes the backend tokens available to application code.
async session({session, token}){
  return {
    ...session,
    accessToken: token.backendAccessToken
  }
}
```

STATUS: WIP
