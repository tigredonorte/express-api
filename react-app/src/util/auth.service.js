export class AuthService {

  static async authenticate(authData, method) {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/auth/${method}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authData),
    });

    const resData = await res.json();
    if (res.status === 422) {
      throw new Error(resData.message);
    }
    if (res.status !== 201) {
      throw new Error(resData.message ? resData.message : "Operation error!");
    }

    localStorage.setItem('token', resData.token);
    localStorage.setItem('userId', resData.userId);
    const remainingMilliseconds = 60 * 60 * 1000;
    const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
    localStorage.setItem('expiryDate', expiryDate.toISOString());
    return { ...resData, remainingMilliseconds };
  }
}
