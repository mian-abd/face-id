import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvgkmiqabannajuygjde.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2Z2ttaXFhYmFubmFqdXlnamRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NjM2MDEsImV4cCI6MjA3MDUzOTYwMX0.F6MlHlF7c6jI9Dl2yvjPJDszydH-LJZ6oUFDQvg8rrA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage helpers for images
export const storageHelpers = {
  // Upload image to Supabase Storage
  async uploadImage(userId, imageBlob, fileName) {
    try {
      const filePath = `${userId}/${fileName}_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('training_images')
        .upload(filePath, imageBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (error) {
        console.error('Storage upload error:', error);
        return { success: false, error: error.message };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('training_images')
        .getPublicUrl(filePath);
      
      return { 
        success: true, 
        path: filePath,
        url: publicUrl,
        data
      };
    } catch (err) {
      console.error('Upload error:', err);
      return { success: false, error: err.message };
    }
  },

  // Get public URL for stored image
  getImageUrl(imagePath) {
    const { data: { publicUrl } } = supabase.storage
      .from('training_images')
      .getPublicUrl(imagePath);
    return publicUrl;
  },

  // Delete image from storage
  async deleteImage(imagePath) {
    try {
      const { data, error } = await supabase.storage
        .from('training_images')
        .remove([imagePath]);
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

// Authentication helper functions
export const authHelpers = {
  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (err) {
      console.error('Google sign-in error:', err);
      return { success: false, error: err.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      console.error('Sign out error:', err);
      return { success: false, error: err.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Get user error:', error);
        return { success: false, error: error.message };
      }
      return { success: true, user };
    } catch (err) {
      console.error('Get user error:', err);
      return { success: false, error: err.message };
    }
  },

  // Listen to auth changes
  onAuthChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

// Local storage fallback functions
const localStorageHelpers = {
  createUser(username, email = null) {
    const users = JSON.parse(localStorage.getItem('face_academy_users') || '[]');
    const newUser = {
      id: Date.now(),
      username,
      email,
      model_status: 'not_trained',
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('face_academy_users', JSON.stringify(users));
    return { success: true, user: newUser };
  },

  saveTrainingImages(userId, images, imageType = 'positive') {
    const trainingData = JSON.parse(localStorage.getItem('face_academy_training') || '{}');
    trainingData[userId] = trainingData[userId] || [];
    trainingData[userId].push(...images.map(img => ({ 
      image_data: img, 
      image_type: imageType,
      created_at: new Date().toISOString()
    })));
    localStorage.setItem('face_academy_training', JSON.stringify(trainingData));
    return { success: true, images: trainingData[userId] };
  },

  updateModelStatus(userId, status) {
    const users = JSON.parse(localStorage.getItem('face_academy_users') || '[]');
    const user = users.find(u => u.id === userId);
    if (user) {
      user.model_status = status;
      user.model_trained_at = status === 'trained' ? new Date().toISOString() : null;
      localStorage.setItem('face_academy_users', JSON.stringify(users));
      return { success: true, user };
    }
    return { success: false, error: 'User not found' };
  },

  getUserByUsername(username) {
    const users = JSON.parse(localStorage.getItem('face_academy_users') || '[]');
    const user = users.find(u => u.username === username);
    if (user) {
      return { success: true, user };
    }
    return { success: false, error: 'User not found' };
  },

  getTrainingImages(userId) {
    const trainingData = JSON.parse(localStorage.getItem('face_academy_training') || '{}');
    return { success: true, images: trainingData[userId] || [] };
  }
};

// Database helper functions
export const dbHelpers = {
  // Create or get user profile (for authenticated users)
  async createOrGetUserProfile(authUser) {
    try {
      // First, check if user profile already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingUser && !fetchError) {
        return { success: true, user: existingUser };
      }

      // Create new user profile
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: authUser.id, // Use auth user ID
            username: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
            email: authUser.email,
            model_status: 'not_trained',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.warn('Database error:', error.message);
        // For auth users, we still need some fallback
        return { 
          success: true, 
          user: {
            id: authUser.id,
            username: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
            email: authUser.email,
            model_status: 'not_trained'
          }
        };
      }

      return { success: true, user: data };
    } catch (err) {
      console.warn('Database error:', err.message);
      // Return auth user data as fallback
      return { 
        success: true, 
        user: {
          id: authUser.id,
          username: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          email: authUser.email,
          model_status: 'not_trained'
        }
      };
    }
  },

  // Legacy method for non-auth users (keeping for backwards compatibility)
  async createUser(username, email = null) {
    try {
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
        console.warn('Supabase unavailable, using local storage:', error.message);
        return localStorageHelpers.createUser(username, email);
      }

      return { success: true, user: data };
    } catch (err) {
      console.warn('Supabase unavailable, using local storage:', err.message);
      return localStorageHelpers.createUser(username, email);
    }
  },

  // Save training images to Storage + Database
  async saveTrainingImages(userId, images, imageType = 'positive') {
    try {
      console.log('💾 Saving', images.length, 'training images for user:', userId);
      
      const uploadResults = [];
      
      // Upload each image to Storage first
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        
        try {
          // Convert base64 to blob
          const response = await fetch(imageData);
          const blob = await response.blob();
          
          // Upload to Supabase Storage
          const uploadResult = await storageHelpers.uploadImage(
            userId, 
            blob, 
            `training_${imageType}_${i}`
          );
          
          if (uploadResult.success) {
            uploadResults.push({
              storage_path: uploadResult.path,
              public_url: uploadResult.url,
              original_data: imageData // Keep for local fallback
            });
            console.log(`✅ Uploaded image ${i + 1}/${images.length}`);
          } else {
            console.warn(`⚠️ Failed to upload image ${i + 1}:`, uploadResult.error);
            // Fallback to base64 storage
            uploadResults.push({
              storage_path: null,
              public_url: null,
              original_data: imageData
            });
          }
        } catch (uploadError) {
          console.warn(`⚠️ Upload error for image ${i + 1}:`, uploadError);
          uploadResults.push({
            storage_path: null,
            public_url: null,
            original_data: imageData
          });
        }
      }

      // Save metadata to database
      const imageRecords = uploadResults.map((result, index) => ({
        user_id: userId,
        image_data: result.storage_path || result.original_data, // Use storage path or fallback to base64
        image_type: imageType,
        storage_path: result.storage_path,
        public_url: result.public_url,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('training_images')
        .insert(imageRecords)
        .select();

      if (error) {
        console.warn('Database unavailable, using local storage:', error.message);
        return localStorageHelpers.saveTrainingImages(userId, images, imageType);
      }

      console.log('✅ Saved training images to database');
      return { success: true, images: data };
      
    } catch (err) {
      console.warn('Supabase unavailable, using local storage:', err.message);
      return localStorageHelpers.saveTrainingImages(userId, images, imageType);
    }
  },

  // Update user model status
  async updateModelStatus(userId, status) {
    try {
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
        console.warn('Supabase unavailable, using local storage:', error.message);
        return localStorageHelpers.updateModelStatus(userId, status);
      }

      return { success: true, user: data };
    } catch (err) {
      console.warn('Supabase unavailable, using local storage:', err.message);
      return localStorageHelpers.updateModelStatus(userId, status);
    }
  },

  // Get user by username
  async getUserByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User not found in Supabase, check local storage
          return localStorageHelpers.getUserByUsername(username);
        }
        console.warn('Supabase unavailable, using local storage:', error.message);
        return localStorageHelpers.getUserByUsername(username);
      }

      return { success: true, user: data };
    } catch (err) {
      console.warn('Supabase unavailable, using local storage:', err.message);
      return localStorageHelpers.getUserByUsername(username);
    }
  },

  // Get training images for a user
  async getTrainingImages(userId) {
    try {
      const { data, error } = await supabase
        .from('training_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Supabase unavailable, using local storage:', error.message);
        return localStorageHelpers.getTrainingImages(userId);
      }

      // Process images - use public URL if available, otherwise use stored data
      const processedImages = data.map(img => ({
        ...img,
        image_data: img.public_url || img.image_data, // Prefer public URL over base64
        is_from_storage: !!img.public_url // Track source for debugging
      }));

      console.log('📸 Retrieved', processedImages.length, 'training images for user:', userId);
      return { success: true, images: processedImages };
    } catch (err) {
      console.warn('Supabase unavailable, using local storage:', err.message);
      return localStorageHelpers.getTrainingImages(userId);
    }
  }
};
