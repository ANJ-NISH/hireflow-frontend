import {Routes, Route} from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from "../components/RouteGuards";
import HomePage from '../pages/HomePage.tsx';
import RegisterPage from '../pages/RegisterPage.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import CompanyProfilePage from '../pages/recruiter/CompanyProfilePage.tsx';
import MyJobsPage from '../pages/recruiter/MyJobsPage.tsx';
import PostJobPage from '../pages/recruiter/PostJobPage.tsx';
import JobListingPage from '../pages/JobListingPage.tsx';
import JobDetailsPage from '../pages/JobDetailsPage.tsx';
import MyApplicationsPage from '../pages/candidate/MyApplicationsPage.tsx';
import JobApplicantsPage from '../pages/recruiter/JobApplicantsPage.tsx';
import CandidateProfilePage from "../pages/candidate/CandidateProfilePage";
import CandidateProfileViewPage from "../pages/recruiter/CandidateProfileViewPage";
import SavedJobsPage from "../pages/candidate/SavedJobsPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminCompaniesPage from "../pages/admin/AdminCompaniesPage";
import AdminJobsPage from "../pages/admin/AdminJobsPage";
import AdminComplaintsPage from "../pages/admin/AdminComplaintsPage";
import CandidateSearchPage from "../pages/recruiter/CandidateSearchPage";
import NotificationsPage from "../pages/NotificationsPage";
import NotFoundPage from "../pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<JobListingPage />} />
      <Route path="/jobs/:id" element={<JobDetailsPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["CANDIDATE"]} />}>
        <Route path="/candidate/profile" element={<CandidateProfilePage />} />
        <Route path="/candidate/applications" element={<MyApplicationsPage />} />
        <Route path="/candidate/saved-jobs" element={<SavedJobsPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["RECRUITER"]} />}>
        <Route path="/recruiter/company" element={<CompanyProfilePage />} />
        <Route path="/recruiter/jobs" element={<MyJobsPage />} />
        <Route path="/recruiter/jobs/new" element={<PostJobPage />} />
        <Route path="/recruiter/jobs/:jobId/applicants" element={<JobApplicantsPage />} />
        <Route path="/recruiter/candidates/search" element={<CandidateSearchPage />} />
        <Route path="/recruiter/candidates/:userId" element={<CandidateProfileViewPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/companies" element={<AdminCompaniesPage />} />
        <Route path="/admin/jobs" element={<AdminJobsPage />} />
        <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}