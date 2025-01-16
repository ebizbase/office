Feature: Redirect unauthenticated users to Accounts site

  As a user
  I want to be redirected to the Accounts site when I access My Account without logging in
  So that I can log in and access my account information

  Background:
    Given I am an unauthenticated visitor

  Scenario: Unauthenticated user tries to access My Account site
    When I navigate to "/" on "my-account" site
    Then I should be redirected to "accounts" site


