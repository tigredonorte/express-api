import { getHeaders } from '../../util/getHeaders';

export class PostService {

  static async getPosts(page) {

    const response = await PostService.exec({
      query: `query {
        listPosts(page: ${page}) {
          posts {
            _id, title, content, image, creator { name }, createdAt
          },
          total
        }
      }`,
    }, 'Failure fetching posts');
    return {
      ...response.data.listPosts, 
      posts: response.data.listPosts.posts.map(PostService.mapSinglePost)
    };
  }

  static async get(id) {
    const resData = await PostService.exec({
      query: `query {
        getPost(postId: "${id}") {
           _id, title, content, image, creator { name }, createdAt
        }
      }`,
    }, 'Failure fetch post');
    return PostService.mapSinglePost(resData.data.getPost);
  }

  static async upsertPost(postData, id) {
    const method = !id ? 'createPost' : 'editPost';
    const arg = !id ? '' : `postId: "${id}", `;
    console.log(arg);
    // const formData = new FormData();
    // for (const i in postData) {
    //   if (postData[i]) {
    //     formData.append(i, postData[i]);
    //   }
    // }
    const responseData = await PostService.exec({
      query: `mutation {
        ${method}(${arg}postData: {
          title: "${postData.title}",
          content: "${postData.content}"
        }) {
          _id, title, content, image, creator { name }, createdAt
        }
      }`,
    }, 'Failure fetching posts');
    return PostService.mapSinglePost(responseData.data[method]);
  }

  static async deletePost(postId) {
    return await PostService.exec({
      query: `mutation {
        deletePost(postId: "${postId}")
      }`,
    }, 'Deleting a post failed!');
  }

  static mapSinglePost(post) {
    if (!post.imageUrl && post.image) {
      post.imageUrl = `${process.env.REACT_APP_BASE_URL}/public/images/${post.image}`;
    }
    return post;
  }

  static async exec(body, defaultErrorMessage) {
    const res = await fetch(`${process.env.REACT_APP_BASE_URL}/graphql`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    const resData = await res.json();
    if (resData.errors) {
      throw new Error(resData.errors[0].message || defaultErrorMessage);
    }

    if (resData.status > 299) {
      if (resData.status === 422) {
        let msg = '';
        for (const i in resData.error) {
          msg += `${resData.error[i].param}: ${resData.error[i].msg}\n\n`;
        }
        throw new Error(msg);
      }
      throw new Error(resData.message ? resData.message : defaultErrorMessage);
    }

    return resData;
  }
}
