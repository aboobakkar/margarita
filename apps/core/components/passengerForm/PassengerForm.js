// @flow

import * as React from 'react';
import { View, ScrollView } from 'react-native';
import {
  StyleSheet,
  SegmentedButton,
  Picker,
  TextInput,
  Button,
  Modal,
} from '@kiwicom/universal-components';
import { defaultTokens } from '@kiwicom/orbit-design-tokens';
import {
  withAlertContext,
  type AlertContent,
  type AlertContextState,
  DateInput,
} from '@kiwicom/margarita-components';
import { createFragmentContainer, graphql } from '@kiwicom/margarita-relay';
import {
  getYear,
  setYear,
  setMonth,
  getDaysInMonth,
  setDate,
  getDate,
  getMonth,
} from 'date-fns';

import { type PassengerType } from '../../contexts/bookingContext/BookingContext';
import BaggageBundles from './baggageBundles/BaggageBundles';
import type { PassengerForm_itinerary as PassengerFormType } from './__generated__/PassengerForm_itinerary.graphql';
import { type BaggageBundleType } from './baggageBundles/__generated__/BaggageBundle_bagOption.graphql';

type Props = {|
  +itinerary: ?PassengerFormType,
  +isVisible: boolean,
  +isEditing: boolean,
  +onRequestClose: () => void,
  +prefillData: ?PassengerType,
  +onRequestSave: PassengerType => void,
  +setAlertContent: (alertContent: AlertContent | null) => void,
|};

const genderData = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const nationalityData = [
  {
    label: 'Czechia',
    value: 'CZ',
  },
  {
    label: 'Croatia',
    value: 'HR',
  },
];

const maxAge = 110;

const initialFormState = {
  gender: 'male',
  name: null,
  lastName: null,
  id: null,
  nationality: null,
  date: {
    day: '',
    month: '',
    year: '',
  },
  inputErrors: {
    day: '',
    year: '',
  },
  bags: null,
  passengerCount: 1,
};

type State = {
  +name: ?string,
  +lastName: ?string,
  +gender: 'female' | 'male' | 'other',
  +nationality: ?string,
  +id: ?string,
  +insurance?: ?string,
  +bags: null | Array<BaggageBundleType>,
  +visaRequired?: ?boolean,
  date: {
    day: string,
    month: string,
    year: string,
  },
  inputErrors: {
    day: string,
    year: string,
  },
  hasPrefilledState: boolean,
};

class PassengerForm extends React.Component<Props, State> {
  state = {
    ...initialFormState,
    hasPrefilledState: false,
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    // reset form into initial state when closing
    if (!props.isVisible) {
      return { ...initialFormState, hasPrefilledState: false };
    }
    const editModeOpened = props.isEditing && !state.hasPrefilledState;
    // If is in edit mode preload passenger data into the form state
    if (editModeOpened) {
      if (props.prefillData && props.prefillData.dateOfBirth) {
        const { dateOfBirth } = props.prefillData;
        const date = {
          day: String(getDate(dateOfBirth)),
          month: String(getMonth(dateOfBirth)),
          year: String(getYear(dateOfBirth)),
        };
        return {
          ...props.prefillData,
          hasPrefilledState: true,
          date,
        };
      }
    }

    return state;
  }

  handleGenderChange = (gender: any) => {
    this.setState({ gender });
  };

  handleNameChange = (name: string) => {
    this.setState({ name });
  };

  handleLastNameChange = (lastName: string) => {
    this.setState({ lastName });
  };

  handleBirthDateSubmit = (dateOfBirth: string, type: string) => {
    this.setState(state => {
      return {
        ...state,
        date: {
          ...state.date,
          [type]: dateOfBirth,
        },
      };
    });
  };

  validateYear = (year: number): boolean => {
    return year > getYear(new Date()) - maxAge && year <= getYear(new Date());
  };

  handleInvalidDate = (timePeriod, message) => {
    this.setState(state => {
      return {
        ...state,
        inputErrors: {
          ...state.inputErrors,
          [timePeriod]: message,
        },
      };
    });
  };

  handleDateValidation = () => {
    const day = parseInt(this.state.date.day, 10);
    const month = parseInt(this.state.date.month, 10);
    const year = parseInt(this.state.date.year, 10);

    let date = new Date();

    if (!day) {
      this.handleInvalidDate('day', 'Please fill in the field');
    } else {
      this.resetError('day');
    }
    if (!year) {
      this.handleInvalidDate('year', 'Please fill in the field');
      return false;
    }
    this.resetError('year');

    const isYearValid = this.validateYear(year);
    if (!isYearValid) {
      this.handleInvalidDate('year', 'Please input valid year');
      return false;
    }
    this.resetError('year');
    date = setYear(date, year);

    if (month) {
      date = setMonth(date, month);
    } else {
      return false;
    }
    const daysInMonth = getDaysInMonth(date);
    if (day > 0 && day <= daysInMonth) {
      date = setDate(date, day);
      this.resetError('day');
    } else {
      this.handleInvalidDate('day', 'Please input valid day');
      return false;
    }
    return date;
  };

