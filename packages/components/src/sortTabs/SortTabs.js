// @flow

import * as React from 'react';
import { View, Platform } from 'react-native';
import { defaultTokens } from '@kiwicom/orbit-design-tokens';
import { StyleSheet } from '@kiwicom/universal-components';
import {
  withLayoutContext,
  LAYOUT,
  type LayoutContextState,
} from '@kiwicom/margarita-device';

import SortTab from './SortTab';

export type SortIconTypes = 'thumb-up' | 'money' | 'clock';
export type SortTypes = 'QUALITY' | 'PRICE' | 'DURATION';
type SortTabsDataType = $ReadOnlyArray<{|
  +label: string,
  +value: SortTypes,
  +icon: SortIconTypes,
|}>;

export type PriceDurationInfo = {|
  +price: ?string,
  +currency: ?string,
  +duration: ?string,
|};

export type Props = {|
  +selectedValue: ?SortTypes,
  +onValueChange: SortTypes => void,
  +priceDurationParams?: {
    QUALITY: ?PriceDurationInfo,
    PRICE: ?PriceDurationInfo,
    DURATION: ?PriceDurationInfo,
  },
  +layout: number,
|};

export const SortTabsData: SortTabsDataType = [
  { label: 'Best', value: 'QUALITY', icon: 'thumb-up' },
  { label: 'Cheapest', value: 'PRICE', icon: 'money' },
  { label: 'Fastest', value: 'DURATION', icon: 'clock' },
];

const SortTabs = ({
  selectedValue,
  onValueChange,
  priceDurationParams,
  layout,
}: Props) => {
  const mobileLayout = layout < LAYOUT.largeMobile || Platform.OS !== 'web';
  const SortTabsList = SortTabsData.map((SortTabData, index) => {
    const { value, label, icon } = SortTabData;
    return (
      <SortTab
        mobileLayout={mobileLayout}
        key={value}
        label={label}
        value={value}
        isFirst={index === 0}
        icon={icon}
        isLast={index === SortTabsData.length - 1}
        isActive={value === selectedValue}
        onPress={onValueChange}
        additionalInfo={priceDurationParams && priceDurationParams[value]}
      />
    );
  });
  return (
    <View
      style={mobileLayout ? styles.containerMobile : styles.containerDesktop}
    >
      {SortTabsList}
    </View>
  );
};

const styles = StyleSheet.create({
  containerDesktop: {
    backgroundColor: defaultTokens.backgroundButtonSecondary,
    flexDirection: 'row',
    borderRadius: parseInt(defaultTokens.borderRadiusNormal, 10),
    paddingHorizontal: parseInt(defaultTokens.spaceXXXSmall, 10),
    paddingTop: parseInt(defaultTokens.spaceXXXSmall, 10),
    paddingBottom: parseInt(defaultTokens.spaceXXXSmall, 10),
  },
  containerMobile: {
    backgroundColor: defaultTokens.backgroundButtonSecondary,
    flexDirection: 'column',
    paddingTop: 1,
    paddingBottom: 1,
  },
});

const layoutSelect = ({ layout }: LayoutContextState) => ({
  layout,
});

export default withLayoutContext(layoutSelect)(SortTabs);
