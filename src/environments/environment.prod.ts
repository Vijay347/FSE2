export const environment = {
  production: true,
  awsCognitoSettings: {
    mandatorySignIn: true,
    region: 'us-east-1',
    userPoolId: 'us-east-1_u3t4ChEoU',
    userPoolWebClientId: '1robhrct7t6nb3pa6u97ovv62l',
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  },
  // gatewayAPIRoot: 'http://localhost:5000',
  gatewayAPIRoot: 'http://localhost:8001'
};
