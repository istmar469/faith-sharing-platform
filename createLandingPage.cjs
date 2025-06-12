const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://pryxcsptllbogumcijju.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeWZjc3B0dGxib2d1bWNpamp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUxODI4NCwiZXhwIjoyMDYyMDk0Mjg0fQ.S8NZ1xibCsm8naWJgoIedRy7teMnOl2YfP7ov8B25ew';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test function to list organizations
async function listOrganizations() {
  console.log('🔍 Checking existing organizations...');
  
  try {
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('id, name, subdomain')
      .limit(10);
    
    if (error) {
      console.log('❌ Error fetching organizations:', error);
      return null;
    }
    
    console.log('📋 Found organizations:');
    orgs.forEach(org => {
      console.log(`  - ${org.name} (${org.subdomain}) - ID: ${org.id}`);
    });
    
    return orgs;
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return null;
  }
}

// Beautiful Church Platform Landing Page Data
const landingPageData = {
  content: [
    // Header with Navigation
    {
      type: "SimpleHeader",
      props: {
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        borderBottom: true,
        sticky: true,
        logoText: "Church-OS",
        logoSize: 32,
        logoPosition: "left",
        showUserMenu: false,
        enablePageManagement: false,
        layout: "default",
        navigationStyle: "horizontal",
        fontFamily: "Inter",
        fontSize: 16,
        fontWeight: "medium"
      }
    },
    
    // Hero Section
    {
      type: "Hero",
      props: {
        title: "Transform Your Church with Modern Technology",
        subtitle: "The Complete Church Management Platform",
        description: "Build beautiful websites, manage your congregation, and grow your community with our comprehensive platform designed specifically for churches.",
        primaryButtonText: "Start Free Trial",
        primaryButtonUrl: "/signup",
        secondaryButtonText: "Watch Demo",
        secondaryButtonUrl: "/demo",
        backgroundType: "gradient",
        gradientFrom: "#1e40af",
        gradientTo: "#7c3aed",
        textColor: "#ffffff",
        alignment: "center",
        size: "large",
        showImage: true,
        imageUrl: "https://images.unsplash.com/photo-1438032005730-c779502df39b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        imagePosition: "right",
        overlayOpacity: 0.7
      }
    },

    // Church Stats Section
    {
      type: "ChurchStats",
      props: {
        title: "Trusted by Churches Worldwide",
        subtitle: "Join thousands of churches already using our platform",
        stat1Number: "10,000+",
        stat1Label: "Churches",
        stat1Description: "Active communities",
        stat1Enabled: true,
        stat2Number: "500K+",
        stat2Label: "Members",
        stat2Description: "Connected worldwide",
        stat2Enabled: true,
        stat3Number: "99.9%",
        stat3Label: "Uptime",
        stat3Description: "Reliable service",
        stat3Enabled: true,
        stat4Number: "24/7",
        stat4Label: "Support",
        stat4Description: "Always here to help",
        stat4Enabled: true,
        layout: "horizontal",
        color: "blue",
        showAnimations: true,
        backgroundColor: "#f9fafb",
        padding: "large"
      }
    },

    // Feature Grid Section
    {
      type: "FeatureGrid",
      props: {
        title: "Everything Your Church Needs",
        subtitle: "Powerful features for modern ministry",
        description: "Our comprehensive platform provides all the tools your church needs to thrive in the digital age.",
        features: [
          {
            id: '1',
            title: 'Beautiful Websites',
            description: 'Create stunning, responsive websites with our intuitive drag-and-drop builder. No coding required.',
            icon: '🎨',
            color: '#3b82f6'
          },
          {
            id: '2',
            title: 'Member Management',
            description: 'Keep track of your congregation with powerful member management and communication tools.',
            icon: '👥',
            color: '#10b981'
          },
          {
            id: '3',
            title: 'Event Planning',
            description: 'Organize and promote church events with integrated calendar, RSVP, and notification systems.',
            icon: '📅',
            color: '#f59e0b'
          },
          {
            id: '4',
            title: 'Online Giving',
            description: 'Accept donations securely with integrated payment processing and automated receipts.',
            icon: '💝',
            color: '#ef4444'
          },
          {
            id: '5',
            title: 'Communication Hub',
            description: 'Stay connected with email newsletters, SMS messaging, and announcement systems.',
            icon: '📢',
            color: '#8b5cf6'
          },
          {
            id: '6',
            title: 'Analytics & Insights',
            description: 'Track growth and engagement with detailed analytics and comprehensive reports.',
            icon: '📊',
            color: '#06b6d4'
          }
        ],
        columns: 3,
        layout: 'card',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        cardStyle: 'elevated',
        showIcons: true,
        iconSize: 'medium'
      }
    },

    // Testimonial Section
    {
      type: "Testimonial",
      props: {
        quote: "Church-OS has completely transformed how we connect with our congregation. The website builder is incredibly intuitive, and the member management features have streamlined our operations significantly.",
        author: "Pastor Sarah Johnson",
        position: "Lead Pastor",
        organization: "Grace Community Church",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        layout: "centered",
        backgroundColor: "#f3f4f6",
        textColor: "#1f2937",
        accentColor: "#3b82f6"
      }
    },

    // Pricing Table Section
    {
      type: "PricingTable",
      props: {
        title: "Choose Your Plan",
        subtitle: "Flexible pricing for churches of all sizes",
        description: "Start with our free plan and upgrade as your church grows. All plans include our core features with no setup fees.",
        plans: [
          {
            id: '1',
            name: 'Starter',
            price: 'Free',
            period: 'forever',
            description: 'Perfect for small churches getting started',
            features: [
              'Basic website builder',
              'Up to 100 members',
              'Email support',
              'Basic templates',
              'SSL certificate',
              'Mobile responsive'
            ],
            buttonText: 'Get Started Free',
            buttonUrl: '/signup',
            popular: false,
            color: '#6b7280'
          },
          {
            id: '2',
            name: 'Growth',
            price: '$29',
            period: 'per month',
            description: 'For growing churches with active communities',
            features: [
              'Advanced website builder',
              'Up to 500 members',
              'Event management',
              'Online giving',
              'Email campaigns',
              'Priority support',
              'Custom domain',
              'Advanced analytics'
            ],
            buttonText: 'Start Free Trial',
            buttonUrl: '/signup?plan=growth',
            popular: true,
            color: '#3b82f6'
          },
          {
            id: '3',
            name: 'Pro',
            price: '$79',
            period: 'per month',
            description: 'For established churches with advanced needs',
            features: [
              'Everything in Growth',
              'Unlimited members',
              'Multi-site management',
              'API access',
              'White-label options',
              'Dedicated support',
              'Custom integrations',
              'Advanced security'
            ],
            buttonText: 'Contact Sales',
            buttonUrl: '/contact',
            popular: false,
            color: '#7c3aed'
          }
        ],
        layout: 'cards',
        showAnnualDiscount: true,
        annualDiscountText: "Save 20% with annual billing",
        backgroundColor: '#f9fafb',
        textColor: '#1f2937'
      }
    },

    // FAQ Section
    {
      type: "FAQ",
      props: {
        title: "Frequently Asked Questions",
        subtitle: "Everything you need to know",
        description: "Can't find the answer you're looking for? Our support team is here to help.",
        faqs: [
          {
            id: '1',
            question: 'How quickly can I get my church website up and running?',
            answer: 'Most churches have their website live within 24 hours! Our intuitive drag-and-drop builder makes it easy to create a beautiful site in minutes. Choose from our professionally designed templates and customize them to match your church\'s brand.'
          },
          {
            id: '2',
            question: 'Can I import my existing member data?',
            answer: 'Absolutely! We provide easy import tools to help you migrate your existing member database. You can import from CSV files, Excel spreadsheets, or connect with popular church management systems. Our support team is available to help with the migration process.'
          },
          {
            id: '3',
            question: 'Is my church data secure and private?',
            answer: 'Security is our top priority. We use enterprise-grade security measures including SSL encryption, regular automated backups, and secure data centers. Your church data is protected with bank-level security, and we never share your information with third parties.'
          },
          {
            id: '4',
            question: 'How does online giving work?',
            answer: 'Our integrated payment processing makes it easy for your congregation to give online. We support credit cards, bank transfers, and recurring donations with competitive processing fees. All transactions are secure, and donors receive automated receipts for tax purposes.'
          },
          {
            id: '5',
            question: 'What kind of support do you provide?',
            answer: 'We provide comprehensive support including email support for all plans, priority support for Growth plans, and dedicated phone support for Pro plans. We also have extensive documentation, video tutorials, and a community forum where churches share best practices.'
          },
          {
            id: '6',
            question: 'Can I cancel my subscription anytime?',
            answer: 'Yes, you can cancel your subscription at any time with no cancellation fees or long-term contracts. Your data will remain accessible during your current billing period, and you can export all your information if needed.'
          }
        ],
        layout: 'accordion',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        accentColor: '#3b82f6'
      }
    },

    // Final Call to Action
    {
      type: "CallToAction",
      props: {
        title: "Ready to Transform Your Church?",
        subtitle: "Join thousands of churches already growing with Church-OS",
        description: "Start your free trial today and see how easy it is to build a beautiful website, manage your congregation, and grow your community.",
        primaryButtonText: "Start Free Trial",
        primaryButtonUrl: "/signup",
        secondaryButtonText: "Schedule Demo",
        secondaryButtonUrl: "/demo",
        backgroundType: "gradient",
        backgroundColor: "#1e40af",
        gradientFrom: "#1e40af",
        gradientTo: "#7c3aed",
        textColor: "#ffffff",
        buttonStyle: "filled",
        size: "large",
        alignment: "center",
        showIcon: true,
        icon: "🚀"
      }
    },

    // Footer
    {
      type: "Footer",
      props: {
        companyName: "Church-OS",
        description: "The complete church management platform designed to help your church thrive in the digital age.",
        links: [
          { label: "Features", url: "/features" },
          { label: "Pricing", url: "/pricing" },
          { label: "Support", url: "/support" },
          { label: "Contact", url: "/contact" },
          { label: "Privacy", url: "/privacy" },
          { label: "Terms", url: "/terms" }
        ],
        socialLinks: [
          { platform: "facebook", url: "https://facebook.com/churchos" },
          { platform: "twitter", url: "https://twitter.com/churchos" },
          { platform: "instagram", url: "https://instagram.com/churchos" },
          { platform: "youtube", url: "https://youtube.com/churchos" }
        ],
        backgroundColor: "#1f2937",
        textColor: "#ffffff",
        linkColor: "#9ca3af",
        showSocialLinks: true,
        layout: "multi-column",
        copyright: "© 2024 Church-OS. All rights reserved."
      }
    }
  ],
  root: {
    title: "Church-OS - Transform Your Church with Modern Technology"
  }
};

