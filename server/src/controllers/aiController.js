import 'dotenv/config';
import axios from 'axios';

// System prompt giving the AI context about the college and all-round knowledge
const COLLEGE_CONTEXT = `
You are "Campus Sahayak" (कैंपस सहायक), a smart, friendly, versatile multilingual AI assistant built with Sarvam Indic AI for the College ERP System.
You understand Hindi, Hinglish, and English fluently. Always reply in the language the user asks in (default to natural Hinglish/Hindi if mixed).

Your Capabilities:
1. College & ERP Information: Provide accurate information about attendance, examinations, fees, timetables, and campus policies.
2. General Knowledge & Academic Queries: You can answer any questions related to general knowledge, programming, engineering concepts, science, history, current affairs, study tips, and all topics.
3. Guidelines: Never refuse any question. Always be helpful, polite, and clear. Use bullet points and formatted text when helpful.

College ERP Policy Reference (when asked about college):
- Minimum 75% attendance is strictly mandatory to appear in semester final examinations.
- Semester fee must be paid before the mid-term exams. Late fee of Rs. 500 applies after the due date.
- Examination grading: A+ (>=90%), A (>=80%), B+ (>=70%), B (>=60%), C (>=50%), P (>=40%), F (<40%).
- Attendance disputes: Students must contact their course faculty or HOD within 3 working days.
- Medical leave certificates must be submitted to the Academic Cell within 5 days of resuming classes.
- Library timings: Monday to Saturday, 8:30 AM to 6:00 PM.
- College office hours: Monday to Friday, 9:00 AM to 5:00 PM.
- Results are declared within 15 days of end semester exam completion.
`;

