// Script to fix all hardcoded localhost URLs in frontend
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/pages/MyApplications.jsx',
  'src/pages/JobPostingPayment.jsx', 
  'src/pages/CompanySettings.jsx',
  'src/context/AuthMetaContext.jsx',
  'src/components/JobSeekerProfileForm.jsx',
  'src/components/JobManagement.jsx',
  'src/components/JobApplicationModal.jsx',
  'src/components/job-seeker-dashboard.jsx',
  'src/components/CompanyDetailsForm.jsx',
  'src/components/CompanyDashboard.jsx',
  'src/App.jsx'
];

const frontendDir = './frontend';

filesToFix.forEach(filePath => {
  const fullPath = path.join(frontendDir, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Add import if not already present
    if (!content.includes("import { API_BASE_URL } from")) {
      const importLines = content.split('\n');
      let insertIndex = 0;
      
      // Find last import statement
      for (let i = 0; i < importLines.length; i++) {
        if (importLines[i].trim().startsWith('import ')) {
          insertIndex = i + 1;
        }
      }
      
      importLines.splice(insertIndex, 0, "import { API_BASE_URL } from '@/config/api';");
      content = importLines.join('\n');
    }
    
    // Replace all localhost URLs
    content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');
    
    // Fix template literals that got broken
    content = content.replace(/`\$\{API_BASE_URL\}/g, '`${API_BASE_URL}');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('All files updated!');
