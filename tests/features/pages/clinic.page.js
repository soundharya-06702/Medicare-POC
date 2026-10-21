const { expect } = require('@playwright/test');
const patient = require('../../../test-data/patient.json');

const GENDER = { 'Any gender': 'any', 'Female': 'female', 'Male': 'male' };
const FEE = { 'Any fee': 'any', 'Under ₹600': 'lt600', '₹600 – ₹1,000': '600-1000', 'Over ₹1,000': 'gt1000' };
const SORT = { 'Top rated': 'rating', 'Lowest fee': 'fee-asc', 'Most experienced': 'experience' };

const GENDER_ICON = { Female: '\u{1F469}', Male: '\u{1F468}' };

const FEE_RULE = {
  'Under ₹600': f => f < 600,
  '₹600 – ₹1,000': f => f >= 600 && f <= 1000,
  'Over ₹1,000': f => f > 1000,
};

const PATIENT_FIELD = {
  'Patient Name': { id: 'patient-name', error: /Enter the patient.?s name/i },
  'Phone Number': { id: 'patient-phone', error: /Phone must be 10 digits/i },
  'Email': { id: 'patient-email', error: /Enter a valid email/i },
};

const toNumber = s => Number(String(s).replace(/[^\d]/g, ''));

class ClinicPage {
  constructor(page) {
    this.page = page;
    this.bookedDoctor = '';
    this.bookedTime = '';
    this.newTime = '';
  }

  async open() {
    await this.page.goto('https://www.practiceqaautomation.com/apps/clinic');
  }

  button(label) {
    return this.page.getByRole('button', { name: label });
  }

  doctorCards() {
    return this.page.locator('[data-doctor-id]');
  }

  cards() {
    return this.page.getByTestId('doctor-card');
  }

  async selectSpecialty(name) {
    await this.page.getByRole('button', { name }).click();
  }

  async expectDoctorsListed(min) {
    await expect(this.doctorCards().first()).toBeVisible();
    expect(await this.doctorCards().count()).toBeGreaterThanOrEqual(min);
  }

  async expectDoctorCount(n) {
    await expect.poll(() => this.cards().count()).toBe(n);
  }

  async clickOnFirstDoctor() {
    this.bookedDoctor = (await this.page.getByTestId('doctor-name').first().innerText()).trim();
    await this.page.getByTestId('book-doctor').first().click();
  }

  async expectDetailsPage() {
    await expect(this.page.getByTestId('doctor-title')).toBeVisible();
    await expect(this.page.getByText(/Choose a day/)).toBeVisible();
  }

  async expectConsultationSelected() {
    await expect(this.page.getByTestId('type-clinic')).toHaveAttribute('aria-pressed', 'true');
  }

  async selectAvailableDate() {
    const day = this.page.locator('[data-testid="appointment-day"]:not([disabled])').first();
    await day.click();
    await expect(day).toHaveAttribute('aria-checked', 'true');
  }

  async expectSundayDisabled() {
    await expect(
      this.page.getByTestId('appointment-day').filter({ hasText: 'Sun' })
    ).toBeDisabled();
  }

  async selectAvailableSlot() {
    const slot = this.page.locator('[data-testid="slot"]:not([disabled])').first();
    this.bookedTime = (await slot.innerText()).trim();
    await slot.click();
    await expect(this.page.getByTestId('slot-summary')).not.toHaveText('Pick a day and time.');
  }

  async searchDoctor(text) {
    await this.page.getByTestId('doctor-search').fill(text);
  }

  async clearSearch() {
    await this.page.getByTestId('doctor-search').clear();
  }

  async expectOnlyDoctorsMatching(text) {
    const names = this.page.getByTestId('doctor-name');
    await expect(names.first()).toBeVisible();
    await expect.poll(async () => {
      const all = await names.allInnerTexts();
      return all.length > 0 && all.every(n => n.toLowerCase().includes(text.toLowerCase()));
    }).toBe(true);
  }

  async selectOptionByLabel(testId, map, label) {
    const value = map[label];
    if (!value) throw new Error(`Unknown option "${label}" for ${testId}`);
    await this.page.getByTestId(testId).selectOption(value);
  }

  selectGender(label) { return this.selectOptionByLabel('filter-gender', GENDER, label); }
  selectFee(label) { return this.selectOptionByLabel('filter-fee', FEE, label); }
  selectSort(label) { return this.selectOptionByLabel('sort-doctors', SORT, label); }

  async checkAvailableToday() {
    await this.page.getByTestId('filter-available-today').check();
  }

  async clearSpecialty(previous) {
    const all = this.page.getByRole('button', { name: /^all( specialties)?$/i });
    if (await all.count()) {
      await all.first().click();
    } else {
      await this.selectSpecialty(previous);
    }
  }

  async expectAllDoctorsGender(label) {
    const icon = GENDER_ICON[label];
    await expect.poll(async () => {
      const texts = await this.cards().allInnerTexts();
      return texts.length > 0 && texts.every(t => t.includes(icon));
    }).toBe(true);
  }

  async expectAllDoctorsFemale() {
    await this.expectAllDoctorsGender('Female');
  }

  async expectFeesBetween(min, max) {
    const lo = toNumber(min), hi = toNumber(max);
    await expect.poll(async () => {
      const fees = (await this.page.getByTestId('doctor-fee').allInnerTexts()).map(toNumber);
      return fees.length > 0 && fees.every(f => f >= lo && f <= hi);
    }).toBe(true);
  }

