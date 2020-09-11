import React, { Component } from 'react';
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';

import store, { AmplifyBridge } from './store';

import { Navigator, Main } from './components';
import './App.css';
import '@aws-amplify/ui/dist/style.css';

Amplify.configure(aws_exports)
new AmplifyBridge(store)
class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Navigator />
        <Main />
      </React.Fragment>
    );
  }
}

export default App;
