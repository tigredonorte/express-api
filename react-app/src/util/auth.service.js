export class AuthService {
  static async authenticate(data, method) {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(method === 'signup' ? AuthService.signupData(data): AuthService.loginData(data)),
    });

    const resData = await res.json();
    if (resData.errors) {
      throw new Error(resData.errors[0].message || 'Operation error!');
    }

    if (!resData.data[method].token) {
      throw new Error('Unable to authenticate! Token Invalid!');
    }

    localStorage.setItem('token', resData.data[method].token);
    localStorage.setItem('userId', resData.data[method].userId);
    const remainingMilliseconds = 60 * 60 * 1000;
    const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
    localStorage.setItem('expiryDate', expiryDate.toISOString());
    return { ...resData, remainingMilliseconds };
  }

  static signupData({name, email, password, confirm_password}) {
    return {
      query: `mutation {
        signup(userInput: {
          name: "${name}",
          email: "${email}",
          password: "${password}",
          confirm_password: "${confirm_password}"
        }) {
          token, user {
            _id, name
          }
        }
      }`
    };
  }
  
  static loginData({email, password}) {
    return {
      query: `query {
        login(userInput: {
          email: "${email}",
          password: "${password}",
        }) {
          token, userId
        }
      }`,
    };
  }
}
