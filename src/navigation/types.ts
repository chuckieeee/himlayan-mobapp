export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  
  // Main app with bottom tabs
  MainTabs: undefined;
  
  // Customer/Visitor
  GraveDetails: { graveId: string };
  GraveMap: { plot: any };
  
  // Staff
  StaffDashboard: undefined;
  ManageRecords: undefined;
  RecordDetails: { recordId: string };
  QRAssignment: undefined;
  NavigationAssistance: undefined;
  FeedbackPreview: undefined;
  
  // Admin
  AdminDashboard: undefined;
  ViewReports: undefined;
  ReportDetails: { reportId: string };
  ViewFeedback: undefined;
  PostAnnouncement: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  Scanner: undefined;
  Payments: undefined;
  Profile: undefined;
};
