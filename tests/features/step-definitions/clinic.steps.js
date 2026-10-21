const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I am on the MediCare+ home page', async function () {
  await this.clinic.open();
});

Given('I am on the doctor search page', async function () {
  await this.clinic.open();
});

When('I select the specialty {string}', async function (specialty) {
  await this.clinic.selectSpecialty(specialty);
});

Then('I should see at least {int} doctor listed', async function (min) {
  await this.clinic.expectDoctorsListed(min);
});

When('I click {string} on the first doctor in the list', async function (label) {
  await this.clinic.clickOnFirstDoctor();
});

When('I click {string} on the first doctor in the filtered list', async function (label) {
  await this.clinic.clickOnFirstDoctor();
});

When('I click the {string} button', async function (label) {
  await this.clinic.button(label).click();
});

When('I click on {string} in the navigation bar', async function (label) {
  await this.clinic.goToMyAppointments();
});

When('I navigate to {string}', async function (label) {
  await this.clinic.goToMyAppointments();
});

Then('the doctor booking details page should be displayed', async function () {
  await this.clinic.expectDetailsPage();
});

Then('{string} should be selected by default', async function (name) {
  await this.clinic.expectConsultationSelected();
});

When('I select an available date', async function () {
  await this.clinic.selectAvailableDate();
});

When('I select an available time slot', async function () {
  await this.clinic.selectAvailableSlot();
});

Then('the {string} button should be disabled', async function (label) {
  await expect(this.clinic.button(label)).toBeDisabled();
});

Then('the {string} button should be enabled', async function (label) {
  await expect(this.clinic.button(label)).toBeEnabled();
});

Then('the Sunday option should be disabled', async function () {
  await this.clinic.expectSundayDisabled();
});

When('I enter {string} in the search box', async function (text) {
  await this.clinic.searchDoctor(text);
});

Given('I searched for {string}', async function (text) {
  await this.clinic.searchDoctor(text);
});

When('I clear the search box', async function () {
  await this.clinic.clearSearch();
});

Then('only doctors matching {string} should be displayed in the results', async function (text) {
  await this.clinic.expectOnlyDoctorsMatching(text);
});

When('I select the gender filter {string}', async function (label) {
  await this.clinic.selectGender(label);
});

When('I select the fee filter {string}', async function (label) {
  await this.clinic.selectFee(label);
});

When('I check the {string} filter', async function (label) {
  await this.clinic.checkAvailableToday();
});

When('I select the sort option {string}', async function (label) {
  await this.clinic.selectSort(label);
});

Then('all displayed doctors should be female', async function () {
  await this.clinic.expectAllDoctorsFemale();
});

Then('all displayed doctors should match the gender {string}', async function (label) {
  await this.clinic.expectAllDoctorsGender(label);
});

Then('all displayed consultation fees should be between {string} and {string}', async function (min, max) {
  await this.clinic.expectFeesBetween(min, max);
});

Then('all displayed doctors should have fees within {string}', async function (bracket) {
  await this.clinic.expectAllFeesWithin(bracket);
});

Then('all displayed doctor cards should show the {string} badge', async function (badge) {
  await this.clinic.expectAllCardsShow(badge);
});

Then('the doctors should be listed in descending order of years of experience', async function () {
  await this.clinic.expectSortedByExperienceDesc();
});

Then('the doctors should be listed in descending order of rating', async function () {
  await this.clinic.expectSortedByRatingDesc();
});

Then('the doctor count text should update to reflect only Cardiology doctors', async function () {
  await this.clinic.expectCountTextMatchesCards();
});

Then('I should see {string} listed', async function (text) {
  await this.clinic.expectText(text);
});

Then('a {string} message should be displayed', async function (text) {
  await this.clinic.expectText(text);
});

Then('all {int} doctors should be visible again', async function (n) {
  await this.clinic.expectDoctorCount(n);
});

Then('all {int} doctors should be displayed', async function (n) {
  await this.clinic.expectDoctorCount(n);
});

Given('I have filtered by gender {string} and specialty {string}', async function (gender, specialty) {
  this.specialty = specialty;
  await this.clinic.selectGender(gender);
  await this.clinic.selectSpecialty(specialty);
});

When('I select {string} and clear the specialty filter', async function (gender) {
  await this.clinic.selectGender(gender);
  await this.clinic.clearSpecialty(this.specialty);
});

Given('I have selected an available slot for {string}', async function (name) {
  await this.clinic.selectSlotForDoctor(name);
});

When('I enter valid patient details', async function () {
  await this.clinic.enterValidPatientDetails();
});

When('I submit the form with invalid {string} as {string}', async function (field, value) {
  await this.clinic.submitWithInvalid(field, value);
});

When('I confirm the booking', async function () {
  await this.clinic.confirmBooking();
});

Then('an error message should be displayed for {string}', async function (field) {
  await this.clinic.expectFieldError(field);
});

Then('the booking confirmation should not proceed', async function () {
  await this.clinic.expectBookingNotConfirmed();
});

Then('a booking confirmation message should be displayed', async function () {
  await this.clinic.expectBookingConfirmed();
});

Given('I have a booked appointment', async function () {
  await this.clinic.bookAppointmentViaUI();
});

Then('the appointment should appear under {string}', async function (label) {
  await this.clinic.goToMyAppointments();
  await this.clinic.expectBookedAppointmentListed();
});

Then('my scheduled appointment details should be visible', async function () {
  await this.clinic.expectBookedAppointmentListed();
});

Then('options to {string} and {string} should be available', async function (a, b) {
  await expect(this.clinic.button(a).first()).toBeVisible();
  await expect(this.clinic.button(b).first()).toBeVisible();
});

When('I click {string} on the active appointment', async function (label) {
  await this.clinic.clickOnAppointment(label);
});

When('I pick a new available date and time slot', async function () {
  await this.clinic.pickNewSlot();
});

When('I confirm the new slot', async function () {
  await this.clinic.confirmNewSlot();
});

Then('the appointment should reflect the updated schedule', async function () {
  await this.clinic.expectScheduleUpdated();
});

When('I confirm the cancellation prompt', async function () {
  await this.clinic.confirmCancellation();
});

Then('the appointment should be marked as {string}', async function (status) {
  await this.clinic.expectAppointmentStatus(status);
});

When('I choose to keep the appointment', async function () {
  await this.clinic.keepAppointment();
});