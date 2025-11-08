import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Upload } from 'lucide-react';

function ProfileCard() {
  const { user } = useAuth();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_picture_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.profile_picture_url) {
        setProfilePictureUrl(data.profile_picture_url);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      if (profilePictureUrl) {
        const oldPath = profilePictureUrl.split('/').slice(-2).join('/');
        await supabase.storage
          .from('profile-pictures')
          .remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) throw upsertError;

      setProfilePictureUrl(publicUrl);
    } catch (error: any) {
      setError(error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      <h2 className="text-2xl font-bold text-sky-600 mb-6 text-center">Profile</h2>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-sky-200 shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center border-4 border-sky-200 shadow-md">
              <User size={48} className="text-white" />
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <label
          htmlFor="profile-picture-upload"
          className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:from-sky-600 hover:to-blue-700 cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload size={18} />
          {uploading ? 'Uploading...' : 'Upload Profile Picture'}
        </label>
        <input
          id="profile-picture-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />

        {user?.email && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Signed in as</p>
            <p className="text-sm font-semibold text-gray-700">{user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileCard;
