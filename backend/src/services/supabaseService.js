const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Upload a file to Supabase Storage
 * @param {string} bucket - The storage bucket name
 * @param {string} filePath - The file path within the bucket
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<{url: string, error?: string}>}
 */
const uploadFile = async (bucket, filePath, fileBuffer, contentType) => {
  try {
    // Upload the new file (deletion is handled in controller for specific cases)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { error: error.message };
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl };
  } catch (error) {
    console.error('Upload service error:', error);
    return { error: 'Failed to upload file' };
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - The storage bucket name
 * @param {string} filePath - The file path within the bucket
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const deleteFile = async (bucket, filePath) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete service error:', error);
    return { success: false, error: 'Failed to delete file' };
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  supabase
};
