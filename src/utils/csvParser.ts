interface ConversionData {
  inches: number;
  centimeters: number;
  uniqueFact: string;
  context: string;
  slug: string;
}

export function parseCSV(csvContent: string): ConversionData[] {
  const lines = csvContent.trim().split('\n');
  
  // Filter out empty lines to prevent parsing errors
  const validLines = lines.filter(line => line.trim().length > 0);
  
  if (validLines.length < 2) {
    console.warn('CSV file appears to be empty or malformed');
    return [];
  }
  
  const headers = validLines[0].split(',');
  
  return validLines.slice(1).map(line => {
    // Handle CSV parsing with quoted fields
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    const cleanValues = values.map(val => val.replace(/^"|"$/g, ''));
    
    // Skip lines that don't have enough data
    if (cleanValues.length < 4) {
      return null;
    }
    
    const inches = parseFloat(cleanValues[0]);
    const centimeters = parseFloat(cleanValues[1]);
    const uniqueFact = cleanValues[2] || '';
    const context = cleanValues[3] || 'daily life';
    
    // Skip invalid numeric data
    if (isNaN(inches) || isNaN(centimeters) || !isFinite(inches) || !isFinite(centimeters)) {
      return null;
    }
    
    // Generate SEO-friendly slug
    const slug = `${inches.toString().replace('.', '-')}-pollici-in-cm`;
    
    return {
      inches,
      centimeters,
      uniqueFact,
      context,
      slug
    };
  }).filter(Boolean); // Remove null entries
}

export function generateRelatedConversions(currentInches: number, allData: ConversionData[]) {
  const related = [];
  const variations = [-0.1, -0.05, 0.05, 0.1];
  
  for (const variation of variations) {
    const targetInches = Math.round((currentInches + variation) * 100) / 100;
    if (targetInches > 0) {
      const existing = allData.find(item => Math.abs(item.inches - targetInches) < 0.001);
      if (existing) {
        related.push(existing);
      } else {
        // Generate calculated conversion if not in dataset
        related.push({
          inches: targetInches,
          centimeters: Math.round(targetInches * 2.54 * 100) / 100,
          uniqueFact: '',
          context: 'daily life',
          slug: `${targetInches.toString().replace('.', '-')}-pollici-in-cm`
        });
      }
    }
  }
  
  return related;
}

export function generateCategoryLinks(currentInches: number, allData: ConversionData[]) {
  // Categorize based on inches value
  let category: ConversionData[] = [];
  
  if (currentInches < 1) {
    // Fractions category
    category = allData.filter(item => item.inches < 1);
  } else if (currentInches <= 10) {
    // Small integers category
    category = allData.filter(item => item.inches >= 1 && item.inches <= 10);
  } else if (currentInches <= 50) {
    // Medium category
    category = allData.filter(item => item.inches > 10 && item.inches <= 50);
  } else {
    // Large category
    category = allData.filter(item => item.inches > 50);
  }
  
  // Remove current item and return up to 8 items
  return category
    .filter(item => item.inches !== currentInches)
    .slice(0, 8);
}

export function generateRandomLinks(allData: ConversionData[], currentSlug: string) {
  // Filter out current item
  const filtered = allData.filter(item => item.slug !== currentSlug);
  
  // Shuffle array and return first 6 items
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6);
}