// /api/analyze-brand.js (Express route)
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/analyze-brand', async (req, res) => {
  const { description } = req.body;

  const prompt = `
You are a professional brand strategist at Digiworq. Analyze the following business description and provide SPECIFIC, TAILORED brand recommendations. Make your response highly relevant to the business type and industry.

Business Description: "${description}"

Based on this business, provide recommendations in this EXACT format:

**Brand Archetype:**
[Choose the most appropriate archetype: The Creator, The Sage, The Innocent, The Explorer, The Hero, The Outlaw, The Magician, The Regular Guy/Gal, The Lover, The Jester, The Caregiver, or The Ruler. Then explain why this archetype fits this specific business - start with "We at Digiworq recommend..." or "Digiworq suggests..."]

**Voice Tone:**
- [First voice tone tip SPECIFIC to this business type - start with "We recommend..." or "Digiworq suggests..."]
- [Second voice tone tip SPECIFIC to this business type - start with "We recommend..." or "Digiworq suggests..."]
- [Third voice tone tip SPECIFIC to this business type - start with "We recommend..." or "Digiworq suggests..."]

**Content Guidelines:**
- [First content guideline SPECIFIC to this business type - start with "We recommend..." or "Digiworq suggests..."]
- [Second content guideline SPECIFIC to this business type - start with "We recommend..." or "Digiworq suggests..."]
- [Third content guideline SPECIFIC to this business type - start with "We recommend..." or "Digiworq suggests..."]

**Sample Headlines:**
- [First sample headline SPECIFIC to this business - start with "We suggest..." or "Digiworq recommends..."]
- [Second sample headline SPECIFIC to this business - start with "We suggest..." or "Digiworq recommends..."]
- [Third sample headline SPECIFIC to this business - start with "We suggest..." or "Digiworq recommends..."]

**Visual Style:**
Colors: [Color recommendations SPECIFIC to this business type - start with "We recommend..." or "Digiworq suggests..."]
Fonts: [Font recommendations SPECIFIC to this business type - start with "We recommend..." or "Digiworq suggests..."]
Imagery: [Imagery recommendations SPECIFIC to this business type - start with "We recommend..." or "Digiworq suggests..."]

IMPORTANT: Make ALL recommendations highly specific to the business type, industry, and target audience. Avoid generic advice.
`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      },
      {
       headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
},
      }
    );

    const text = response.data.choices[0].message.content;

    // Improved parsing with better error handling
    const parseSection = (text, sectionName) => {
      const regex = new RegExp(`${sectionName}:\\s*([\\s\\S]*?)(?=\\*\\*|$)`, 'i');
      const match = text.match(regex);
      if (!match) return [];
      
      const content = match[1].trim();
      return content
        .split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0 && !line.startsWith('**'));
    };

    const parseVisualStyle = (text) => {
      const visualSection = text.match(/\*\*Visual Style:\*\*([\s\S]*?)(?=\*\*|$)/i);
             if (!visualSection) {
         return {
           colors: 'We recommend analyzing your industry standards and target audience preferences for optimal color selection',
           fonts: 'Digiworq suggests choosing fonts that align with your brand personality and industry expectations',
           imagery: 'We recommend selecting imagery that resonates with your specific audience and business goals'
         };
       }

       const content = visualSection[1];
       const colors = content.match(/Colors:\s*(.*?)(?=\n|$)/i)?.[1]?.trim() || 'We recommend analyzing your industry standards and target audience preferences for optimal color selection';
       const fonts = content.match(/Fonts:\s*(.*?)(?=\n|$)/i)?.[1]?.trim() || 'Digiworq suggests choosing fonts that align with your brand personality and industry expectations';
       const imagery = content.match(/Imagery:\s*(.*?)(?=\n|$)/i)?.[1]?.trim() || 'We recommend selecting imagery that resonates with your specific audience and business goals';

      return { colors, fonts, imagery };
    };

         const parseArchetype = (text) => {
       const archetypeMatch = text.match(/\*\*Brand Archetype:\*\*\s*(.*?)(?=\n|$)/i);
       if (!archetypeMatch) return { archetype: 'The Professional', explanation: 'We at Digiworq recommend The Professional archetype as a trustworthy and reliable brand personality that builds confidence with your audience.' };
      
      const fullText = archetypeMatch[1].trim();
      const parts = fullText.split(':');
      
      if (parts.length >= 2) {
        return {
          archetype: parts[0].trim(),
          explanation: parts.slice(1).join(':').trim()
        };
      } else {
        return {
          archetype: fullText,
          explanation: 'A distinctive brand personality that resonates with your target audience.'
        };
      }
    };

    // Generate business-specific fallbacks based on the description
    const generateBusinessSpecificFallbacks = (description) => {
      const lowerDesc = description.toLowerCase();
      
      // Detect business type for more relevant fallbacks
      let businessType = 'general';
      if (lowerDesc.includes('restaurant') || lowerDesc.includes('food') || lowerDesc.includes('cafe')) {
        businessType = 'food';
      } else if (lowerDesc.includes('tech') || lowerDesc.includes('software') || lowerDesc.includes('app')) {
        businessType = 'technology';
      } else if (lowerDesc.includes('health') || lowerDesc.includes('medical') || lowerDesc.includes('fitness')) {
        businessType = 'health';
      } else if (lowerDesc.includes('fashion') || lowerDesc.includes('clothing') || lowerDesc.includes('style')) {
        businessType = 'fashion';
      } else if (lowerDesc.includes('education') || lowerDesc.includes('school') || lowerDesc.includes('training')) {
        businessType = 'education';
      } else if (lowerDesc.includes('real estate') || lowerDesc.includes('property') || lowerDesc.includes('housing')) {
        businessType = 'real_estate';
      }

      const fallbacks = {
        food: {
          voice_tone: [
            'We recommend using warm, inviting language that makes customers feel welcome and excited about your food',
            'Digiworq suggests incorporating sensory words that describe taste, aroma, and dining experience',
            'We recommend maintaining a friendly, approachable tone that reflects your hospitality values'
          ],
          content_guide: [
            'We recommend showcasing your unique recipes and culinary expertise through engaging storytelling',
            'Digiworq suggests highlighting fresh ingredients, local sourcing, and your chef\'s passion',
            'We recommend including mouth-watering descriptions and behind-the-scenes content'
          ],
          sample_headlines: [
            'We suggest: "Experience Culinary Excellence at [Your Restaurant Name]"',
            'Digiworq recommends: "Fresh Ingredients, Unforgettable Flavors - Your Perfect Dining Destination"',
            'We suggest: "From Farm to Table: Discover Our Chef\'s Signature Creations"'
          ]
        },
        technology: {
          voice_tone: [
            'We recommend using innovative, forward-thinking language that positions you as a tech leader',
            'Digiworq suggests maintaining a confident, solution-focused tone that addresses user pain points',
            'We recommend incorporating technical expertise while remaining accessible to non-technical audiences'
          ],
          content_guide: [
            'We recommend showcasing your technical capabilities through case studies and demos',
            'Digiworq suggests highlighting efficiency, innovation, and problem-solving benefits',
            'We recommend including clear explanations of complex solutions in simple terms'
          ],
          sample_headlines: [
            'We suggest: "Revolutionize Your Business with Our Cutting-Edge Technology"',
            'Digiworq recommends: "Innovative Solutions That Drive Real Results"',
            'We suggest: "Transform Your Workflow with Our Advanced Platform"'
          ]
        },
        health: {
          voice_tone: [
            'We recommend using caring, trustworthy language that builds confidence in your expertise',
            'Digiworq suggests maintaining a professional yet compassionate tone that shows genuine concern',
            'We recommend focusing on wellness, prevention, and positive health outcomes'
          ],
          content_guide: [
            'We recommend sharing expert health tips and wellness advice that educates your audience',
            'Digiworq suggests highlighting your qualifications, experience, and patient success stories',
            'We recommend including evidence-based information and practical health guidance'
          ],
          sample_headlines: [
            'We suggest: "Your Health, Our Priority - Expert Care You Can Trust"',
            'Digiworq recommends: "Transform Your Wellness Journey with Professional Guidance"',
            'We suggest: "Evidence-Based Solutions for Your Optimal Health"'
          ]
        },
        fashion: {
          voice_tone: [
            'We recommend using stylish, trend-forward language that reflects current fashion sensibilities',
            'Digiworq suggests maintaining an aspirational yet accessible tone that inspires confidence',
            'We recommend incorporating lifestyle elements that connect fashion to personal expression'
          ],
          content_guide: [
            'We recommend showcasing your latest collections with high-quality visuals and styling tips',
            'Digiworq suggests highlighting quality, craftsmanship, and unique design elements',
            'We recommend including fashion advice, trend insights, and personal styling guidance'
          ],
          sample_headlines: [
            'We suggest: "Express Your Unique Style with Our Exclusive Collection"',
            'Digiworq recommends: "Trendsetting Fashion That Defines Your Individuality"',
            'We suggest: "Discover Your Signature Look with Our Curated Selection"'
          ]
        },
        education: {
          voice_tone: [
            'We recommend using encouraging, motivational language that inspires learning and growth',
            'Digiworq suggests maintaining an authoritative yet supportive tone that builds confidence',
            'We recommend focusing on empowerment, knowledge, and personal development'
          ],
          content_guide: [
            'We recommend sharing educational insights, learning tips, and success stories from students',
            'Digiworq suggests highlighting your teaching methods, qualifications, and learning outcomes',
            'We recommend including practical learning resources and educational content'
          ],
          sample_headlines: [
            'We suggest: "Unlock Your Potential with Expert-Led Learning Experiences"',
            'Digiworq recommends: "Transform Your Skills with Our Comprehensive Education Programs"',
            'We suggest: "Empower Your Future with Knowledge That Makes a Difference"'
          ]
        },
        real_estate: {
          voice_tone: [
            'We recommend using trustworthy, professional language that builds confidence in your expertise',
            'Digiworq suggests maintaining a knowledgeable, helpful tone that guides clients through decisions',
            'We recommend focusing on value, investment potential, and lifestyle benefits'
          ],
          content_guide: [
            'We recommend showcasing properties with detailed descriptions and high-quality visuals',
            'Digiworq suggests highlighting market insights, investment opportunities, and neighborhood benefits',
            'We recommend including client testimonials and successful transaction stories'
          ],
          sample_headlines: [
            'We suggest: "Find Your Dream Home with Expert Real Estate Guidance"',
            'Digiworq recommends: "Premium Properties in Prime Locations - Your Investment Partner"',
            'We suggest: "Navigate the Market with Confidence - Professional Real Estate Solutions"'
          ]
        },
        general: {
          voice_tone: [
            'We recommend using clear, professional language that builds trust with your audience',
            'Digiworq suggests maintaining a confident and trustworthy tone throughout all communications',
            'We recommend focusing on benefits and solutions that directly address customer needs'
          ],
          content_guide: [
            'We recommend keeping content concise and actionable for better engagement',
            'Digiworq suggests using storytelling to create emotional connections with your audience',
            'We recommend including clear calls-to-action to guide user behavior effectively'
          ],
          sample_headlines: [
            'We suggest: "Transform Your Business with Our Innovative Solutions"',
            'Digiworq recommends: "Expert Guidance for Your Success Journey"',
            'We suggest: "Innovative Solutions for Modern Business Challenges"'
          ]
        }
      };

      return fallbacks[businessType] || fallbacks.general;
    };

    const archetypeData = parseArchetype(text);
    const voiceTone = parseSection(text, 'Voice Tone');
    const contentGuide = parseSection(text, 'Content Guidelines');
    const sampleHeadlines = parseSection(text, 'Sample Headlines');
    const visualStyle = parseVisualStyle(text);

    // Get business-specific fallbacks
    const businessFallbacks = generateBusinessSpecificFallbacks(description);

    const data = {
      archetype: archetypeData.archetype,
      explanation: archetypeData.explanation,
      voice_tone: voiceTone.length > 0 ? voiceTone : businessFallbacks.voice_tone,
      content_guide: contentGuide.length > 0 ? contentGuide : businessFallbacks.content_guide,
      sample_headlines: sampleHeadlines.length > 0 ? sampleHeadlines : businessFallbacks.sample_headlines,
      visual_style: visualStyle,
    };

    res.json(data);
  } catch (error) {
    console.error('AI error:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

export default router;
