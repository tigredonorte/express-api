import { getHeaders } from '../../util/getHeaders';

const baseUrl = `${process.env.REACT_APP_BASE_URL}/feed/posts`;
export class PostService {

  static async getPosts(page) {
    const res = await fetch(`${baseUrl}/?page=${page}`, {
      headers: getHeaders(),
    });

    if (res.status !== 200) {
      throw new Error(res.message ? res.message : 'Failed to fetch posts.');
    }

    const data = await res.json();
    return {
      ...data, 
      posts: data.posts.map(PostService.mapSinglePost)
    };
  }

  static async get(id) {
    const res = await fetch(`${baseUrl}/${id}`, {
      headers: getHeaders(),
    });
    if (res.status !== 200) {
      throw new Error('Failed to fetch status');
    }
    return PostService.mapSinglePost(await res.json());
  }

  static async upsertPost(postData, id) {
    const method = id ? 'PATCH' : 'POST';

    const formData = new FormData();
    for (const i in postData) {
      if (postData[i]) {
        formData.append(i, postData[i]);
      }
    }
    const res = await fetch(`${baseUrl}/${id ? id : ''}`, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: localStorage.getItem('token'),
      },
      body: formData,
    });

    const resData = await res.json();
    if (res.status !== 200 && res.status !== 201) {
      if (res.status === 422) {
        let msg = '';
        for (const i in resData.error) {
          msg += `${resData.error[i].param}: ${resData.error[i].msg}\n\n`;
        }
        throw new Error(msg);
      }
      throw new Error(`${!id ? 'Creating' : 'Editing'} post failed!`);
    }
    return PostService.mapSinglePost(resData);
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

  static mapSinglePost(post) {
    if (!post.imageUrl) {
      post.imageUrl = `${process.env.REACT_APP_BASE_URL}/public/images/${post.image}`;
    }
    return post;
  }
}
