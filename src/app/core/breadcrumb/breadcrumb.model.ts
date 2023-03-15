export enum JourneyType {
  PUBLIC,
  ACCOUNT,
  BULK_UPLOAD,
  BULK_UPLOAD_HELP,
  MY_WORKPLACE,
  ALL_WORKPLACES,
  NOTIFICATIONS,
  MANDATORY_TRAINING,
  BENCHMARKS_PAY,
  BENCHMARKS_SICKNESS,
  BENCHMARKS_TURNOVER,
  BENCHMARKS_QUALIFICATIONS,
  EDIT_USER,
  WDF,
  WDF_PARENT,
  PAGES_ARTICLES,
  BENCHMARKS_SUBSIDIARIES_PAY,
  BENCHMARKS_SUBSIDIARIES_TURNOVER,
  BENCHMARKS_SUBSIDIARIES_SICKNESS,
  BENCHMARKS_SUBSIDIARIES_QUALIFICATIONS,
  ADMIN,
  ADMIN_PENDING_REGISTRATIONS,
  ADMIN_REJECTED_REGISTRATIONS,
  BENEFITS_BUNDLE,
  CQC_MAIN_SERVICE_CHANGE,
  ADMIN_USERS,
  WORKPLACE_TAB,
  STAFF_RECORDS_TAB,
  TRAINING_AND_QUALIFICATIONS_TAB,
}

export interface JourneyRoute {
  title?: string;
  path?: string;
  children?: JourneyRoute[];
  referrer?: JourneyRoute;
  fragment?: string;
}
