import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { API_URL } from "@/config";

export const useJobSeekerProfile = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfilePhoto = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${API_URL}/jobseeker/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePhoto(data.profilePhotoUrl);
      } else {
        // If no profile found, set to null
        setProfilePhoto(null);
      }
    } catch (error) {
      console.error("Error fetching profile photo:", error);
      setProfilePhoto(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfilePhoto();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchProfilePhoto();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  return { profilePhoto, loading, refetch: fetchProfilePhoto };
};
