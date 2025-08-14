# 📊 Face Academy Dataset Upload Guide

This guide will help you upload your 1.7M local training images to Supabase for proper face recognition training.

## 🚀 Quick Start

### 1. Get Your Supabase Service Role Key

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard/project/fvgkmiqabannajuygjde
2. Navigate to **Settings → API**
3. Copy the **service_role** key (⚠️ Keep this secret!)

### 2. Configure the Upload Script

Edit `scripts/upload-dataset.js` and replace:

```javascript
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Paste your service role key here
```

### 3. Organize Your Dataset (Recommended Structure)

```
D:/face recognizer/data/
├── male_asian_adult/
│   ├── person1_img1.jpg
│   ├── person1_img2.jpg
│   └── ...
├── female_black_young_adult/
│   ├── person2_img1.jpg
│   └── ...
├── male_white_senior/
└── ...
```

**Folder Naming Convention:**
- Include demographic info in folder names: `gender_ethnicity_agegroup`
- Supported terms:
  - **Gender**: male, female, non-binary
  - **Ethnicity**: asian, black, hispanic, white, mixed, other  
  - **Age**: child, teen, young_adult, adult, senior

### 4. Update Dataset Path

Edit the path in `scripts/upload-dataset.js`:

```javascript
const CONFIG = {
  datasetPath: 'D:/face recognizer/data', // Update this to your actual path
  // ...
};
```

### 5. Run the Upload

```bash
# Navigate to your project
cd face-recognition-ML

# Install required dependencies
npm install

# Run the upload script
npm run upload-dataset
```

## ⚙️ Configuration Options

### Batch Processing
```javascript
const CONFIG = {
  batchSize: 50,           // Images per batch (reduce if hitting rate limits)
  delayBetweenBatches: 1000, // Delay in milliseconds
  // ...
};
```

### Image Limits
```javascript
// In uploadDirectoryImages function
.slice(0, 100); // Limit to 100 images per category
```

**💡 Tip**: Start with 100 images per category, then increase once confirmed working.

## 📋 What the Script Does

1. **Scans** your local directories for images
2. **Creates synthetic users** for each demographic category
3. **Uploads images** to Supabase Storage in batches
4. **Saves metadata** to the database with demographic info
5. **Associates images** with users for training
6. **Updates user status** to 'trained' when complete

## 🔧 Troubleshooting

### Common Issues

**Rate Limiting:**
- Increase `delayBetweenBatches` to 2000-5000ms
- Reduce `batchSize` to 25-10

**Memory Issues:**
- Reduce images per directory limit
- Process in smaller chunks

**File Format Issues:**
- Ensure images are .jpg, .jpeg, .png, or .bmp
- Convert other formats first

### Monitoring Progress

The script outputs detailed logs:
```
🔍 Scanning for image directories...
📂 Found 45 directories with images
📁 Processing: male_asian_adult
👤 Assigned to user: male_asian_adult_1
📊 Demographics: { gender: 'male', ethnicity: 'asian', age_group: 'adult' }
✅ Uploaded 10/100 images from male_asian_adult
📈 Progress: 450 images uploaded total
```

## 🎯 Expected Results

After successful upload:
- **Users**: Synthetic demographic users in your database
- **Images**: Stored in Supabase Storage bucket `training_images`
- **Metadata**: Training data linked to users with demographics
- **Status**: Users marked as 'trained' for recognition testing

## 🔄 Model Training

Once uploaded, the web app will:
1. **Load training images** from storage during recognition
2. **Compare captured photos** against stored dataset
3. **Use demographic diversity** for better accuracy
4. **Provide real confidence scores** based on similarity

## 🚨 Security Notes

- **Never commit** the service role key to git
- **Use environment variables** in production
- **Rotate keys** periodically
- **Monitor storage usage** in Supabase dashboard

## 📈 Performance Tips

1. **Start small**: Test with 1000 images first
2. **Monitor storage**: Check Supabase usage limits
3. **Optimize images**: Compress large files beforehand
4. **Use SSD**: Store dataset on fast storage for upload speed

---

**Need help?** Check the console output for detailed error messages and troubleshooting info.