async function createLandingPage() {
  try {
    console.log('🚀 Creating beautiful Church Platform landing page...');
    
    // Show what we're going to create first
    console.log('🎨 Generated Landing Page Structure:');
    console.log('');
    console.log('📋 Components included:');
    landingPageData.content.forEach((component, index) => {
      console.log(`   ${index + 1}. ${component.type}${component.props.title ? ` - "${component.props.title}"` : ''}`);
    });
    console.log('');
    console.log('🎯 Landing Page Features:');
    console.log('   • Professional hero section with gradient background');
    console.log('   • Church statistics showcase (10K+ churches, 500K+ members)');
    console.log('   • 6-feature grid highlighting platform capabilities');
    console.log('   • Customer testimonial from Pastor Sarah Johnson');
    console.log('   • 3-tier pricing table (Free, $29/mo, $79/mo)');
    console.log('   • 6-question FAQ section with accordion');
    console.log('   • Final call-to-action section');
    console.log('   • Professional footer with links and social media');
    console.log('');

    // First, let's list existing organizations to see what's available
    console.log('🔍 Attempting to connect to database...');
    const orgs = await listOrganizations();
    if (!orgs || orgs.length === 0) {
      console.log('❌ Database connection failed, but here\'s what would be created:');
      console.log('');
      console.log('📄 Landing Page Content Preview:');
      console.log('   Title: "Church-OS - Transform Your Church with Modern Technology"');
      console.log('   Main Headline: "Transform Your Church with Modern Technology"');
      console.log('   Subtitle: "The Complete Church Management Platform"');
      console.log('   Features: Website Builder, Member Management, Events, Giving, Communications, Analytics');
      console.log('   Pricing: Free Starter, $29 Growth, $79 Pro');
      console.log('');
      console.log('🔧 This would create a fully responsive, professional landing page');
      console.log('   optimized for church website conversion and engagement.');
      console.log('');
      console.log('📏 Content Structure Size:');
      console.log(`   • Total components: ${landingPageData.content.length}`);
      console.log(`   • Content data size: ~${JSON.stringify(landingPageData).length} characters`);
      console.log('   • All components are fully editable in Puck page builder');
      console.log('');
      console.log('💡 To actually create this page, ensure Supabase connection is working');
      return;
    }

    // Use the first organization found, or look for a specific one
    let targetOrg = orgs.find(org => org.name.includes('Church') || org.name.includes('Platform'));
    if (!targetOrg) {
      targetOrg = orgs[0]; // Use the first organization
    }

    console.log('✅ Using organization:', targetOrg.name, '(ID:', targetOrg.id, ')');
    const organizationId = targetOrg.id;

    // Check if homepage already exists
    const { data: existingPage, error: checkError } = await supabase
      .from('pages')
      .select('id, title')
      .eq('organization_id', organizationId)
      .eq('is_homepage', true)
      .single();

    if (existingPage) {
      console.log('📄 Homepage already exists, updating it...');
      
      // Update existing homepage
      const { error: updateError } = await supabase
        .from('pages')
        .update({
          title: 'Church-OS Platform - Home',
          content: landingPageData,
          published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPage.id);

      if (updateError) {
        console.error('❌ Error updating homepage:', updateError);
        return;
      }

      console.log('✅ Homepage updated successfully!');
    } else {
      console.log('📄 Creating new homepage...');
      
      // Create new homepage
      const { data: newPage, error: createError } = await supabase
        .from('pages')
        .insert({
          organization_id: organizationId,
          title: 'Church-OS Platform - Home',
          slug: 'home',
          content: landingPageData,
          is_homepage: true,
          published: true,
          show_in_navigation: false, // Homepage usually doesn't show in nav
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating homepage:', createError);
        return;
      }

      console.log('✅ Homepage created successfully!');
    }

    console.log('🎉 Beautiful Church Platform landing page is ready!');
    console.log('');
    console.log('🌟 Features included:');
    console.log('   • Modern hero section with gradient background');
    console.log('   • Church statistics showcase');
    console.log('   • Feature grid highlighting platform capabilities');
    console.log('   • Customer testimonial');
    console.log('   • Pricing table with 3 tiers');
    console.log('   • FAQ section with accordion');
    console.log('   • Call-to-action section');
    console.log('   • Professional footer');
    console.log('');
    console.log('🔧 All components are fully editable in the Puck editor!');
    console.log('📱 The page is fully responsive and mobile-friendly');
    console.log('🎨 Professional design with modern UI/UX best practices');
    console.log('');
    console.log('🌐 Visit http://localhost:8080 to see your new landing page!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createLandingPage(); 