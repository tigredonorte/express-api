import React, { Component } from 'react';

import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { required, length, email, equal } from '../../util/validators';
import Auth from './Auth';

class Signup extends Component {
  state = {
    form: {
      email: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, email],
      },
      password: {
        value: '',
        valid: false,
        touched: false,
        validators: [required, length({ min: 5 })],
      },
      confirm_password: {
        value: '',
        valid: false,
        touched: false,
        validators: [equal(() => this.state.form.password.value).bind(this)],
      },
      name: {
        value: '',
        valid: false,
        touched: false,
        validators: [required],
      },
    },
    formIsValid: false,
  };

  inputChangeHandler = (input, value) => {
    this.setState((prevState) => {
      let isValid = true;
      for (const validator of prevState.form[input].validators) {
        isValid = isValid && validator(value);
      }
      const updatedForm = {
        ...prevState.form,
        [input]: {
          ...prevState.form[input],
          valid: isValid,
          value: value,
        },
      };
      let formIsValid = true;
      for (const inputName in updatedForm) {
        formIsValid = formIsValid && updatedForm[inputName].valid;
      }
      return {
        form: updatedForm,
        formIsValid: formIsValid,
      };
    });
  };

  inputBlurHandler = (input) => this.setState((prevState) => ({
    form: {
      ...prevState.form,
      [input]: {
        ...prevState.form[input],
        touched: true,
      },
    },
  }));

  onSubmit = (event) => {
    const output = {};
    for (const inputName in this.state.form) {
      if (!this.state.form[inputName].value) {
        return false;
      }
      output[inputName] = this.state.form[inputName].value;
    }
    this.props.onSignup(event, output);
  }

  render() {
    return (
      <Auth>
        <form
          onSubmit={this.onSubmit}
        >
          <Input
            id="name"
            label="Your Name"
            type="text"
            control="input"
            onChange={this.inputChangeHandler}
            onBlur={this.inputBlurHandler.bind(this, 'name')}
            value={this.state.form['name'].value}
            valid={this.state.form['name'].valid}
            touched={this.state.form['name'].touched}
          />
          <Input
            id="email"
            label="Your E-Mail"
            type="email"
            control="input"
            onChange={this.inputChangeHandler}
            onBlur={this.inputBlurHandler.bind(this, 'email')}
            value={this.state.form['email'].value}
            valid={this.state.form['email'].valid}
            touched={this.state.form['email'].touched}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            control="input"
            onChange={this.inputChangeHandler}
            onBlur={this.inputBlurHandler.bind(this, 'password')}
            value={this.state.form['password'].value}
            valid={this.state.form['password'].valid}
            touched={this.state.form['password'].touched}
          />
          <Input
            id="confirm_password"
            label="Confirm Password"
            type="password"
            control="input"
            onChange={this.inputChangeHandler}
            onBlur={this.inputBlurHandler.bind(this, 'confirm_password')}
            value={this.state.form['confirm_password'].value}
            valid={this.state.form['confirm_password'].valid}
            touched={this.state.form['confirm_password'].touched}
          />
          <Button
            design="raised"
            type="submit"
            loading={this.props.loading}
            disabled={!this.state.formIsValid}
          >
            Signup
          </Button>
        </form>
      </Auth>
    );
  }
}

export default Signup;
