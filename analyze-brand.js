// /api/analyze-brand.js (Express route)
import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/analyze-brand', async (req, res) => {
  const { description } = req.body;

  const prompt = `
You are a professional brand strategist at Digiworq. Based on the following business description, analyze and return the brand voice in this EXACT format, making it sound like Digiworq is recommending or suggesting these insights:

**Brand Archetype:**
[Archetype name with brief explanation - start with "We at Digiworq recommend..." or "Digiworq suggests..."]

**Voice Tone:**
- [First voice tone tip - start with "We recommend..." or "Digiworq suggests..."]
- [Second voice tone tip - start with "We recommend..." or "Digiworq suggests..."]
- [Third voice tone tip - start with "We recommend..." or "Digiworq suggests..."]

**Content Guidelines:**
- [First content guideline - start with "We recommend..." or "Digiworq suggests..."]
- [Second content guideline - start with "We recommend..." or "Digiworq suggests..."]
- [Third content guideline - start with "We recommend..." or "Digiworq suggests..."]

**Sample Headlines:**
- [First sample headline - start with "We suggest..." or "Digiworq recommends..."]
- [Second sample headline - start with "We suggest..." or "Digiworq recommends..."]
- [Third sample headline - start with "We suggest..." or "Digiworq recommends..."]

**Visual Style:**
Colors: [Color recommendations - start with "We recommend..." or "Digiworq suggests..."]
Fonts: [Font recommendations - start with "We recommend..." or "Digiworq suggests..."]
Imagery: [Imagery recommendations - start with "We recommend..." or "Digiworq suggests..."]

Business Description:
"""${description}"""
`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
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
        .filter(line => line.length > 0);
    };

    const parseVisualStyle = (text) => {
      const visualSection = text.match(/\*\*Visual Style:\*\*([\s\S]*?)(?=\*\*|$)/i);
             if (!visualSection) {
         return {
           colors: 'We recommend a professional and modern color palette that reflects your brand values',
           fonts: 'Digiworq suggests clean, readable typography that enhances user experience',
           imagery: 'We recommend high-quality, relevant visuals that tell your brand story'
         };
       }

       const content = visualSection[1];
       const colors = content.match(/Colors:\s*(.*?)(?=\n|$)/i)?.[1]?.trim() || 'We recommend a professional and modern color palette that reflects your brand values';
       const fonts = content.match(/Fonts:\s*(.*?)(?=\n|$)/i)?.[1]?.trim() || 'Digiworq suggests clean, readable typography that enhances user experience';
       const imagery = content.match(/Imagery:\s*(.*?)(?=\n|$)/i)?.[1]?.trim() || 'We recommend high-quality, relevant visuals that tell your brand story';

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

    const archetypeData = parseArchetype(text);
    const voiceTone = parseSection(text, 'Voice Tone');
    const contentGuide = parseSection(text, 'Content Guidelines');
    const sampleHeadlines = parseSection(text, 'Sample Headlines');
    const visualStyle = parseVisualStyle(text);

    const data = {
      archetype: archetypeData.archetype,
      explanation: archetypeData.explanation,
      voice_tone: voiceTone.length > 0 ? voiceTone : [
        'We recommend using clear, professional language that builds trust with your audience',
        'Digiworq suggests maintaining a confident and trustworthy tone throughout all communications',
        'We recommend focusing on benefits and solutions that directly address customer needs'
      ],
      content_guide: contentGuide.length > 0 ? contentGuide : [
        'We recommend keeping content concise and actionable for better engagement',
        'Digiworq suggests using storytelling to create emotional connections with your audience',
        'We recommend including clear calls-to-action to guide user behavior effectively'
      ],
      sample_headlines: sampleHeadlines.length > 0 ? sampleHeadlines : [
        'We suggest: "Transform Your Business with Our Innovative Solutions"',
        'Digiworq recommends: "Expert Guidance for Your Success Journey"',
        'We suggest: "Innovative Solutions for Modern Business Challenges"'
      ],
      visual_style: visualStyle,
    };

    res.json(data);
  } catch (error) {
    console.error('AI error:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

export default router;