  resetError = timePeriod => {
    this.setState(state => {
      return {
        ...state,
        inputErrors: {
          ...state.inputErrors,
          [timePeriod]: '',
        },
      };
    });
  };

  handleNationalityChange = (nationality: ?string) => {
    this.setState({ nationality });
  };

  handleIdChange = (id: ?string) => {
    this.setState({ id });
  };

  handleSavePress = () => {
    const dateOfBirth = this.handleDateValidation();
    if (dateOfBirth) {
      const { nationality, id, lastName, name, gender, bags } = this.state;
      const newPassenger = {
        nationality,
        id,
        dateOfBirth,
        gender,
        name,
        lastName,
        bags,
      };
      this.props.onRequestSave(newPassenger);
    }
  };

  requestClose = () => {
    this.props.onRequestClose();
  };

  handleSelectedBaggageBundle = bags => {
    this.setState({ bags: [bags] });
  };

  render() {
    return (
      <Modal
        style={styles.modal}
        isVisible={this.props.isVisible}
        onRequestClose={this.requestClose}
      >
        <ScrollView style={styles.formContainer}>
          <View style={[styles.form, styles.widthLimit]}>
            <SegmentedButton
              segmentsData={genderData}
              selectedValue={this.state.gender}
              onValueChange={this.handleGenderChange}
            />
            <TextInput
              onChangeText={this.handleNameChange}
              label="Given names"
              autoCorrect={false}
              type="text"
              value={this.state.name}
              formLabelContainerStyle={styles.inputLabel}
            />
            <TextInput
              onChangeText={this.handleLastNameChange}
              label="Last name"
              autoCorrect={false}
              value={this.state.lastName}
              type="text"
              formLabelContainerStyle={styles.inputLabel}
            />
            <TextInput
              onChangeText={this.handleIdChange}
              label="Passport or ID number"
              autoCorrect={false}
              type="text"
              value={this.state.id}
              formLabelContainerStyle={styles.inputLabel}
            />
            <DateInput
              onDateChange={this.handleBirthDateSubmit}
              date={this.state.date}
              errors={this.state.inputErrors}
            />
            <Picker
              selectedValue={this.state.nationality}
              optionsData={nationalityData}
              onValueChange={this.handleNationalityChange}
              placeholder="Select"
              confirmLabel="OK"
              label="Nationality"
              formLabelContainerStyle={styles.inputLabel}
            />
            <BaggageBundles
              onSelectedBaggageBundle={this.handleSelectedBaggageBundle}
              itinerary={this.props.itinerary}
            />
          </View>
        </ScrollView>
        <View style={[styles.menuRow, styles.widthLimit]}>
          <View style={styles.menuButtonWrap}>
            <Button
              block={true}
              label="Close"
              type="secondary"
              onPress={this.requestClose}
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.menuButtonWrap}>
            <Button block={true} label="Save" onPress={this.handleSavePress} />
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  formContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: defaultTokens.paletteWhite,
    web: {
      backgroundColor: 'transparent',
    },
  },
  form: {
    alignSelf: 'center',
    backgroundColor: defaultTokens.paletteWhite,
    paddingHorizontal: parseInt(defaultTokens.spaceMedium, 10),
    paddingTop: 72,
    paddingBottom: 120,
    web: {
      paddingTop: parseInt(defaultTokens.spaceMedium, 10),
      paddingBottom: 88,
      borderTopStartRadius: parseInt(defaultTokens.borderRadiusBadge, 10),
      borderTopEndRadius: parseInt(defaultTokens.borderRadiusBadge, 10),
      marginTop: parseInt(defaultTokens.spaceXXLarge, 10),
    },
  },
  widthLimit: {
    width: '100%',
    web: {
      maxWidth: 414,
    },
  },
  menuRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: defaultTokens.paletteWhite,
    borderColor: defaultTokens.borderColorTableCell,
    borderTopWidth: parseInt(defaultTokens.borderWidthCard, 10),
    borderStartWidth: parseInt(defaultTokens.borderWidthCard, 10),
    borderEndWidth: parseInt(defaultTokens.borderWidthCard, 10),
    borderTopStartRadius: parseInt(defaultTokens.borderRadiusBadge, 10),
    borderTopEndRadius: parseInt(defaultTokens.borderRadiusBadge, 10),
    paddingHorizontal: parseInt(defaultTokens.spaceMedium, 10),
    paddingTop: parseInt(defaultTokens.spaceSmall, 10),
    paddingBottom: parseInt(defaultTokens.spaceXXLarge, 10),
    web: {
      paddingBottom: parseInt(defaultTokens.spaceMedium, 10),
    },
  },
  menuButtonWrap: {
    flex: 1,
  },
  spacer: {
    width: parseInt(defaultTokens.spaceXSmall, 10),
  },
  inputLabel: {
    marginTop: parseInt(defaultTokens.spaceSmall, 10),
  },
});

const selectAlertContextState = ({
  actions: { setAlertContent },
}: AlertContextState) => ({
  setAlertContent,
});

export default createFragmentContainer(
  withAlertContext(selectAlertContextState)(PassengerForm),
  {
    itinerary: graphql`
      fragment PassengerForm_itinerary on ItineraryInterface {
        ...BaggageBundles_itinerary
      }
    `,
  },
);
