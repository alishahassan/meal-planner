// HelloFresh Recipe Scraper
// Scrapes recipe information from HelloFresh alphabetical pages

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class HelloFreshScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.linksByLetter = {};
        this.recipesByLetter = {};
        this.alphabetDict = {
            'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F',
            'g': 'G', 'h': 'H', 'i': 'I', 'j': 'J', 'k': 'K', 'l': 'L',
            'm': 'M', 'n': 'N', 'o': 'O', 'p': 'P', 'q': 'Q', 'r': 'R',
            's': 'S', 't': 'T', 'u': 'U', 'v': 'V', 'w': 'W', 'x': 'X',
            'y': 'Y', 'z': 'Z'
        };
        this.csvHeaders = [
            'Title',
            'Total Time',
            'Difficulty', 
            'Allergens',
            'Calories',
            'Fat',
            'Saturated Fat',
            'Carbohydrate',
            'Sugar',
            'Dietary Fiber',
            'Protein',
            'Cholesterol',
            'Sodium',
            'Ingredients'
        ];
    }

    async initialize() {
        this.browser = await puppeteer.launch({ 
            headless: false, // Set to true for background operation
            defaultViewport: { width: 1920, height: 1080 }
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    }

    async getRecipeLinksForLetter(lowercase, uppercase) {
        try {
            console.log(`Scraping recipes starting with "${uppercase}"...`);
            const url = `https://www.hellofresh.com/pages/sitemap/recipes-${lowercase}`;
            
            await this.page.goto(url, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Clean scraping without debug output
            
            // Simplified approach: get all recipe links first
            const links = await this.page.evaluate((letter) => {
                const recipeLinks = [];
                
                // Get ALL links that contain /recipes/
                const allLinks = document.querySelectorAll('a[href*="/recipes/"]');
                console.log(`Found ${allLinks.length} total recipe-related links`);
                
                allLinks.forEach(link => {
                    if (link.href && link.href.includes('/recipes/')) {
                        recipeLinks.push({
                            url: link.href,
                            text: link.textContent.trim()
                        });
                    }
                });
                
                // Filter to get actual recipe links (not category pages)
                const filteredLinks = recipeLinks.filter(item => {
                    const url = item.url;
                    const text = item.text;
                    
                    // Must be a proper recipe URL pattern (more flexible)
                    const isProperUrl = url.match(/\/recipes\/[a-z0-9\-w]+/) &&
                                       !url.includes('/recipes/vegetarian-recipes') &&
                                       !url.includes('/recipes/quick-meals') &&
                                       !url.includes('/recipes/most-') &&
                                       !url.includes('/recipes/easy-recipes') &&
                                       !url.includes('/recipes/$');
                    
                    // Must have meaningful recipe name text (more flexible)
                    const hasGoodText = text.length > 10 && 
                                       !text.toLowerCase().includes('vegetarian recipes') &&
                                       !text.toLowerCase().includes('meal ideas') &&
                                       !text.toLowerCase().includes('dinner recipes') &&
                                       !text.toLowerCase().includes('quick recipes') &&
                                       !text.toLowerCase().includes('new recipes') &&
                                       !text.toLowerCase().includes('popular recipes') &&
                                       !text.toLowerCase().includes('easy recipes');
                    
                    return isProperUrl && hasGoodText;
                }).map(item => item.url);
                
                // Remove duplicates
                const uniqueLinks = [...new Set(filteredLinks)];
                console.log(`Filtered to ${uniqueLinks.length} unique recipe links for ${letter}`);
                
                return uniqueLinks;
            }, uppercase);

            console.log(`Found ${links.length} recipes for letter "${uppercase}"`);
            this.linksByLetter[uppercase] = links;
            return links;
            
        } catch (error) {
            console.error(`Error scraping letter ${uppercase}:`, error.message);
            return [];
        }
    }

    async scrapeRecipeDetails(recipeUrl) {
        try {
            await this.page.goto(recipeUrl, { waitUntil: 'networkidle2' });
            await new Promise(resolve => setTimeout(resolve, 1000));

            const recipeData = await this.page.evaluate(() => {
                const data = {
                    url: window.location.href,
                    title: '',
                    totalTime: '',
                    difficulty: '',
                    allergens: [],
                    nutrition: {},
                    ingredients: {
                        servingAmount: '',
                        items: [],
                        notIncluded: []
                    }
                };

                // Get title
                const titleEl = document.querySelector('h1');
                if (titleEl) data.title = titleEl.textContent.trim();

                // Get total time
                const timeEl = document.querySelector('[data-test-id="recipe-time"]') || 
                             document.querySelector('*[class*="time"]');
                if (timeEl) data.totalTime = timeEl.textContent.trim();

                // Get difficulty
                const difficultyEl = document.querySelector('[data-test-id="recipe-difficulty"]') || 
                                   document.querySelector('*[class*="difficulty"]');
                if (difficultyEl) data.difficulty = difficultyEl.textContent.trim();

                // Get allergens
                const allergenEls = document.querySelectorAll('[data-test-id*="allergen"]') ||
                                  document.querySelectorAll('*[class*="allergen"]');
                allergenEls.forEach(el => {
                    if (el.textContent.trim()) data.allergens.push(el.textContent.trim());
                });

                // Get nutrition values
                const nutritionEls = document.querySelectorAll('[data-test-id*="nutrition"]') ||
                                   document.querySelectorAll('*[class*="nutrition"] *');
                nutritionEls.forEach(el => {
                    const text = el.textContent.trim();
                    if (text.includes('Calories')) data.nutrition.calories = text;
                    if (text.includes('Fat') && !text.includes('Saturated')) data.nutrition.fat = text;
                    if (text.includes('Saturated Fat')) data.nutrition.saturatedFat = text;
                    if (text.includes('Carbohydrate')) data.nutrition.carbohydrate = text;
                    if (text.includes('Sugar')) data.nutrition.sugar = text;
                    if (text.includes('Dietary Fiber')) data.nutrition.dietaryFiber = text;
                    if (text.includes('Protein')) data.nutrition.protein = text;
                    if (text.includes('Cholesterol')) data.nutrition.cholesterol = text;
                    if (text.includes('Sodium')) data.nutrition.sodium = text;
                });

                // Get serving amount
                const servingEl = document.querySelector('[data-test-id*="serving"]') ||
                                document.querySelector('*[class*="serving"]');
                if (servingEl) data.ingredients.servingAmount = servingEl.textContent.trim();

                // Get ingredients
                const ingredientEls = document.querySelectorAll('[data-test-id*="ingredient"]') ||
                                    document.querySelectorAll('*[class*="ingredient"]');
                ingredientEls.forEach(el => {
                    const text = el.textContent.trim();
                    if (text && !text.includes('Not included')) {
                        data.ingredients.items.push(text);
                    }
                });

                // Cooking steps removed due to formatting issues

                return data;
            });

            return recipeData;

        } catch (error) {
            console.error(`Error scraping recipe ${recipeUrl}:`, error.message);
            return null;
        }
    }

    async collectAllLinks(testMode = false) {
        console.log('Collecting all recipe links by letter...');
        
        // First pass: collect all links for each letter
        const lettersToProcess = testMode ? 
            [['a', 'A'], ['q', 'Q'], ['y', 'Y']] : // Test with problematic letters
            Object.entries(this.alphabetDict);
            
        for (const [lowercase, uppercase] of lettersToProcess) {
            await this.getRecipeLinksForLetter(lowercase, uppercase);
        }
        
        // Display summary of collected links
        console.log('\n=== LINK COLLECTION SUMMARY ===');
        for (const [letter, links] of Object.entries(this.linksByLetter)) {
            console.log(`${letter}: ${links.length} links`);
        }
        
        return this.linksByLetter;
    }
    
    async scrapeAllRecipes(limitPerLetter = 5, testMode = false) {
        console.log('Starting HelloFresh recipe scraping...');
        
        // First collect all links
        await this.collectAllLinks(testMode);
        
        // Then process each letter's links
        for (const [letter, allLinks] of Object.entries(this.linksByLetter)) {
            if (allLinks.length === 0) {
                console.log(`No links found for letter "${letter}", skipping...`);
                continue;
            }
            
            const limitedLinks = allLinks.slice(0, limitPerLetter);
            this.recipesByLetter[letter] = [];
            
            console.log(`\nScraping ${limitedLinks.length} recipes for letter "${letter}"...`);
            
            for (let i = 0; i < limitedLinks.length; i++) {
                const link = limitedLinks[i];
                console.log(`Scraping recipe ${i + 1}/${limitedLinks.length} for "${letter}": ${link}`);
                
                const recipeData = await this.scrapeRecipeDetails(link);
                if (recipeData) {
                    this.recipesByLetter[letter].push(recipeData);
                }
                
                // Add delay to be respectful to the server
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        return this.recipesByLetter;
    }

    escapeCSVField(field) {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    formatRecipeForCSV(recipe) {
        return [
            this.escapeCSVField(recipe.title),
            this.escapeCSVField(recipe.totalTime),
            this.escapeCSVField(recipe.difficulty),
            this.escapeCSVField(recipe.allergens.join('; ')),
            this.escapeCSVField(recipe.nutrition.calories || ''),
            this.escapeCSVField(recipe.nutrition.fat || ''),
            this.escapeCSVField(recipe.nutrition.saturatedFat || ''),
            this.escapeCSVField(recipe.nutrition.carbohydrate || ''),
            this.escapeCSVField(recipe.nutrition.sugar || ''),
            this.escapeCSVField(recipe.nutrition.dietaryFiber || ''),
            this.escapeCSVField(recipe.nutrition.protein || ''),
            this.escapeCSVField(recipe.nutrition.cholesterol || ''),
            this.escapeCSVField(recipe.nutrition.sodium || ''),
            this.escapeCSVField(recipe.ingredients.items.join('; '))
        ].join(',');
    }

    async saveToCSVFiles() {
        // Create output directory if it doesn't exist
        const outputDir = 'hellofresh_recipes_csv';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        let totalRecipes = 0;
        
        for (const [letter, recipes] of Object.entries(this.recipesByLetter)) {
            if (recipes.length === 0) continue;
            
            const filename = path.join(outputDir, `recipes_${letter.toLowerCase()}.csv`);
            const csvContent = [
                this.csvHeaders.join(','),
                ...recipes.map(recipe => this.formatRecipeForCSV(recipe))
            ].join('\n');
            
            fs.writeFileSync(filename, csvContent, 'utf8');
            console.log(`Saved ${recipes.length} recipes to ${filename}`);
            totalRecipes += recipes.length;
        }
        
        console.log(`Total recipes saved: ${totalRecipes} across ${Object.keys(this.recipesByLetter).length} CSV files`);
        
        // Create a summary file
        const summaryData = Object.entries(this.recipesByLetter).map(([letter, recipes]) => ({
            letter,
            count: recipes.length
        }));
        
        const summaryCSV = [
            'Letter,Recipe Count',
            ...summaryData.map(item => `${item.letter},${item.count}`)
        ].join('\n');
        
        fs.writeFileSync(path.join(outputDir, 'summary.csv'), summaryCSV, 'utf8');
        console.log('Created summary.csv file');
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Main execution
async function main() {
    const scraper = new HelloFreshScraper();
    
    try {
        await scraper.initialize();
        await scraper.scrapeAllRecipes(1000, false); // Get up to 1000 recipes per letter, all letters A-Z
        await scraper.saveToCSVFiles();
        
    } catch (error) {
        console.error('Scraping failed:', error);
    } finally {
        await scraper.close();
    }
}

// Run the scraper
main().catch(console.error);