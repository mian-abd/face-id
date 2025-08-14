/**
 * Face Academy Dataset Upload Script
 * Uploads 1.7M local training images to Supabase Storage and Database
 * Handles gender, ethnicity, and other demographic diversity
 */

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fvgkmiqabannajuygjde.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // You'll need to get this from Supabase settings
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const CONFIG = {
  // Path to your local dataset (adjust as needed)
  datasetPath: 'D:/face recognizer/data',
  
  // Batch processing
  batchSize: 50, // Upload 50 images at a time
  delayBetweenBatches: 1000, // 1 second delay
  
  // Supported image formats
  imageExtensions: ['.jpg', '.jpeg', '.png', '.bmp'],
  
  // Demographics mapping (customize based on your folder structure)
  demographics: {
    gender: ['male', 'female', 'non-binary'],
    ethnicity: ['asian', 'black', 'hispanic', 'white', 'mixed', 'other'],
    age_group: ['child', 'teen', 'young_adult', 'adult', 'senior']
  }
};

// Utility functions
function extractDemographics(folderPath) {
  const folderName = path.basename(folderPath).toLowerCase();
  const demographics = {};
  
  // Extract gender
  for (const gender of CONFIG.demographics.gender) {
    if (folderName.includes(gender)) {
      demographics.gender = gender;
      break;
    }
  }
  
  // Extract ethnicity
  for (const ethnicity of CONFIG.demographics.ethnicity) {
    if (folderName.includes(ethnicity)) {
      demographics.ethnicity = ethnicity;
      break;
    }
  }
  
  // Extract age group
  for (const ageGroup of CONFIG.demographics.age_group) {
    if (folderName.includes(ageGroup) || folderName.includes(ageGroup.replace('_', ''))) {
      demographics.age_group = ageGroup;
      break;
    }
  }
  
  return demographics;
}

function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return CONFIG.imageExtensions.includes(ext);
}

// Create synthetic users for dataset categories
async function createSyntheticUsers() {
  console.log('🔨 Creating synthetic users for dataset categories...');
  
  const users = [];
  let userCount = 0;
  
  for (const gender of CONFIG.demographics.gender) {
    for (const ethnicity of CONFIG.demographics.ethnicity) {
      for (const ageGroup of CONFIG.demographics.age_group) {
        userCount++;
        const username = `${gender}_${ethnicity}_${ageGroup}_${userCount}`;
        
        const user = {
          id: `synthetic_${userCount.toString().padStart(6, '0')}`,
          username: username,
          email: `${username}@faceacademy.synthetic`,
          model_status: 'training',
          created_at: new Date().toISOString(),
          demographics: { gender, ethnicity, age_group }
        };
        
        users.push(user);
      }
    }
  }
  
  console.log(`📊 Created ${users.length} synthetic user categories`);
  return users;
}

// Upload images from a directory
async function uploadDirectoryImages(dirPath, userId, demographics) {
  console.log(`📁 Processing directory: ${dirPath}`);
  
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const imageFiles = files.filter(file => 
      file.isFile() && isImageFile(file.name)
    ).slice(0, 100); // Limit to 100 images per category for performance
    
    console.log(`🖼️ Found ${imageFiles.length} images in ${dirPath}`);
    
    if (imageFiles.length === 0) return 0;
    
    let uploadedCount = 0;
    
    // Process in batches
    for (let i = 0; i < imageFiles.length; i += CONFIG.batchSize) {
      const batch = imageFiles.slice(i, i + CONFIG.batchSize);
      
      console.log(`📦 Processing batch ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(imageFiles.length / CONFIG.batchSize)}`);
      
      for (const file of batch) {
        try {
          const filePath = path.join(dirPath, file.name);
          const fileBuffer = await fs.readFile(filePath);
          
          // Upload to Supabase Storage
          const storagePath = `${userId}/${file.name}_${Date.now()}.jpg`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('training_images')
            .upload(storagePath, fileBuffer, {
              contentType: 'image/jpeg',
              upsert: false
            });
          
          if (uploadError) {
            console.warn(`⚠️ Upload failed for ${file.name}:`, uploadError.message);
            continue;
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('training_images')
            .getPublicUrl(storagePath);
          
          // Save metadata to database
          const { error: dbError } = await supabase
            .from('training_images')
            .insert({
              user_id: userId,
              image_data: storagePath, // Store storage path
              image_type: 'positive',
              storage_path: storagePath,
              public_url: publicUrl,
              demographics: demographics,
              created_at: new Date().toISOString()
            });
          
          if (dbError) {
            console.warn(`⚠️ Database insert failed for ${file.name}:`, dbError.message);
            continue;
          }
          
          uploadedCount++;
          
          if (uploadedCount % 10 === 0) {
            console.log(`✅ Uploaded ${uploadedCount}/${imageFiles.length} images from ${path.basename(dirPath)}`);
          }
          
        } catch (error) {
          console.warn(`⚠️ Error processing ${file.name}:`, error.message);
        }
      }
      
      // Delay between batches to avoid rate limits
      if (i + CONFIG.batchSize < imageFiles.length) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
      }
    }
    
    console.log(`🎉 Completed uploading ${uploadedCount} images from ${path.basename(dirPath)}`);
    return uploadedCount;
    
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error);
    return 0;
  }
}