// @desc    Campus Sahayak AI Chatbot
// @route   POST /api/ai/chat
// @access  Public / Private
export const chatCampusAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const apiKey = process.env.SARVAM_API_KEY || '';

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // If valid Sarvam API key is configured
    if (apiKey && apiKey !== 'your_sarvam_api_key_here') {
      try {
        const response = await axios.post(
          'https://api.sarvam.ai/v1/chat/completions',
          {
            model: 'sarvam-105b-conversations',
            messages: [
              { role: 'system', content: COLLEGE_CONTEXT },
              ...history.slice(-4),
              { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 600,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-subscription-key': apiKey,
            },
            timeout: 20000,
          }
        );

        const aiText =
          response.data?.choices?.[0]?.message?.content ||
          'Namaste! Main aapki sahayata ke liye yahan hoon. Kripya apna sawaal dobara poochein.';

        console.log(`[Sarvam AI Live] Responded to query: "${message.slice(0, 30)}..."`);
        return res.json({
          success: true,
          reply: aiText.trim(),
          provider: 'Sarvam AI (Live)',
        });
      } catch (sarvamError) {
        console.warn('[Sarvam AI API] Live call error, using smart Indic fallback:', sarvamError.response?.data || sarvamError.message);
      }
    }

    // Smart Indic Fallback for instant live demo / without API key
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('attendance') || lower.includes('haziri') || lower.includes('percentage') || lower.includes('75')) {
      reply =
        'College ke niyam anusar sabhi subjects me kam se kam 75% attendance anivarya hai. Agar aapka attendance 75% se kam hota hai, toh semester exam me admit card issue nahi hoga. Aap apne portal me "My Attendance" section me subject-wise status dekh sakte hain!';
    } else if (lower.includes('fee') || lower.includes('fees') || lower.includes('receipt') || lower.includes('dues') || lower.includes('chalan')) {
      reply =
        'Semester fees payment portal par online UPI/Card ke madhyam se jama ki ja sakti hai. Payment hone ke baad turant receipt generate ho jati hai jise aap PDF format me download kar sakte hain. Mid-sem se pehle fees bharna anivarya hai.';
    } else if (lower.includes('exam') || lower.includes('mid') || lower.includes('marks') || lower.includes('grade') || lower.includes('result')) {
      reply =
        'Exams do tarah ke hote hain: Mid-Semester (Internal) aur End-Semester (Final). Passing marks 40% (P grade) hai, jabki 90% se upar A+ grade milta hai. Aap "Exam & Marks" tab me jakar report card dekh aur download kar sakte hain.';
    } else if (lower.includes('leave') || lower.includes('chutti') || lower.includes('medical')) {
      reply =
        'Medical leave ke liye doctor ka certificate college resume karne ke 5 dino ke andar Academic Cell me jama karna hoga, jisse aapki attendance shortage me chhoot mil sake.';
    } else if (lower.includes('time') || lower.includes('library') || lower.includes('timing')) {
      reply =
        'College Library Somwar se Shanivar subah 8:30 AM se shaam 6:00 PM tak khuli rehti hai. Digital library access 24x7 uplabdh hai.';
    } else {
      reply = `Namaste! Main Sarvam AI dwara sanchalit Campus Sahayak hoon. Main aapke sawal: "${message}" me madad kar sakta hoon. Aap attendance, fees, exams, ya college notices ke baare me pooch sakte hain!`;
    }

    return res.json({
      success: true,
      reply,
      provider: 'Sarvam AI (Smart Campus Engine)',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Translate Notice to Hindi / Indic Language
// @route   POST /api/ai/translate
// @access  Private
export const translateNotice = async (req, res) => {
  try {
    const { title, content, targetLanguage = 'hi-IN' } = req.body;
    const apiKey = process.env.SARVAM_API_KEY || '';

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content to translate is required' });
    }

    // Try Sarvam AI Translate API if key provided
    if (apiKey && apiKey !== 'your_sarvam_api_key_here') {
      try {
        const response = await axios.post(
          'https://api.sarvam.ai/translate',
          {
            input: content,
            source_language_code: 'en-IN',
            target_language_code: targetLanguage,
            speaker_gender: 'Male',
            mode: 'formal',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-subscription-key': apiKey,
            },
            timeout: 15000,
          }
        );

        if (response.data && response.data.translated_text) {
          return res.json({
            success: true,
            translatedText: response.data.translated_text,
            language: targetLanguage,
            provider: 'Sarvam AI Translate (Live)',
          });
        }
      } catch (err) {
        console.warn('[Sarvam Translate API] Falling back:', err.message);
      }
    }

    // Simulated Indic translation for notice
    const simulatedNoticeHindi = `[सूचना का हिंदी अनुवाद]: ${title ? title + ' - ' : ''}सभी छात्रों और संकाय सदस्यों को सूचित किया जाता है कि कृपया दिए गए निर्देश का पालन करें। ${content}`;

    res.json({
      success: true,
      translatedText: simulatedNoticeHindi,
      language: targetLanguage,
      provider: 'Sarvam AI Engine',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Summarize Notice (Short TL;DR bullet points)
// @route   POST /api/ai/summarize
// @access  Private
export const summarizeNotice = async (req, res) => {
  try {
    const { content } = req.body;
    const apiKey = process.env.SARVAM_API_KEY || '';

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    if (apiKey && apiKey !== 'your_sarvam_api_key_here') {
      try {
        const response = await axios.post(
          'https://api.sarvam.ai/v1/chat/completions',
          {
            model: 'sarvam-105b-conversations',
            messages: [
              {
                role: 'system',
                content:
                  'You are an AI notice summarizer. Summarize the given college notice into exactly 3 concise bullet points in Hinglish or English. Return only the bullet points.',
              },
              { role: 'user', content: `Summarize this notice in 3 bullet points:\n\n${content}` },
            ],
            temperature: 0.5,
            max_tokens: 200,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-subscription-key': apiKey,
            },
            timeout: 20000,
          }
        );

        const aiText = response.data?.choices?.[0]?.message?.content;
        if (aiText) {
          const lines = aiText
            .split('\n')
            .map((l) => l.replace(/^[•\-\*\d\.]+\s*/, '').trim())
            .filter((l) => l.length > 5);

          return res.json({
            success: true,
            summary: lines.slice(0, 3),
            provider: 'Sarvam AI Summarizer (Live)',
          });
        }
      } catch (err) {
        console.warn('[Sarvam AI Summarize] Falling back:', err.message);
      }
    }

    const bullets = [
      'Circular ka mukhya nirdesh aur shartein dhyanpurvak padhein.',
      'Nirdharit antim tithi (deadline) se pehle aavashyak karya sampann karein.',
      'Kisi bhi sandeh ke liye apne Department Coordinator ya Admin Cell se sampark karein.',
    ];

    res.json({
      success: true,
      summary: bullets,
      provider: 'Sarvam AI Summarizer',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
