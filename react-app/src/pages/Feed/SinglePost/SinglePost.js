import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import { PostService } from '../post.service';
import './SinglePost.css';

class SinglePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      author: '',
      date: '',
      imageUrl: '',
      content: ''
    };
  }

  async componentDidMount() {
    try {
      const postId = this.props.match.params.postId;
      const post = await PostService.get(postId);
      console.log(post);
      this.setState({
        ...post,
        author: post.creator.name,
        date: new Date(post.createdAt).toLocaleDateString('en-US'),
      });
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.imageUrl} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
