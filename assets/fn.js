// Function to convert JSON to CSV
function convertJSONToCSV(jsonData) {
    const products = jsonData.products;
    
    // CSV Headers
    const headers = [
        'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
        'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 
        'Option3 Name', 'Option3 Value', 'Variant SKU', 'Variant Grams', 
        'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
        'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price',
        'Variant Requires Shipping', 'Variant Taxable', 'Variant Barcode',
        'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card', 'SEO Title',
        'SEO Description', 'Google Shopping / Google Product Category',
        'Google Shopping / Gender', 'Google Shopping / Age Group', 'Google Shopping / MPN',
        'Google Shopping / AdWords Grouping', 'Google Shopping / AdWords Labels',
        'Google Shopping / Condition', 'Google Shopping / Custom Product',
        'Google Shopping / Custom Label 0', 'Google Shopping / Custom Label 1',
        'Google Shopping / Custom Label 2', 'Google Shopping / Custom Label 3',
        'Google Shopping / Custom Label 4', 'Variant Image', 'Variant Weight Unit',
        'Variant Tax Code'
    ];

    let csvRows = [headers.join(',')];

    // Process each product
    products.forEach(product => {
        // Skip empty products
        if (!product.id) return;

        // Process each variant for this product
        product.variants.forEach((variant, variantIndex) => {
            let row = [];
            
            // Handle
            row.push(escapeCSV(product.handle || ''));
            
            // Title
            row.push(escapeCSV(product.title || ''));
            
            // Body (HTML)
            row.push(escapeCSV(product.body_html || ''));
            
            // Vendor
            row.push(escapeCSV(product.vendor || ''));
            
            // Type
            row.push(escapeCSV(product.product_type || ''));
            
            // Tags
            row.push(escapeCSV(Array.isArray(product.tags) ? product.tags.join(', ') : ''));
            
            // Published
            row.push(escapeCSV(product.published_at ? 'true' : 'false'));
            
            // Option Names and Values
            const options = product.options || [];
            row.push(escapeCSV(options[0]?.name || ''));
            row.push(escapeCSV(variant.option1 || ''));
            row.push(escapeCSV(options[1]?.name || ''));
            row.push(escapeCSV(variant.option2 || ''));
            row.push(escapeCSV(options[2]?.name || ''));
            row.push(escapeCSV(variant.option3 || ''));
            
            // Variant SKU
            row.push(escapeCSV(variant.sku || ''));
            
            // Variant Grams
            row.push(escapeCSV(variant.grams?.toString() || '0'));
            
            // Variant Inventory Tracker
            row.push(escapeCSV('shopify'));
            
            // Variant Inventory Qty
            row.push(escapeCSV(variant.available ? '999' : '0'));
            
            // Variant Inventory Policy
            row.push(escapeCSV('deny'));
            
            // Variant Fulfillment Service
            row.push(escapeCSV('manual'));
            
            // Variant Price
            row.push(escapeCSV(variant.price || '0.00'));
            
            // Variant Compare At Price
            row.push(escapeCSV(variant.compare_at_price || ''));
            
            // Variant Requires Shipping
            row.push(escapeCSV(variant.requires_shipping ? 'true' : 'false'));
            
            // Variant Taxable
            row.push(escapeCSV(variant.taxable ? 'true' : 'false'));
            
            // Variant Barcode
            row.push(escapeCSV(variant.sku || ''));
            
            // Image Src - Get first image or variant-specific image
            let imageSrc = '';
            let imagePosition = '';
            let imageAltText = '';
            
            if (variant.featured_image) {
                imageSrc = variant.featured_image.src;
                imagePosition = '1';
                imageAltText = variant.featured_image.alt || '';
            } else if (product.images && product.images.length > 0) {
                const firstImage = product.images[0];
                imageSrc = firstImage.src;
                imagePosition = (firstImage.position || 1).toString();
                imageAltText = firstImage.alt || '';
            }
            row.push(escapeCSV(imageSrc));
            row.push(escapeCSV(imagePosition));
            row.push(escapeCSV(imageAltText));
            
            // Gift Card
            row.push(escapeCSV('false'));
            
            // SEO Title
            row.push(escapeCSV(''));
            
            // SEO Description
            row.push(escapeCSV(''));
            
            // Google Shopping fields (empty for now)
            row.push(escapeCSV('')); // Google Product Category
            row.push(escapeCSV('')); // Gender
            row.push(escapeCSV('')); // Age Group
            row.push(escapeCSV('')); // MPN
            row.push(escapeCSV('')); // AdWords Grouping
            row.push(escapeCSV('')); // AdWords Labels
            row.push(escapeCSV('')); // Condition
            row.push(escapeCSV('')); // Custom Product
            row.push(escapeCSV('')); // Custom Label 0
            row.push(escapeCSV('')); // Custom Label 1
            row.push(escapeCSV('')); // Custom Label 2
            row.push(escapeCSV('')); // Custom Label 3
            row.push(escapeCSV('')); // Custom Label 4
            
            // Variant Image
            row.push(escapeCSV(variant.featured_image?.src || ''));
            
            // Variant Weight Unit
            row.push(escapeCSV('g'));
            
            // Variant Tax Code
            row.push(escapeCSV(''));
            
            csvRows.push(row.join(','));
        });
    });

    return csvRows.join('\n');
}

// Helper function to escape CSV values
function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    
    const stringValue = String(value);
    
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
}

// Function to download CSV file
function downloadCSV(csvContent, filename = 'products.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Usage with your JSON data
const csvData = convertJSONToCSV(jsonData);
console.log(csvData);

// To download the CSV file
// downloadCSV(csvData, 'shopify_products.csv');