// Scan directory recursively for image folders
async function scanForImageDirectories(basePath, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return [];
  
  const directories = [];
  
  try {
    const items = await fs.readdir(basePath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        const fullPath = path.join(basePath, item.name);
        
        // Check if this directory contains images
        const files = await fs.readdir(fullPath, { withFileTypes: true });
        const hasImages = files.some(file => 
          file.isFile() && isImageFile(file.name)
        );
        
        if (hasImages) {
          directories.push(fullPath);
        }
        
        // Recursively scan subdirectories
        const subDirs = await scanForImageDirectories(fullPath, maxDepth, currentDepth + 1);
        directories.push(...subDirs);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Could not scan directory ${basePath}:`, error.message);
  }
  
  return directories;
}

// Main upload function
async function uploadDataset() {
  console.log('🚀 Starting Face Academy Dataset Upload');
  console.log(`📍 Dataset path: ${CONFIG.datasetPath}`);
  
  try {
    // Check if dataset path exists
    await fs.access(CONFIG.datasetPath);
    
    // Create synthetic users
    const syntheticUsers = await createSyntheticUsers();
    
    // Insert users into database
    console.log('💾 Inserting synthetic users into database...');
    const { error: usersError } = await supabase
      .from('users')
      .insert(syntheticUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        model_status: user.model_status,
        created_at: user.created_at
      })));
    
    if (usersError) {
      console.warn('⚠️ Some users may already exist:', usersError.message);
    }
    
    // Scan for image directories
    console.log('🔍 Scanning for image directories...');
    const imageDirectories = await scanForImageDirectories(CONFIG.datasetPath);
    console.log(`📂 Found ${imageDirectories.length} directories with images`);
    
    if (imageDirectories.length === 0) {
      console.log('❌ No image directories found. Please check your dataset path.');
      return;
    }
    
    // Upload images from each directory
    let totalUploaded = 0;
    let userIndex = 0;
    
    for (const directory of imageDirectories) {
      const demographics = extractDemographics(directory);
      const user = syntheticUsers[userIndex % syntheticUsers.length];
      
      console.log(`\n📁 Processing: ${path.basename(directory)}`);
      console.log(`👤 Assigned to user: ${user.username}`);
      console.log(`📊 Demographics:`, demographics);
      
      const uploadedCount = await uploadDirectoryImages(directory, user.id, demographics);
      totalUploaded += uploadedCount;
      
      userIndex++;
      
      // Progress update
      console.log(`📈 Progress: ${totalUploaded} images uploaded total`);
    }
    
    // Update user statuses to 'trained'
    console.log('🎓 Updating user statuses to trained...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        model_status: 'trained',
        model_trained_at: new Date().toISOString()
      })
      .in('id', syntheticUsers.map(u => u.id));
    
    if (updateError) {
      console.warn('⚠️ Error updating user statuses:', updateError.message);
    }
    
    console.log('\n🎉 Dataset Upload Complete!');
    console.log(`📊 Total images uploaded: ${totalUploaded}`);
    console.log(`👥 Total users created: ${syntheticUsers.length}`);
    console.log(`📁 Directories processed: ${imageDirectories.length}`);
    
  } catch (error) {
    console.error('❌ Dataset upload failed:', error);
  }
}

// Run the upload
if (require.main === module) {
  uploadDataset().then(() => {
    console.log('✅ Upload script completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Upload script failed:', error);
    process.exit(1);
  });
}

module.exports = { uploadDataset, CONFIG };
