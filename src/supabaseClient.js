import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvgkmiqabannajuygjde.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2Z2ttaXFhYmFubmFqdXlnamRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NjM2MDEsImV4cCI6MjA3MDUzOTYwMX0.F6MlHlF7c6jI9Dl2yvjPJDszydH-LJZ6oUFDQvg8rrA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const dbHelpers = {
  // Create a new user
  async createUser(username, email = null) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          model_status: 'not_trained',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return { success: false, error };
    }

    return { success: true, user: data };
  },

  // Save training images
  async saveTrainingImages(userId, images, imageType = 'positive') {
    const imageRecords = images.map(imageData => ({
      user_id: userId,
      image_data: imageData,
      image_type: imageType,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('training_images')
      .insert(imageRecords)
      .select();

    if (error) {
      console.error('Error saving training images:', error);
      return { success: false, error };
    }

    return { success: true, images: data };
  },

  // Update user model status
  async updateModelStatus(userId, status) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        model_status: status,
        model_trained_at: status === 'trained' ? new Date().toISOString() : null
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating model status:', error);
      return { success: false, error };
    }

    return { success: true, user: data };
  },

  // Get user by username
  async getUserByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return { success: false, error: 'User not found' };
      }
      console.error('Error getting user:', error);
      return { success: false, error };
    }

    return { success: true, user: data };
  },

  // Get training images for a user
  async getTrainingImages(userId) {
    const { data, error } = await supabase
      .from('training_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting training images:', error);
      return { success: false, error };
    }

    return { success: true, images: data };
  }
};
