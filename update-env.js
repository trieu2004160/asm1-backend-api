const fs = require('fs');
const path = require('path');

function updateEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  try {
    // Read current .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update FRONTEND_URL to port 8081
    const lines = envContent.split('\n');
    let updated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('FRONTEND_URL=')) {
        lines[i] = 'FRONTEND_URL=http://localhost:8081';
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      lines.push('FRONTEND_URL=http://localhost:8081');
    }
    
    // Write back to .env file
    fs.writeFileSync(envPath, lines.join('\n'));
    
    console.log('✅ Updated .env file with FRONTEND_URL=http://localhost:8081');
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
  }
}

updateEnvFile();
