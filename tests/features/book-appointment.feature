Feature: Book a doctor appointment on MediCare+

  Background:
    Given I am on the MediCare+ home page

  @smoke
  Scenario: Doctor list is displayed
    Then I should see at least 1 doctor listed

  @smoke
  Scenario Outline: Filter doctors by specialty
    When I select the specialty "<specialty>"
    Then I should see at least 1 doctor listed

    Examples:
      | specialty   |
      | Cardiology  |
      | Dermatology |

  @regression
  Scenario: Book an appointment with an available slot
    When I select the specialty "Cardiology"
    And I click "Book" on the first doctor in the list
    Then the doctor booking details page should be displayed
    And "In-clinic visit" should be selected by default
    And the "Continue" button should be disabled
    When I select an available date
    And I select an available time slot
    Then the "Continue" button should be enabled

   @negative
  Scenario: Sundays are closed
    When I select the specialty "Cardiology"
    And I click "Book" on the first doctor in the list
    Then the doctor booking details page should be displayed
    And the Sunday option should be disabled

      @regression @positive
  Scenario: Search for a doctor by name
    When I enter "Dr. Ananya Rao" in the search box
    Then only doctors matching "Dr. Ananya Rao" should be displayed in the results

  @regression @positive
  Scenario: Filter doctors by gender and fee range
    When I select the gender filter "Female"
    And I select the fee filter "₹600 – ₹1,000"
    Then all displayed doctors should be female
    And all displayed consultation fees should be between "₹600" and "₹1,000"

  @regression @positive
  Scenario: Filter doctors available today
    When I check the "Available today" filter
    Then all displayed doctor cards should show the "Available today" badge

  @regression @positive
  Scenario: Sort doctors by experience
    When I select the sort option "Most experienced"
    Then the doctors should be listed in descending order of years of experience

  @regression @positive
  Scenario: Complete end-to-end appointment booking and verify confirmation
    When I click "Book" on the first doctor in the list
    And I select an available date
    And I select an available time slot
    And I click the "Continue" button
    And I enter valid patient details
    And I confirm the booking
    Then a booking confirmation message should be displayed
    And the appointment should appear under "My appointments"

  @regression @positive
  Scenario: View and manage existing appointments
    Given I have a booked appointment
    When I click on "My appointments" in the navigation bar
    Then my scheduled appointment details should be visible
    And options to "Reschedule" and "Cancel" should be available

  @regression @positive
  Scenario: Total doctor count updates when specialty filter is applied
    When I select the specialty "Cardiology"
    Then the doctor count text should update to reflect only Cardiology doctors

    @regression @negative
  Scenario: Search with a non-existent doctor name
    When I enter "Dr. NonExistentDoctor" in the search box
    Then I should see "0 doctors" listed
    And a "No doctors match your filters" message should be displayed

  @regression @positive
  Scenario: Clear search query resets results
    Given I searched for "Dr. Ananya Rao"
    When I clear the search box
    Then all 10 doctors should be visible again

    @regression @negative
  Scenario Outline: Validate mandatory fields on patient details form
    Given I have selected an available slot for "Dr. Ananya Rao"
    And I click the "Continue" button
    When I submit the form with invalid "<field>" as "<value>"
    Then an error message should be displayed for "<field>"
    And the booking confirmation should not proceed

    Examples:
      | field        | value        |
      | Patient Name |              |
      | Phone Number | 12345        |
      | Email        | invalid-mail |

      @regression @positive
  Scenario: Reschedule an existing appointment
    Given I have a booked appointment
    When I navigate to "My appointments"
    And I click "Reschedule" on the active appointment
    And I pick a new available date and time slot
    And I confirm the new slot
    Then the appointment should reflect the updated schedule

  @regression @positive
  Scenario: Cancel an existing appointment
    Given I have a booked appointment
    When I navigate to "My appointments"
    And I click "Cancel" on the active appointment
    And I confirm the cancellation prompt
        Then the appointment should be marked as "Cancelled"

    @regression @positive
  Scenario: Reset filters to default shows all doctors
    Given I have filtered by gender "Female" and specialty "Dermatology"
    When I select "Any gender" and clear the specialty filter
    Then all 10 doctors should be displayed

      @regression @edge
  Scenario Outline: Search ignores letter case
    When I enter "<text>" in the search box
    Then only doctors matching "<text>" should be displayed in the results

    Examples:
      | text       |
      | ananya rao |
      | ANANYA RAO |

  @regression @edge @negative
  Scenario: Search with special characters shows no doctors
    When I enter "@#$%" in the search box
    Then I should see "0 doctors" listed
    And a "No doctors match your filters" message should be displayed

  @regression @edge
  Scenario: New user has no appointments
    When I click on "My appointments" in the navigation bar
    Then a "No appointments yet" message should be displayed

  @regression @edge @negative
  Scenario: Continue stays disabled until a time is chosen
    When I select the specialty "Cardiology"
    And I click "Book" on the first doctor in the list
    Then the doctor booking details page should be displayed
    When I select an available date
    Then the "Continue" button should be disabled

  @regression @edge
  Scenario: Appointment stays when the cancellation is dismissed
    Given I have a booked appointment
    When I navigate to "My appointments"
    And I click "Cancel" on the active appointment
    And I choose to keep the appointment
    Then the appointment should be marked as "Upcoming"