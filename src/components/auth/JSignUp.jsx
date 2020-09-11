import React, { Component } from 'react';
import { BDiv, Form, Button, Alert, Row, Col, BA } from 'bootstrap-4-react';
import { Auth, Logger } from 'aws-amplify';

const logger = new Logger('JSignUp');

export default class JSignUp extends Component {
  constructor(props) {
    super(props);
    this.signUp = this.signUp.bind(this);
    this.changeState = this.changeState.bind(this);
    this.inputs = {};
    this.state = { error: '' }
  }

  changeState(state, data) {
    const { onStateChange } = this.props;
    if (onStateChange) {
      onStateChange(state, data);
    }
  }

  signUp() {
    const { username, password, confirmPassword } = this.inputs;
    if (!username) {
      this.signUpError(new Error('Email cannot be empty'))
    } else if (!password) {
      this.signUpError(new Error('Password cannot be empty'))
    } else if (!confirmPassword || password !== confirmPassword) {
      this.signUpError(new Error('Passwords must match'))
    } else {
      logger.info('sign up with ' + username);
      Auth.signUp(username, password)
        .then(() => this.signUpSuccess(username))
        .catch(err => this.signUpError(err));
    }
  }

  signUpSuccess(username) {
    logger.info('sign up success with ' + username);
    this.setState({ error: '' });

    this.changeState('confirmSignUp', username);
  }

  signUpError(err) {
    logger.info('sign up error', err);
    let message = err.message || err;
    if (message.startsWith('PreSignUp failed with error Invalid email domain:')) {
      message = 'Please supply a valid email domain.'
    } else if (message.includes(`Value at 'password' failed to satisfy constraint`)) {
      message = 'Password must be at least 8 characters and include a lowercase letter, an uppercase letter, and a number'
    }
    this.setState({ error: message });
  }

  render() {
    const { authState } = this.props;
    if (authState !== 'signUp') { return null; }

    const style = {
      width: '20rem',
      input: { borderRadius: '0' },
      links: { fontSize: '0.9em' },
      button: { width: '100%' },
      alert: { fontSize: '0.8em' }
    }

    const { error } = this.state;

    return (
      <BDiv display="flex" flex="column" alignItems="center">
        <Form style={style} preventDefault>
          <Form.Input
            type="text"
            placeholder="Email"
            rounded="top"
            border="bottom-0"
            style={style.input}
            onChange={event => this.inputs.username = event.target.value}
            autoFocus
          />
           <Form.Input
            type="password"
            placeholder="Password"
            border="bottom-0"
            onChange={event => this.inputs.password = event.target.value}
            style={style.input}
          />
          <Form.Input
            type="password"
            placeholder="Confirm Password"
            rounded="bottom"
            onChange={event => this.inputs.confirmPassword = event.target.value}
            style={style.input}
          />
          <Row my="2" style={style.links}>
            <Col text="left">
              <BA href="#" preventDefault onClick={() => this.changeState('signIn')}>
                Back to sign in
              </BA>
            </Col>
            <Col text="right">
              <BA href="#" preventDefault onClick={() => this.changeState('confirmSignUp')}>
                Confirm a code
              </BA>
            </Col>
          </Row>
          <Button
            primary
            mt="3"
            style={style.button}
            onClick={this.signUp}
          >
            Create account
          </Button>
          { error && <Alert warning mt="3" text="left" style={style.alert}>{error}</Alert> }
        </Form>
      </BDiv>
    )
  }
}