import { getHeaders } from '../../util/getHeaders';

const baseUrl = `${process.env.REACT_APP_BASE_URL}/feed`;
export class FeedService {
  static async getPosts(page) {
    const res = await fetch(`${baseUrl}/posts?page=${page}`, {
      headers: getHeaders()
    });
    if (res.status !== 200) {
      throw new Error(res.message ? res.message : 'Failed to fetch posts.');
    }
    return await res.json();
  }

  static async get(id) {
    const res = await fetch(`${baseUrl}/posts/${id}`, {
      headers: getHeaders()
    });
    if (res.status !== 200) {
      throw new Error('Failed to fetch status');
    }
    return res.json();
  }

  static async upsertPost(postData) {
    const method = postData._id ? 'PATCH' : 'POST';
    const res = await fetch(`${baseUrl}/${postData._id ? postData._id : ''}`, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(postData),
    });

    if (res.status !== 200 && res.status !== 201) {
      throw new Error('Creating or editing a post failed!');
    }
    return await res.json();
  }

  static async deletePost(postId) {
    const res = await fetch(`${baseUrl}/${postId}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('token'),
      },
    });

    if (res.status !== 204) {
      throw new Error(res.message || 'Deleting a post failed!');
    }
  }

  static async updateStatus() {
    const res = await fetch('URL');

    if (res.status !== 201 && res.status !== 204) {
      throw new Error("Can't update status!");
    }
    const resData = await res.json();
    console.log(resData);
  }
}
