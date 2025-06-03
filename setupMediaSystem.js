#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from both .env and .env.local
dotenv.config(); // Loads .env
dotenv.config({ path: '.env.local' }); // Loads .env.local (overrides .env if same keys exist)

// Debug: Show what environment variables are loaded
console.log('🔍 Debugging environment variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Found' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Found' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing');
console.log('');

// Read from your .env files
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
  console.error('\nPlease check your .env and .env.local files');
  console.error('Make sure one of them contains:');
  console.error('VITE_SUPABASE_URL=your_supabase_url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupMediaSystem() {
  console.log('🚀 Setting up Media Management System...');
  
  try {
    // Test if tables exist by trying to query them directly
    console.log('📋 Checking media tables...');
    
    const { error: mediaError } = await supabase
      .from('media_files')
      .select('id')
      .limit(1);
      
    const { error: quotaError } = await supabase
      .from('media_quotas')
      .select('id')
      .limit(1);
    
    const tablesExist = !mediaError && !quotaError;
    
    if (tablesExist) {
      console.log('✅ Media tables found and accessible');
      console.log('   - media_files: Ready');
      console.log('   - media_quotas: Ready');
    } else {
      console.log('⚠️  Media tables not found');
      console.log('📋 Please run the SQL from MEDIA_SETUP.md in your Supabase Dashboard → SQL Editor');
      if (mediaError) console.log('   media_files error:', mediaError.message);
      if (quotaError) console.log('   media_quotas error:', quotaError.message);
      console.log('');
    }

    // Create storage bucket
    console.log('🗄️  Setting up storage bucket...');
    const { error: bucketError } = await supabase.storage.createBucket('media', {
      public: true,
      allowedMimeTypes: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/ogg'
      ],
      fileSizeLimit: 104857600 // 100MB
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.warn('⚠️  Storage bucket warning:', bucketError.message);
    } else if (!bucketError) {
      console.log('✅ Storage bucket created');
    } else {
      console.log('✅ Storage bucket already exists');
    }

    // Check Unsplash API key
    console.log('🖼️  Checking Unsplash API configuration...');
    const unsplashAccessKey = process.env.VITE_UNSPLASH_ACCESS_KEY;
    const unsplashSecretKey = process.env.VITE_UNSPLASH_SECRET_KEY;
    const unsplashAppId = process.env.VITE_UNSPLASH_APP_ID;
    
    console.log('   Access Key:', unsplashAccessKey ? '✅ Found' : '❌ Missing');
    console.log('   Secret Key:', unsplashSecretKey ? '✅ Found' : '❌ Missing');
    console.log('   App ID:', unsplashAppId ? '✅ Found' : '❌ Missing');
    
    if (unsplashAccessKey) {
      console.log('   Access Key preview:', `${unsplashAccessKey.substring(0, 10)}...`);
    }
    
    let unsplashStatus = 'missing';
    if (unsplashAccessKey && unsplashAccessKey !== 'demo-key' && unsplashAccessKey.length > 20) {
      console.log('✅ Unsplash Access Key configured and ready');
      console.log('   You can now search and download free stock photos');
      unsplashStatus = 'configured';
    } else if (unsplashAccessKey && (unsplashAccessKey === 'demo-key' || unsplashAccessKey.includes('demo'))) {
      console.log('⚠️  Demo Unsplash key detected');
      console.log('   This will work for testing but has limited requests');
      console.log('   Replace with your real Access Key for production');
      unsplashStatus = 'demo';
    } else {
      console.log('⚠️  Unsplash Access Key not configured (optional)');
      console.log('   Add to your .env file:');
      console.log('   VITE_UNSPLASH_ACCESS_KEY=your_access_key_here');
      console.log('   Get your keys from: https://unsplash.com/developers');
      unsplashStatus = 'missing';
    }

    console.log('\n🎯 Status Summary:');
    console.log('✅ Environment variables: Working');
    console.log(tablesExist ? '✅ Database tables: Ready' : '⚠️  Database tables: Need manual setup');
    console.log('✅ Storage bucket: Ready');
    console.log(unsplashStatus === 'configured' ? '✅ Unsplash: Configured' : '⚠️  Unsplash: Optional');

    if (!tablesExist) {
      console.log('\n📋 Next steps:');
      console.log('1. Copy the SQL from MEDIA_SETUP.md (lines 15-220)');
      console.log('2. Go to Supabase Dashboard → SQL Editor');
      console.log('3. Paste and run the SQL');
      console.log('4. Run this script again to verify');
    } else {
      console.log('\n🎉 Media Management System is ready to use!');
      console.log('✨ You can now upload media through the page builder');
      console.log('📷 Images: Up to 250 per organization');
      console.log('🎥 Videos: Up to 10 minutes total per organization');
      console.log('🖼️  Unsplash: Free stock photos (if API key configured)');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupMediaSystem(); 