import React from 'react';
import JobSeekerProfileForm from '../components/JobSeekerProfileForm';

const Profile = () => {
  return (
    <div className="page-container">
      <div className="container">
        <h1>My Profile</h1>
        <JobSeekerProfileForm />
      </div>
    </div>
  );
};

export default Profile;