import React, { Component } from 'react';
import { BDiv, Form, Button, Alert, Row, Col, BA } from 'bootstrap-4-react';
import { Auth, Logger, JS } from 'aws-amplify';

const logger = new Logger('JSignIn');

export default class JSignIn extends Component {
  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.checkContact = this.checkContact.bind(this);
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

  signIn() {
    const { username, password } = this.inputs;
    if (!username) {
      this.signInError(new Error('Username cannot be empty'))
    } else if (!password) {
      this.signInError(new Error('Password cannot be empty'))
    } else {
      logger.info('sign in with ' + username);
      Auth.signIn(username, password)
        .then(user => this.signInSuccess(user))
        .catch(err => this.signInError(err));
    }
  }

  signInSuccess(user) {
    logger.info('sign in success', user);
    this.setState({ error: '' });

    // There are other sign in challenges we don't cover here.
    // SMS_MFA, SOFTWARE_TOKEN_MFA, NEW_PASSWORD_REQUIRED, MFA_SETUP ...
    if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
      console.log('User must enter a new password')
      this.changeState('requireNewPassword', user)
    } else {
      logger.info(user.challengeName)
      this.checkContact(user);
    }
  }

  signInError(err) {
    logger.info('sign in error', err);
    /*
      err can be in different structure:
        1) plain text message;
        2) object { code: ..., message: ..., name: ... }
    */
    this.setState({ error: err.message || err });
  }

  checkContact(user) {
    Auth.verifiedContact(user)
      .then(data => {
        if (!JS.isEmpty(data.verified)) {
          this.changeState('signedIn', user);
        } else {
          user = Object.assign(user, data);
          this.changeState('verifyContact', user);
        }
      });
  }


  render() {
    const { authState, authData } = this.props;
    if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) { return null; }

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
            defaultValue={authData || '' }
            onChange={event => this.inputs.username = event.target.value}
            autoFocus
          />
          <Form.Input
            type="password"
            placeholder="Password"
            rounded="bottom"
            onChange={event => this.inputs.password = event.target.value}
            style={style.input}
          />
          <Row my="2" style={style.links}>
          <Col text="left">
              New to us?{' '}
              <BA href="#" preventDefault onClick={() => this.changeState('signUp')}>
                Sign up
              </BA>
            </Col>
            <Col text="right">
              <BA href="#" preventDefault onClick={() => this.changeState('forgotPassword')}>
                Forgot password
              </BA>
            </Col>
          </Row>
          <Button
            primary
            mt="3"
            style={style.button}
            onClick={this.signIn}
          >
            Sign In
          </Button>
          { error && <Alert warning mt="3" text="left" style={style.alert}>{error}</Alert> }
        </Form>
      </BDiv>
    )
  }
}