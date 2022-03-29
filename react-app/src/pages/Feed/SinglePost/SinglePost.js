import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import { FeedService } from '../feed.service';
import './SinglePost.css';

class SinglePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      author: '',
      date: '',
      image: '',
      content: ''
    };
  }

  async componentDidMount() {
    try {
      const postId = this.props.match.params.postId;
      const post = await FeedService.get(postId);
      this.setState({
        title: post.title,
        author: post.creator.name,
        date: new Date(post.createdAt).toLocaleDateString('en-US'),
        content: post.content,
        image: post.image,
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
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
