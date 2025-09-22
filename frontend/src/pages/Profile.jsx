import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LoadingOverlay from '@/components/LoadingOverlay';
import JobSeekerProfileForm from '../components/JobSeekerProfileForm';
import JobSeekerProfileView from '@/components/JobSeekerProfileView';
import { API_URL } from '@/config';

const Profile = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/jobseeker/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditing(false);
      } else if (response.status === 404) {
        setProfile(null);
        setEditing(true); // no profile yet → show form
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <LoadingOverlay message="Loading profile..." />;

  if (editing) {
    return (
      <JobSeekerProfileForm
        onSuccess={(saved) => {
          setProfile(saved);
          setEditing(false);
        }}
        onCancel={profile ? () => setEditing(false) : undefined}
      />
    );
  }

  return (
    <JobSeekerProfileView
      profile={profile || {}}
      onEdit={() => setEditing(true)}
    />
  );
};

export default Profile;
