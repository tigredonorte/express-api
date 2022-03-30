import { getHeaders } from '../../util/getHeaders';

const baseUrl = `${process.env.REACT_APP_BASE_URL}/feed/status`;

export class StatusService {
  static async getStatus() {
    const res = await fetch(`${baseUrl}`, {
      headers: getHeaders(),
    });

    const resData = await res.json();
    if (res.status !== 200 && res.status !== 204) {
      throw new Error(resData.message || "Can't get status!");
    }

    return resData;
  }

  static async setStatus(status) {
    const res = await fetch(`${baseUrl}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    const resData = await res.json();
    if (res.status !== 200 && res.status !== 204) {
      if (res.status === 422) {
        let msg = '';
        for (const i in resData.error) {
          msg += `${resData.error[i].param}: ${resData.error[i].msg}\n\n`;
        }
        throw new Error(msg);
      }
      throw new Error(resData.message || "Can't update status!");
    }

    return resData;
  }
}
