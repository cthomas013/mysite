import React, { Component } from 'react';
import { S3Album } from 'aws-amplify-react';
import { Unauthorized, Unexpected } from '../components';

const padding = n => {
  return n > 9 ? n : '0' + n;
}

const today = () => {
  const dt = new Date();
  return [
    dt.getFullYear(),
    padding(dt.getMonth() + 1),
    padding(dt.getDate())
  ].join('-');
}

const album_path = user_id => {
  return user_id + '/' + today() + '/';
}

export default class Home extends Component {
  render() {
    const { user } = this.props;

    if (!user) { return <Unauthorized /> }
    if (!user.id) { return <Unexpected /> }

    return (
      <React.Fragment>
        <S3Album path={album_path(user.id)} picker />
      </React.Fragment>
    )
  }
}