  async expectAllFeesWithin(bracket) {
    const rule = FEE_RULE[bracket];
    await expect.poll(async () => {
      const fees = (await this.page.getByTestId('doctor-fee').allInnerTexts()).map(toNumber);
      return fees.length > 0 && fees.every(rule);
    }).toBe(true);
  }

  async expectAllCardsShow(badge) {
    await expect.poll(async () => {
      const texts = await this.cards().allInnerTexts();
      return texts.length > 0 && texts.every(t => t.includes(badge));
    }).toBe(true);
  }

  async expectSortedByExperienceDesc() {
    await expect.poll(async () => {
      const texts = await this.cards().allInnerTexts();
      const years = texts.map(t => Number((t.match(/(\d+)\s*yrs/) || [])[1]));
      return years.length > 1 && years.every((y, i) => i === 0 || years[i - 1] >= y);
    }).toBe(true);
  }

  async expectSortedByRatingDesc() {
    await expect.poll(async () => {
      const texts = await this.cards().allInnerTexts();
      const ratings = texts.map(t => Number((t.match(/\d\.\d/) || [])[0]));
      return ratings.length > 1 && ratings.every((r, i) => i === 0 || ratings[i - 1] >= r);
    }).toBe(true);
  }

  async expectCountTextMatchesCards() {
    const label = this.page.getByText(/\d+\s+doctors?/i).first();
    await expect(label).toBeVisible();
    await expect.poll(async () => {
      const shown = Number(((await label.innerText()).match(/\d+/) || [])[0]);
      return shown === (await this.cards().count());
    }).toBe(true);
  }

  async expectText(text) {
    await expect(this.page.getByText(new RegExp('(^|\\D)' + text, 'i')).first()).toBeVisible();
  }

  async enterValidPatientDetails() {
    await expect(this.page.getByTestId('page-title')).toHaveText('Patient details');
    await this.page.getByTestId('patient-new').click();
    await this.page.getByTestId('patient-name').fill(patient.name);
    await this.page.getByTestId('patient-age').fill(patient.age);
    await this.page.getByTestId('patient-gender').selectOption({ label: patient.gender });
    await this.page.getByTestId('patient-phone').fill(patient.phone);
    await this.page.getByTestId('patient-email').fill(patient.email);
    await this.page.getByTestId('symptoms').fill(patient.symptoms);
    await this.page.getByTestId('consent').check();
  }

  async confirmBooking() {
    await this.page.getByTestId('confirm-appointment').click();
  }

  async expectBookingConfirmed() {
    await expect(this.page.getByTestId('confirm-appointment')).toBeHidden();
  }

  async selectSlotForDoctor(name) {
    await this.searchDoctor(name);
    await this.expectOnlyDoctorsMatching(name);
    await this.clickOnFirstDoctor();
    await this.selectAvailableDate();
    await this.selectAvailableSlot();
  }

  async bookAppointmentViaUI() {
    await this.clickOnFirstDoctor();
    await this.selectAvailableDate();
    await this.selectAvailableSlot();
    await this.button('Continue').click();
    await this.enterValidPatientDetails();
    await this.confirmBooking();
  }

  async submitWithInvalid(field, value) {
    await this.enterValidPatientDetails();
    await this.page.getByTestId(PATIENT_FIELD[field].id).fill(value);
    await this.confirmBooking();
  }

  async expectFieldError(field) {
    await expect(this.page.getByText(PATIENT_FIELD[field].error)).toBeVisible();
  }

  async expectBookingNotConfirmed() {
    await expect(this.page).toHaveURL(/\/details/);
    await expect(this.page.getByTestId('confirm-appointment')).toBeVisible();
  }

  async goToMyAppointments() {
    await this.page.getByTestId('nav-appointments').click();
  }

  async expectBookedAppointmentListed() {
    await expect(this.page.getByText(this.bookedDoctor).first()).toBeVisible();
    await expect(this.page.getByText(this.bookedTime).first()).toBeVisible();
    await expect(this.page.getByText('Upcoming', { exact: true })).toBeVisible();
  }

  async clickOnAppointment(label) {
    await this.button(label).first().click();
  }

    rescheduleModal() {
    return this.page.getByTestId('reschedule-modal');
  }

  async pickNewSlot() {
    const modal = this.rescheduleModal();
    await modal.getByRole('radio', { disabled: false }).first().click();
    const slot = modal.locator('[data-testid="reschedule-slot"][data-available="true"]').first();
    this.newTime = (await slot.innerText()).trim();
    await slot.click();
  }

  async confirmNewSlot() {
    await this.rescheduleModal().getByRole('button', { name: 'Reschedule' }).click();
    await expect(this.rescheduleModal()).toBeHidden();
  }

  async expectScheduleUpdated() {
    await expect(this.page.getByText(this.newTime).first()).toBeVisible();
  }

  async confirmCancellation() {
    await this.page.getByRole('button', { name: 'Cancel it' }).click();
  }

  async expectAppointmentStatus(label) {
    await expect(this.page.getByText(label, { exact: true })).toBeVisible();
  }

  async keepAppointment() {
    await this.page.getByRole('button', { name: 'Keep' }).click();
    await expect(this.page.getByText('Cancel appointment?')).toBeHidden();
  }
}

module.exports = { ClinicPage };