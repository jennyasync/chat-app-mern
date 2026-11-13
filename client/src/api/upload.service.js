import api from './axios.js';

// The field name must match upload.single('image') on the server. Don't set Content-Type:
// axios adds the multipart boundary itself for FormData.
const buildForm = (file) => {
  const form = new FormData();
  form.append('image', file);
  return form;
};

export const uploadAvatar = async (file) => {
  const { data } = await api.post('/upload/avatar', buildForm(file), {
    timeout: 60_000,
  });
  return data;
};

export const removeAvatar = async () => {
  const { data } = await api.delete('/upload/avatar');
  return data;
};

export const uploadMessageImage = async (file) => {
  const { data } = await api.post('/upload/message-image', buildForm(file), {
    timeout: 60_000,
  });
  return data;
};

// Not /upload/avatar: that endpoint also saves the image as the creator's own profile avatar.
export const uploadGroupAvatar = (file) => uploadMessageImage(file);
