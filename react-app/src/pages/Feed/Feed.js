import './Feed.css';

import React, { Component, Fragment } from 'react';
import openSocket from 'socket.io-client';

import Button from '../../components/Button/Button';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Post from '../../components/Feed/Post/Post';
import Input from '../../components/Form/Input/Input';
import Loader from '../../components/Loader/Loader';
import Paginator from '../../components/Paginator/Paginator';
import { PostService } from './post.service';
import { StatusService } from './status.service';

class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isEditing: false,
      posts: [],
      totalPosts: 0,
      editPost: null,
      status: '',
      postPage: 1,
      postsLoading: true,
      editLoading: false,
    };
  }
  async componentDidMount() {
    try {
      const resData = await StatusService.getStatus();
      this.setState({ status: resData.status });
    } catch (error) {
      this.catchError(error);
    }

    this.loadPosts();
    const socket = openSocket(process.env.REACT_APP_BASE_URL, {
      extraHeaders: {
        Authorization: localStorage.getItem('token'),
      },
    });
    socket.on('posts', (event) => {
      switch (event.action) {
        case 'add':
          return this.addPost(event.data);

        case 'edit':
          return this.editPost(event.data);

        case 'delete':
          return this.deletePost(event.data);
        default:
          break;
      }
    });
  }

  addPost(post) {
    this.setState((prevState) => {
      const updatedPosts = [...prevState.posts];
      if (prevState.postPage === 1) {
        updatedPosts.pop();
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        totalPosts: prevState.totalPosts + 1,
      };
    });
  }

  editPost(post) {
    this.setState((prevState) => {
      const index = prevState.posts.findIndex((it) => it._id === post._id);
      if (index === -1) {
        return {};
      }
      const updatedPosts = [...prevState.posts];
      updatedPosts[index] = post;
      return {
        posts: updatedPosts,
      };
    });
  }

  deletePost(post) {
    this.setState((prevState) => {
      const index = prevState.posts.findIndex((it) => it._id === post._id);
      if (index === -1) {
        return {};
      }
      const posts = [...prevState.posts];
      posts.splice(index, 1);
      return { posts };
    });
  }

  async loadPosts(direction) {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }

    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }

    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }

    try {
      const resData = await PostService.getPosts(page);
      this.setState({
        posts: resData.posts,
        totalPosts: resData.total,
        postsLoading: false,
      });
    } catch (error) {
      this.catchError(error);
    }
  }

  async statusUpdateHandler(event) {
    try {
      event.preventDefault();
      await StatusService.setStatus(this.state.status);
    } catch (error) {
      console.log(error);
      this.catchError(error);
    }
  }

  newPostHandler() {
    this.setState({ isEditing: true });
  }

  startEditPostHandler(postId) {
    this.setState((prevState) => {
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };
      return {
        isEditing: true,
        editPost: loadedPost,
      };
    });
  }

  cancelEditHandler() {
    this.setState({ isEditing: false, editPost: null });
  }

  async finishEditHandler(postData, id) {
    this.setState({
      editLoading: true,
    });

    try {
      const { data: post } = await PostService.upsertPost(postData, id);
      this.setState((prevState) => {
        let posts = [...prevState.posts];
        if (prevState.editPost) {
          const postIndex = prevState.posts.findIndex((p) => p._id === prevState.editPost._id);
          posts[postIndex] = post;
        } else if (prevState.posts.length < 2) {
          posts = prevState.posts.concat(post);
        }
        return {
          posts,
          isEditing: false,
          editPost: null,
          editLoading: false,
        };
      });
    } catch (error) {
      console.log(error);
      this.setState({
        isEditing: false,
        editPost: null,
        editLoading: false,
        error,
      });
    }
  }

  statusInputChangeHandler(input, value) {
    this.setState({ status: value });
  }

  async deletePostHandler(postId) {
    try {
      this.setState({ postsLoading: true });
      await PostService.deletePost(postId);
      this.setState((prevState) => {
        const updatedPosts = prevState.posts.filter((p) => p._id !== postId);
        return { posts: updatedPosts, postsLoading: false };
      });
    } catch (error) {
      this.setState({ postsLoading: false });
    }
  }

  errorHandler() {
    this.setState({ error: null });
  }

  catchError(error) {
    this.setState({ error: error });
  }

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={() => this.errorHandler()} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={() => this.cancelEditHandler()}
          onFinishEdit={(data) => this.finishEditHandler(data, this.state.editPost ? this.state.editPost._id : null)}
        />
        <section className="feed__status">
          <form onSubmit={(event) => this.statusUpdateHandler(event)}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={(input, value) => this.statusInputChangeHandler(input, value)}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={() => this.newPostHandler()}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
