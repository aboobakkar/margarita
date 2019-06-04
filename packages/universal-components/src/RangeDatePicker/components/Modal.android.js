// @flow

import * as React from 'react';
import { Portal } from 'react-native-paper';

import { Modal as UCModal } from '../../Modal';
import type { Props } from '../../Modal/ModalTypes';

export default function Modal(props: Props) {
  return (
    <Portal>
      <UCModal {...props} />
    </Portal>
  );
}
