import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_COGNITO_APP_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: process.env.REACT_APP_COGNITO_DOMAIN,
          scopes: ["email", "openid", "profile"],
          redirectSignIn: [window.location.origin],
          redirectSignOut: [window.location.origin],
          responseType: "code",
          providers: ["GitHub"],
        },
      },
    },
  },
});
