import React, { Component } from 'react';
import { Container } from 'bootstrap-4-react';

export default class Unauthorized extends Component {
  render() {
    return (
      <Container text="center" p="5">
        Not Authenticated
      </Container>
    )
  }
}