Feature: Redirect to identify page

  As an unauthenticated visitor,
  I want to be redirected to the identify page
  so that I can start the authentication process before accessing the account site.

  Background:
    Given I am an unauthenticated visitor

  Scenario: Redirect to /identify on accounts site
    When I navigate to "/" on "accounts" site
    Then I should be redirected to "/identify" on "accounts" site
