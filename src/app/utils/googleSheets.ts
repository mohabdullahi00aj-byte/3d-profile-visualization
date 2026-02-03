export interface PersonData {
  name: string;
  age: number;
  occupation: string;
  netWorth: number;
}

export async function fetchGoogleSheetData(): Promise<PersonData[]> {
  try {
    // Convert the published HTML URL to CSV export URL
    const sheetId = '1vSuhMMQASquMlnnasRDuGDPXGldZ3srGWfENnemvb9hs2e6_Nn5jovs27AFFoB9mtK7-DJIX8hy4tbA';
    const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-${sheetId}/pub?output=csv`;
    
    console.log('Fetching data from Google Sheets...');
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    console.log('Received CSV data');
    
    const parsed = parseCSV(csvText);
    if (parsed.length > 0) {
      console.log('Successfully parsed', parsed.length, 'records from Google Sheets');
      return parsed;
    } else {
      console.log('No data parsed from sheet, using mock data');
      return generateMockData();
    }
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    console.log('Using mock data instead');
    // Return mock data if fetch fails
    return generateMockData();
  }
}

function parseCSV(csvText: string): PersonData[] {
  const lines = csvText.split('\n');
  const data: PersonData[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Proper CSV parsing that handles quoted values with commas
    const values = parseCSVLine(line);
    
    if (values.length >= 6) {
      // CSV structure: Name, Photo, Age, Country, Interest, Net Worth
      const name = values[0] || `Person ${i}`;
      const age = parseInt(values[2]) || 0;
      const country = values[3] || 'Unknown'; // Using country as occupation for now
      const netWorthString = values[5] || '0'; // Net Worth is in column 5
      
      // Clean and parse Net Worth: remove $, commas, quotes and convert to number
      const cleanNetWorth = netWorthString.replace(/[$,"]/g, ''); // Remove $, commas, and quotes
      const netWorth = parseFloat(cleanNetWorth) || 0;
      
      const person: PersonData = {
        name: name,
        age: age,
        occupation: country, // Using country as occupation since there's no occupation column
        netWorth: netWorth,
      };
      
      // Debug logging for first few records
      if (i <= 3) {
        const colorName = netWorth < 100000 ? 'RED' : netWorth < 200000 ? 'ORANGE' : 'GREEN';
        console.log(`${person.name}: $${netWorth.toLocaleString()} → ${colorName}`);
      }
      
      data.push(person);
    }
  }
  
  console.log(`Successfully parsed ${data.length} records with proper Net Worth values`);
  return data.length > 0 ? data : generateMockData();
}

// Helper function to properly parse CSV lines with quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

function generateMockData(): PersonData[] {
  const names = [
    'John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis', 'James Wilson',
    'Jessica Martinez', 'David Anderson', 'Jennifer Taylor', 'Robert Thomas', 'Lisa Moore',
    'William Jackson', 'Mary White', 'Richard Harris', 'Patricia Martin', 'Christopher Thompson',
    'Nancy Garcia', 'Daniel Martinez', 'Karen Robinson', 'Matthew Clark', 'Betty Rodriguez'
  ];
  
  const occupations = [
    'Software Engineer', 'Product Designer', 'Project Manager', 'Data Scientist', 
    'Business Analyst', 'Marketing Consultant', 'Engineering Director', 'UX Specialist',
    'DevOps Engineer', 'Sales Manager', 'Financial Analyst', 'HR Director',
    'Content Strategist', 'Operations Manager', 'Security Engineer', 'Creative Director'
  ];
  
  const data: PersonData[] = [];
  
  for (let i = 0; i < 200; i++) {
    // Create varied net worth distribution - ensure good color variety
    let netWorth;
    const colorIndex = i % 3; // Cycle through 3 color categories
    
    if (colorIndex === 0) {
      // Red: < 100K (33% of records)
      netWorth = 30000 + Math.random() * 65000; // 30K - 95K
    } else if (colorIndex === 1) {
      // Orange: 100K - 200K (33% of records)  
      netWorth = 100000 + Math.random() * 95000; // 100K - 195K
    } else {
      // Green: > 200K (33% of records)
      netWorth = 200000 + Math.random() * 300000; // 200K - 500K
    }
    
    data.push({
      name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
      age: Math.floor(Math.random() * 40) + 25,
      occupation: occupations[i % occupations.length],
      netWorth: Math.round(netWorth),
    });
  }
  
  console.log('Generated mock data:', data.length, 'records');
  return data;
}

export function getNetWorthColor(netWorth: number): string {
  if (netWorth < 100000) {
    return '#ef4444'; // Red
  } else if (netWorth < 200000) {
    return '#f97316'; // Orange
  } else {
    return '#22c55e'; // Green
  }
}

export function formatNetWorth(netWorth: number): string {
  if (netWorth >= 1000000) {
    return `$${(netWorth / 1000000).toFixed(1)}M`;
  } else if (netWorth >= 1000) {
    return `$${(netWorth / 1000).toFixed(0)}K`;
  }
  return `$${netWorth.toFixed(0)}`;
}
