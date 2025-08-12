/// <reference types="node" />
import OpenAI from 'openai'
import AdminSettings from './admin-settings'

// Function to get OpenAI API key from database
async function getOpenAIKey(): Promise<string | null> {
  try {
  const cfg = await AdminSettings.getOpenAIConfig()
  return cfg.apiKey || process.env.OPENAI_API_KEY || null
  } catch (error) {
    console.error('Error fetching OpenAI API key:', error)
    return process.env.OPENAI_API_KEY || null
  }
}

// Function to create OpenAI instance dynamically
async function createOpenAIInstance(): Promise<OpenAI | null> {
  const apiKey = await getOpenAIKey()
  if (!apiKey) {
    console.warn('OpenAI API key not found in database or environment variables')
    return null
  }
  return new OpenAI({ apiKey })
}

export interface ImageGenerationOptions {
  prompt: string
  size?: '256x256' | '512x512' | '1024x1024'
  quality?: 'standard' | 'hd'
  n?: number
}

export async function generateProductImage(options: ImageGenerationOptions) {
  try {
    const openai = await createOpenAIInstance()
    if (!openai) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY in Admin API Settings.',
        images: [],
      }
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: options.prompt,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      n: options.n || 1,
    })

    return {
      success: true,
      images: response.data?.map((img: { url?: string }) => img.url).filter(Boolean) || [],
    }
  } catch (error) {
    console.error('Error generating image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function generateProductDescription(productName: string, features: string[]) {
  try {
    const openai = await createOpenAIInstance()
    if (!openai) {
      return {
        success: false,
        description: '',
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY in Admin API Settings.',
      }
    }

    const prompt = `Write a compelling product description in Albanian language for "${productName}". 
    Features: ${features.join(', ')}. 
    Make it engaging, professional, and include benefits. 
    Keep it around 150-200 words.`

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional e-commerce copywriter specializing in Albanian product descriptions. Write engaging, persuasive product descriptions that highlight benefits and create desire."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    return {
      success: true,
      description: response.choices[0]?.message?.content || '',
    }
  } catch (error) {
    console.error('Error generating description:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function generateMarketingContent(productName: string, targetAudience: string, campaign: string) {
  try {
    const openai = await createOpenAIInstance()
    if (!openai) {
      return {
        success: false,
        content: '',
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY in Admin API Settings.',
      }
    }

    const prompt = `Create a marketing campaign content in Albanian for "${productName}".
    Target audience: ${targetAudience}
    Campaign type: ${campaign}
    Include: catchy headline, compelling copy, and call-to-action.
    Make it persuasive and culturally relevant for Albanian/Kosovo market.`

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a marketing expert creating campaigns for Albanian/Kosovo market. Create compelling, culturally relevant content that drives sales."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.8,
    })

    return {
      success: true,
      content: response.choices[0]?.message?.content || '',
    }
  } catch (error) {
    console.error('Error generating marketing content:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

interface SalesDataItem {
  productId: string
  productName: string
  quantity: number
  revenue: number
  date: string
  category?: string
}

export async function analyzeSalesData(salesData: SalesDataItem[]) {
  try {
    const openai = await createOpenAIInstance()
    if (!openai) {
      return {
        success: false,
        insights: '',
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY in Admin API Settings.',
      }
    }

    const prompt = `Analyze this e-commerce sales data and provide insights:
    ${JSON.stringify(salesData)}
    
    Provide:
    1. Top performing products
    2. Sales trends
    3. Customer behavior insights
    4. Recommendations for improvement
    
    Respond in Albanian language.`

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a business intelligence analyst providing insights for an Albanian e-commerce platform. Provide clear, actionable insights in Albanian."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    })

    return {
      success: true,
      insights: response.choices[0]?.message?.content || '',
    }
  } catch (error) {
    console.error('Error analyzing sales data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
