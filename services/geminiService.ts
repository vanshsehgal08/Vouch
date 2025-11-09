import { GoogleGenAI } from "@google/genai";
import type { FormData } from '../App';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateReferralEmail = async (formData: FormData): Promise<string> => {
  const { 
    companyName, 
    role, 
    jobId, 
    jobDescription, 
    resumeLink, 
    jobLink,
    emailId,
    contact,
    additionalInstructions,
    includeResumeLink,
    includeJobId,
    includeJobLink,
    includeEmailId,
    includeContact,
    includeProjects,
    includeExperience
  } = formData;

  // Validate that required fields are provided
  if (!companyName || !role || !jobId) {
    throw new Error("Please provide Company Name, Role, and Job ID before generating the email.");
  }

  // Resume context for Gemini - Only skills
  const skillsContext = `
**Candidate's Skills (Available for Reference):**
- Languages: Java, Python, C/C++, JavaScript, TypeScript
- Frontend: React.js, Next.js, Tailwind CSS, Bootstrap, shadcn/ui, Zod, Chart.js
- Backend: Node.js, Express.js, RESTful APIs, JWT/OAuth, WebSockets, Socket.io
- Databases: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB
- CS Core: DSA, OOP, Operating Systems, DBMS, Software Architecture
- Tools: Git, GitHub, Postman, Figma, GitHub Actions (basic), Firebase Console
- Cloud/DevOps: AWS (EC2, S3), GCP, Docker, Vercel (CI/CD), Linux (basic)
- Methodologies: Agile (Scrum, Kanban), Waterfall, Spiral, Git Flow
`;

  // Conditionally include projects
  const projectsContext = includeProjects ? `
**Projects (Only mention if relevant to the job description):**
- CogniVue – AI-powered Interview Preparation Platform: Next.js, React, TypeScript, Google Gemini, GPT-4, Vapi AI, ElevenLabs, Firebase, Stripe, Tailwind CSS
- LT-Companion – Chrome Extension for LeetCode: Chrome Extension, Google Gemini, JavaScript, AI Integration
- Smart Rental Tracker – Equipment Rental Management System: Python, Machine Learning, AI Analytics, Web Dashboard, Data Visualization
` : '';

  // Conditionally include experience
  const experienceContext = includeExperience ? `
**Experience (Only mention if relevant to the job description):**
- Bharat Electronics Ltd, Ministry of Defence (May 2024 - Internship): Engineered algorithms to decode complex ASTERIX data sequences, developed Python-based system for decoding radar data packets, implemented linear regression model. Tools: Python, Pandas, NumPy, Scikit-learn, Jupyter, Wireshark, Git, Agile methodology
` : '';

  const resumeContext = `${skillsContext}${projectsContext}${experienceContext}`;


  // Build the prompt - let Gemini analyze the JD and generate relevant content
  const prompt = `You are an expert career assistant. Your task is to craft a concise, professional, and personalized referral request email.

**Output Format Rules:**
1. The entire output MUST be plain text. Do not use Markdown, bold, or italics.
2. The output MUST start with a "Subject:" line.
3. After the subject line, there MUST be exactly one blank line.
4. The rest of the output is the email body.

**Candidate Information:**
- Name: Vansh Sehgal
- Education: B.Tech CSE (2026), VIT Vellore (CGPA: 9.06)

${resumeContext}

**Job Details:**
- Company: ${companyName}
- Role: ${role}
- Job ID: ${jobId}
- Full Job Description:
${jobDescription || 'No job description provided.'}

**Additional Instructions:**
${additionalInstructions || "No additional instructions provided."}

**Email Structure (FOLLOW THIS EXACTLY):**

**Subject Line:**
Create a clear and professional subject line using the exact role and job ID. Format: "Referral Request for ${role} (Job ID: ${jobId})"

**Email Body:**

**Paragraph 1 (Introduction - FIXED FORMAT):**
Start with "Hi Sir," followed by a new line, then a blank line. DONT MISS IT
Then write: "I'm Vansh Sehgal, a B.Tech CSE student (2026) from VIT Vellore (CGPA: 9.06),"

After the comma, continue in the SAME sentence with a passion statement that aligns with the job description. The complete sentence should be:
"I'm Vansh Sehgal, a B.Tech CSE student (2026) from VIT Vellore (CGPA: 9.06), [passion statement based on JD]"

Analyze the job description carefully to determine what the role requires, then create an appropriate passion statement. Most roles will be technical, so prioritize technical skills and technologies. Examples:
- If JD mentions backend development, system design, APIs, Java, scalability, distributed systems → "passionate about building scalable and reliable systems with strong fundamentals in Java, backend development, and system design."
- If JD mentions full-stack development, web technologies, React, Node.js → "passionate about building full-stack applications and creating seamless user experiences."
- If JD mentions software engineering, software development, coding, programming languages → "passionate about software engineering and building robust, efficient solutions."
- If JD mentions cloud technologies, AWS, microservices, DevOps → "passionate about cloud-native development and building scalable distributed systems."
- If JD mentions machine learning, AI, data science, Python → "passionate about leveraging data and machine learning to solve complex problems."
- If JD mentions mobile development, iOS, Android, React Native → "passionate about mobile application development and creating intuitive user experiences."
- For non-technical roles (if JD focuses on business analysis, product management, etc.) → "passionate about [relevant non-technical focus from JD]"
- Analyze the JD and create a relevant passion statement that matches what the role actually requires, prioritizing technical aspects for technical roles.

**Paragraph 2 (Expressing Interest - DYNAMIC):**
This paragraph should be 2-3 sentences. Analyze the job description carefully and:
- Mention the specific role name and company name
- Show that you understand what the role entails by referencing specific aspects from the job description
- Mention something specific about the company or role that demonstrates you've read and understood the JD
- Connect your interest to specific requirements or responsibilities mentioned in the job description
- Be concise and authentic

**Paragraph 3 (Highlighting Relevant Experience - DYNAMIC):**
Keep this to 1-2 sentences. Based on the job description AND the candidate's skills/projects/experience context provided above:
- CRITICAL: First, analyze the job description to identify what technologies, tools, and skills are required
- Then, from the candidate's skills list, select ONLY 2-4 skills that match what's mentioned in the JD
- Do NOT mention all matching skills - be selective and mention only the most relevant ones
- Do NOT mention skills that are not in the job description, even if they're in the candidate's skills list
- If projects are included and relevant: Only mention projects (CogniVue, LT-Companion, Smart Rental Tracker) if they use technologies mentioned in the JD
- If experience is included and relevant: Only mention the Bharat Electronics internship if it relates to technologies/skills in the JD
- Connect the candidate's background (B.Tech CSE) and relevant skills/experiences to what the role requires
- Be specific: "I've worked with [specific tech from JD]" only if that tech is in the skills list AND mentioned in the JD
- Focus on quality over quantity - mention fewer, more relevant skills rather than listing many skills
- For non-technical roles, focus on relevant analytical, communication, or business skills from the JD

**Paragraph 4 (The Ask - FIXED TEXT):**
Use this EXACT text (do not modify):
"I'd be sincerely grateful if you could refer me for this opportunity. I completely understand a referral doesn't ensure selection, but it would mean a lot to have my profile considered."

**Closing Section:**
After the ask paragraph, go directly to:
Thank you for your time and consideration.

Warm regards,
Vansh Sehgal
B.Tech CSE, VIT Vellore
https://www.vanshx.live

**IMPORTANT - Closing Section:**
- Do NOT include Resume link, Job ID, Job Link, Email, or Contact in the closing section
- These will be added automatically based on user preferences
- End the ask paragraph and go directly to "Thank you for your time and consideration."

**CRITICAL INSTRUCTIONS FOR SKILLS & EXPERIENCE:**
- Read the job description FIRST and identify ALL technologies, tools, programming languages, frameworks, and skills mentioned
- Then, from the candidate's skills list, select ONLY the skills that appear in the job description
- Do NOT mention skills that are not in the JD, even if they're impressive (e.g., if JD doesn't mention MongoDB, don't mention it)
- Only mention 2-4 most relevant skills that match the JD - don't list all matching skills
- If projects are included: Only reference projects if they use technologies mentioned in the JD (e.g., if JD mentions Next.js/React, you can mention CogniVue)
- If experience is included: Only reference the internship if it's relevant to the JD (e.g., if JD mentions Python/data analysis, you can mention the internship)
- Match skills from the candidate's skills list to requirements in the JD - be precise and relevant
- Focus on quality over quantity - mention fewer, more relevant skills rather than many skills

**GENERAL INSTRUCTIONS:**
- Read the entire job description carefully
- Identify the key requirements, responsibilities, technologies, programming languages, frameworks, tools, and skills mentioned
- For technical roles (which will be most common): Focus on technical skills, technologies, programming languages, system design, APIs, databases, cloud platforms, DevOps tools, etc.
- Only mention skills, technologies, and experiences that are directly relevant to this role based on the JD
- Do NOT make assumptions about what to include - base everything on the job description provided
- Make the email unique and tailored specifically to this role and company
- The introduction and ask paragraph are fixed - only the middle paragraphs (2 and 3) should be customized based on the JD
- When the JD mentions technical requirements, emphasize technical experiences and skills. When it mentions business/analytical requirements, emphasize those instead.`;

  try {
    console.log('Generating email with form data:', { companyName, role, jobId, jobDescriptionLength: jobDescription?.length || 0 });
    console.log('Prompt preview (first 200 chars):', prompt.substring(0, 200));
    
    // Use the correct API format for @google/genai package
    // The contents should be an array of message objects with role and parts
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });
    
    // Access the response text - it might be a getter property
    let generatedText: string;
    if (response && 'text' in response) {
      // If text is a getter/property
      generatedText = (response as any).text;
    } else if (response && 'candidates' in response && Array.isArray((response as any).candidates)) {
      // Try accessing via candidates array (common in Google AI responses)
      const candidates = (response as any).candidates;
      if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
        generatedText = candidates[0].content.parts
          .map((part: any) => part.text || '')
          .join('');
      } else {
        throw new Error("No text content in response candidates");
      }
    } else {
      // Log the response structure for debugging
      console.error('Unexpected response structure:', JSON.stringify(response, null, 2));
      throw new Error(`Unexpected response format. Check console for details.`);
    }
    
    console.log('Generated email length:', generatedText?.length || 0);
    console.log('Generated email preview (first 300 chars):', generatedText?.substring(0, 300));
    
    if (!generatedText || generatedText.trim().length === 0) {
      throw new Error("Received empty response from Gemini API");
    }
    
    // Post-process the email to add closing items based on checkboxes
    let finalEmail = generatedText.trim();
    
    // Build closing items based on checkboxes
    const closingItems: string[] = [];
    if (includeResumeLink && resumeLink) {
      closingItems.push(`Resume: ${resumeLink}`);
    }
    if (includeJobId && jobId) {
      closingItems.push(`Job ID: ${jobId}`);
    }
    if (includeJobLink && jobLink) {
      closingItems.push(`Job Link: ${jobLink}`);
    }
    if (includeEmailId && emailId) {
      closingItems.push(`Email: ${emailId}`);
    }
    if (includeContact && contact) {
      closingItems.push(`Contact: ${contact}`);
    }
    
    // Find the "Thank you for your time and consideration" line
    const thankYouPattern = /Thank you for your time and consideration\./i;
    const thankYouMatch = finalEmail.search(thankYouPattern);
    
    if (thankYouMatch !== -1) {
      // Split email at the "Thank you" line
      const beforeThankYou = finalEmail.substring(0, thankYouMatch).trim();
      const afterThankYou = finalEmail.substring(thankYouMatch);
      
      // Remove any existing closing items that might be there (clean up)
      let cleanedBefore = beforeThankYou;
      cleanedBefore = cleanedBefore
        .replace(/Resume:\s*[^\n]+(\n|$)/gi, '')
        .replace(/Job ID:\s*[^\n]+(\n|$)/gi, '')
        .replace(/Job Link:\s*[^\n]+(\n|$)/gi, '')
        .replace(/Email:\s*[^\n]+(\n|$)/gi, '')
        .replace(/Contact:\s*[^\n]+(\n|$)/gi, '')
        .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
        .trim();
      
      // Reconstruct email with closing items if any
      if (closingItems.length > 0) {
        const closingSection = '\n\n' + closingItems.join('\n\n') + '\n\n';
        finalEmail = cleanedBefore + closingSection + afterThankYou;
      } else {
        finalEmail = cleanedBefore + '\n\n' + afterThankYou;
      }
    } else if (closingItems.length > 0) {
      // If "Thank you" line not found, append closing items before the signature
      const warmRegardsPattern = /Warm regards,/i;
      const warmRegardsMatch = finalEmail.search(warmRegardsPattern);
      
      if (warmRegardsMatch !== -1) {
        const beforeRegards = finalEmail.substring(0, warmRegardsMatch).trim();
        const afterRegards = finalEmail.substring(warmRegardsMatch);
        finalEmail = beforeRegards + '\n\n' + closingItems.join('\n\n') + '\n\n' + afterRegards;
      } else {
        // Fallback: append at the end
        finalEmail = finalEmail + '\n\n' + closingItems.join('\n\n');
      }
    }
    
    return finalEmail.trim();
  } catch (error) {
    console.error("Error generating email with Gemini:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw new Error(`Failed to generate email: ${error.message}`);
    }
    throw new Error("Failed to generate email. Please check the console for details.");
  }
};
