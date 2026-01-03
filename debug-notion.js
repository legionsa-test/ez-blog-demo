const { NotionAPI } = require('notion-client');

async function testFetch() {
    const notion = new NotionAPI();
    const pageUrl = 'https://hikalvin.notion.site/2dc27bd11ca081ab9f5ed535cd75ba4a';

    // Extract page ID
    const urlParts = pageUrl.split('/').pop()?.split('-') || [];
    let pageId = urlParts[urlParts.length - 1] || '';
    if (pageId.length === 32) {
        pageId = `${pageId.slice(0, 8)}-${pageId.slice(8, 12)}-${pageId.slice(12, 16)}-${pageId.slice(16, 20)}-${pageId.slice(20)}`;
    }

    console.log('Fetching page:', pageId);
    const recordMap = await notion.getPage(pageId);

    // Get collection schema
    const collectionId = Object.keys(recordMap.collection)[0];
    const collection = recordMap.collection[collectionId]?.value;
    const schema = collection?.schema || {};

    console.log('\n=== SCHEMA ===');
    for (const [propId, propDef] of Object.entries(schema)) {
        console.log(`${propDef.name} [${propDef.type}] => propId: ${propId}`);
    }

    // Helper to extract text
    function extractText(arr) {
        if (!arr) return '';
        return arr.map(segment => segment[0]).join('');
    }

    console.log('\n=== ALL BLOCKS ===');
    let rowCount = 0;
    for (const [blockId, blockData] of Object.entries(recordMap.block)) {
        const block = blockData?.value;
        if (!block || block.type !== 'page' || block.parent_table !== 'collection') {
            continue;
        }
        rowCount++;

        const properties = block.properties || {};
        console.log(`\nRow #${rowCount}: ${blockId}`);
        console.log('Raw property IDs:', Object.keys(properties));

        // Try to extract title using schema
        for (const [propId, propDef] of Object.entries(schema)) {
            if (propDef.type === 'title') {
                const titleValue = properties[propId];
                const title = extractText(titleValue);
                console.log(`Title (${propId}):`, title || '<<EMPTY>>');
            }
        }

        // Show all property values
        for (const [propId, propDef] of Object.entries(schema)) {
            const value = properties[propId];
            if (value) {
                let displayValue;
                if (propDef.type === 'title' || propDef.type === 'text') {
                    displayValue = extractText(value);
                } else if (propDef.type === 'select') {
                    displayValue = value[0]?.[0] || '';
                } else {
                    displayValue = JSON.stringify(value).slice(0, 80);
                }
                console.log(`  ${propDef.name}:`, displayValue);
            }
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log('Total collection rows found:', rowCount);
}

testFetch().catch(console.error);
