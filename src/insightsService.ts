// src/insightsService.ts
import { FinancialData, InsightData } from './types';

export const insightsService = {
  async generateInsights(financialData: FinancialData): Promise<InsightData[]> {
    try {
      // Prepare the data for the LLM prompt
      const prompt = this.preparePrompt(financialData);
      
      // Log the prompt for testing and debugging
      console.log("=== FINANCIAL INSIGHTS PROMPT ===");
      console.log(prompt);
      console.log("=== END PROMPT ===");
      
      // Call OpenAI API
      const response = await this.callOpenAI(prompt);
      
      // Log the response for testing and debugging
      console.log("=== FINANCIAL INSIGHTS RESPONSE ===");
      console.log(response);
      console.log("=== END RESPONSE ===");
      
      // Parse the response
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error generating insights:', error);
      return [
        {
          type: "spending",
          title: "Spending Pattern",
          message: "Unable to analyze spending patterns at this time."
        },
        {
          type: "saving",
          title: "Saving Opportunity",
          message: "Unable to identify saving opportunities at this time."
        },
        {
          type: "upcoming",
          title: "Financial Tip",
          message: "Unable to provide financial tips at this time."
        }
      ];
    }
  },

  preparePrompt(financialData: FinancialData): string {
    // Extract relevant data for the prompt
    const { profile, transactions, budgets, goals } = financialData;
    
    // Format transactions for the prompt
    const recentTransactions = transactions
      .slice(0, 10) // Get the most recent 10 transactions (your array is already sorted)
      .map(t => `${t.date}: ${t.payee} - ${t.category} - $${t.amount.toFixed(2)}`)
      .join('\n');
    
    // Format budgets for the prompt
    const budgetInfo = budgets
      .map(b => `${b.category}: $${b.spent.toFixed(2)}/$${b.budget.toFixed(2)} (${b.percent.toFixed(0)}%)`)
      .join('\n');
    
    // Format goals for the prompt
    const goalsInfo = goals
      .map(g => `${g.name}: $${g.saved.toFixed(2)}/$${g.target.toFixed(2)} (${g.percent.toFixed(0)}%)`)
      .join('\n');
    
    // Add a random seed for diversity in responses
    const randomSeed = Math.floor(Math.random() * 1000);
    
    // Create the prompt
    return `
As a financial advisor, analyze the following financial data and provide three specific, personalized insights. Each time you're asked, provide different perspectives and advice.

Financial Overview:
- Current Balance: $${profile.balance.toFixed(2)}
- Monthly Income: $${profile.monthlyIncome.toFixed(2)}
- Monthly Expenses: $${profile.monthlyExpenses.toFixed(2)}
- Monthly Savings: $${profile.monthlySavings.toFixed(2)}

Recent Transactions:
${recentTransactions}

Budget Information:
${budgetInfo}

Savings Goals:
${goalsInfo}

For each insight category below:
- Make it specific to this person's actual spending patterns
- Focus on actionable advice that matches their financial reality
- Be creative and varied in your suggestions (don't repeat common financial advice)
- Provide a fresh perspective each time this prompt is run (randomSeed: ${randomSeed})

Provide these three insights:
1. Spending Pattern: Identify a specific pattern, trend, or anomaly in recent spending. Look for unusual transactions, categories with increased activity, or potential areas of concern.

2. Saving Opportunity: Suggest one specific saving opportunity based on spending habits. Be creative and look for a non-obvious way this person could save money based on their unique transaction history or budget categories.

3. Financial Tip: Provide a useful financial tip relevant to the current financial situation. This could relate to their goals, budget allocations, or general financial health. Choose advice that would be most impactful for their specific situation.

Format your response as valid JSON with the following structure:
[
  {
    "type": "spending",
    "title": "Spending Insight",
    "message": "Your analysis of spending patterns here"
  },
  {
    "type": "saving",
    "title": "Saving Strategy",
    "message": "Your specific saving opportunity here"
  },
  {
    "type": "upcoming",
    "title": "Financial Tip",
    "message": "Your personalized financial tip here"
  }
]

Keep each message concise (max 150 characters) and actionable. Make sure your insights feel fresh and relevant each time.
`;
  },

  async callOpenAI(prompt: string): Promise<string> {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    try {
      // Log API call attempt
      console.log("Calling OpenAI API...");
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            {
              role: 'system',
              content: 'You are a creative financial advisor with expertise in personal finance. Provide varied, insightful, and personalized financial advice based on the data provided. Always give different perspectives when asked repeatedly. Your goal is to help users discover new ways to improve their financial health.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7 // Increased for more variety
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error response:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API response received successfully");
      
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  },

  parseResponse(response: string): InsightData[] {
    try {
      // Log parsing attempt
      console.log("Parsing OpenAI response...");
      
      // Attempt to parse the response as JSON
      const parsed = JSON.parse(response);
      
      // Ensure the response is an array
      if (!Array.isArray(parsed)) {
        console.error("Response is not an array:", parsed);
        throw new Error('Response is not an array');
      }
      
      // Validate and return the insights
      const validatedInsights = parsed.map(insight => ({
        type: insight.type || 'unknown',
        title: insight.title || 'Insight',
        message: insight.message || 'No insight available'
      }));
      
      // Log successful parsing
      console.log("Successfully parsed insights:", validatedInsights);
      
      // Ensure we have exactly three insights (spending, saving, upcoming)
      const result = [
        validatedInsights.find(i => i.type === 'spending') || {
          type: 'spending',
          title: 'Spending Pattern',
          message: 'Unable to analyze spending patterns at this time.'
        },
        validatedInsights.find(i => i.type === 'saving') || {
          type: 'saving',
          title: 'Saving Opportunity',
          message: 'Unable to identify saving opportunities at this time.'
        },
        validatedInsights.find(i => i.type === 'upcoming') || {
          type: 'upcoming',
          title: 'Financial Tip',
          message: 'Unable to provide financial tips at this time.'
        }
      ];
      
      return result;
    } catch (error) {
      console.error('Error parsing insights response:', error);
      return [
        {
          type: "spending",
          title: "Spending Pattern",
          message: "Unable to analyze spending patterns at this time."
        },
        {
          type: "saving",
          title: "Saving Opportunity",
          message: "Unable to identify saving opportunities at this time."
        },
        {
          type: "upcoming",
          title: "Financial Tip",
          message: "Unable to provide financial tips at this time."
        }
      ];
    }
  }
};