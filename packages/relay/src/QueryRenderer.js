// @flow

import * as React from 'react';
import { View } from 'react-native';
import { Loader, StyleSheet } from '@kiwicom/universal-components';
import {
  QueryRenderer as KiwiQueryRenderer,
  type GraphQLTaggedNode,
} from '@kiwicom/relay';
import { IllustrationWithInformation } from '@kiwicom/margarita-components';

import environment from './Environment';

type Props = {|
  +render: (props: Object) => React.Element<any>,
  +query: GraphQLTaggedNode,
  +variables?: Object,
|};

export default class QueryRenderer extends React.Component<Props> {
  onSystemError = ({ error }: { error: Error, retry: ?() => void }) => {
    return (
      <IllustrationWithInformation
        illustrationName="Error"
        text="Something went wrong"
        description={error.message}
      />
    );
  };

  onLoading = () => {
    return (
      <View style={styles.container}>
        <Loader size="large" />
      </View>
    );
  };

  render() {
    return (
      <KiwiQueryRenderer
        variables={this.props.variables}
        environment={environment}
        query={this.props.query}
        onResponse={this.props.render}
        onSystemError={this.onSystemError}
        onLoading={this.onLoading}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
});
