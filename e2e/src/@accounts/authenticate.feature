Feature: User Registration and Login with Email and OTP
  As a user
  I want to log in or register using my email and OTP
  So that I can securely access the system without a password

  Background:
    Given I am an visitor


  Scenario: Successful registration for a new user

    When navigate to identify page
    And  enters my email
    And  clicks the next button
    Then should be on the verify otp page

    When clicks the get otp button
    And  enters my OTP
    And  clicks the next button
    Then should be on the the my-account-site
