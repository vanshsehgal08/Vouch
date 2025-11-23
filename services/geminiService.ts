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

  // Load user profile data
  let userExperience = '';
  let userProjects = '';
  let userName = 'Vansh Sehgal';
  let userDegree = 'B.Tech CSE';
  let userGradYear = '2026';
  let userUniversity = 'VIT Vellore';
  let userCGPA = '9.06';
  let userWebsite = '';
  
  try {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      userExperience = profile.experience || '';
      userProjects = profile.projects || '';
      userName = profile.name || 'Vansh Sehgal';
      userDegree = profile.degree || 'B.Tech CSE';
      userGradYear = profile.graduationYear || '2026';
      userUniversity = profile.university || 'VIT Vellore';
      userCGPA = profile.cgpa || '9.06';
      userWebsite = profile.website || '';
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
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

  // Conditionally include projects - use user-provided projects if available
  const projectsContext = includeProjects ? `
**Projects (Only mention if relevant to the job description):**
${userProjects || '- CogniVue – AI-powered Interview Preparation Platform: Next.js, React, TypeScript, Google Gemini, GPT-4, Vapi AI, ElevenLabs, Firebase, Stripe, Tailwind CSS\n- LT-Companion – Chrome Extension for LeetCode: Chrome Extension, Google Gemini, JavaScript, AI Integration\n- Smart Rental Tracker – Equipment Rental Management System: Python, Machine Learning, AI Analytics, Web Dashboard, Data Visualization'}
` : '';

  // Conditionally include experience - use user-provided experience if available
  const experienceContext = includeExperience ? `
**Experience (Only mention if relevant to the job description):**
${userExperience || '- Bharat Electronics Ltd, Ministry of Defence (May 2024 - Internship): Engineered algorithms to decode complex ASTERIX data sequences, developed Python-based system for decoding radar data packets, implemented linear regression model. Tools: Python, Pandas, NumPy, Scikit-learn, Jupyter, Wireshark, Git, Agile methodology'}
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
- Name: ${userName}
- Education: ${userDegree} (${userGradYear}), ${userUniversity} (CGPA: ${userCGPA})

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
CRITICAL: The subject line MUST include the complete job ID number.
Write EXACTLY this format (do not use parentheses for the Job ID):
"Referral Request for [ROLE_NAME] - Job ID: [JOB_ID_NUMBER]"

For this email:
- ROLE_NAME = ${role}
- JOB_ID_NUMBER = ${jobId}

Example output: "Referral Request for Data Scientist - Job ID: ABC123"
The job ID MUST be included.

**Email Body:**

**Paragraph 1 (Introduction - FIXED FORMAT):**
Start with "Hi Sir," followed by a new line.
Then write: "I'm ${userName}, a ${userDegree} student (${userGradYear}) from ${userUniversity} (CGPA: ${userCGPA}),"

After the comma, continue in the SAME sentence with a passion statement that aligns with the job description. The complete sentence should be:
"I'm ${userName}, a ${userDegree} student (${userGradYear}) from ${userUniversity} (CGPA: ${userCGPA}), [passion statement based on JD]"

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
- Express your interest in the specific role at the company
- When mentioning the role, write: "${role} role at ${companyName} (Job ID: ${jobId})"
- CRITICAL: Include the COMPLETE phrase with job ID. Do NOT write just "(" or omit the job ID number.
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
${userName}
${userDegree}, ${userUniversity}
${userWebsite ? userWebsite : ''}

**IMPORTANT - Closing Section:**
- Do NOT include Resume link, Job ID, Job Link, Email, or Contact in the closing section
- These will be added automatically based on user preferences
- End the ask paragraph and go directly to "Thank you for your time and consideration."
- After "Warm regards," include only the name and education (degree, university)
- If user has provided a website in their profile, include it on a new line after the education
- Do NOT include any other contact info in the AI-generated part

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
    
    // The AI now generates the job ID correctly, so no post-processing needed
    let finalEmail = generatedText.trim();

    // Helper function to convert text to Unicode bold
    const toBold = (str: string) => {
      const boldMap: { [key: string]: string } = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
        'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
        '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗',
        ':': ':' // Keep colon as is
      };
      return str.split('').map(char => boldMap[char] || char).join('');
    };



    console.log('Generated email (first 300 chars):', finalEmail.substring(0, 300));
    
    // Post-process the email to add closing items based on checkboxes
    
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
    
    // Auto-bold specific labels (only the label, not the value)
    // We do this at the very end to ensure we catch labels added in the post-processing step
    finalEmail = finalEmail.replace(/Resume:/g, toBold('Resume') + ':');
    finalEmail = finalEmail.replace(/Job Link:/g, toBold('Job Link') + ':');
    finalEmail = finalEmail.replace(/Job ID:/g, toBold('Job ID') + ':');
    finalEmail = finalEmail.replace(/Email:/g, toBold('Email') + ':');
    finalEmail = finalEmail.replace(/Contact:/g, toBold('Contact') + ':');

    // Auto-bold the "Ask" paragraph
    const askParagraph = "I'd be sincerely grateful if you could refer me for this opportunity. I completely understand a referral doesn't ensure selection, but it would mean a lot to have my profile considered.";
    if (finalEmail.includes(askParagraph)) {
      finalEmail = finalEmail.replace(askParagraph, toBold(askParagraph));
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

export const generateCoverLetter = async (formData: FormData): Promise<string> => {
  const { 
    companyName, 
    role, 
    jobId, 
    jobDescription, 
    jobLink,
    additionalInstructions,
  } = formData;

  if (!companyName || !role) {
    throw new Error("Please provide Company Name and Role before generating the cover letter.");
  }

  // Load user profile data
  let userExperience = '';
  let userProjects = '';
  let userName = 'Vansh Sehgal';
  let userDegree = 'B.Tech CSE';
  let userGradYear = '2026';
  let userUniversity = 'VIT Vellore';
  let userCGPA = '9.06';
  let userWebsite = '';
  let userEmail = '';
  let userContact = '';
  
  try {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      userExperience = profile.experience || '';
      userProjects = profile.projects || '';
      userName = profile.name || 'Vansh Sehgal';
      userDegree = profile.degree || 'B.Tech CSE';
      userGradYear = profile.graduationYear || '2026';
      userUniversity = profile.university || 'VIT Vellore';
      userCGPA = profile.cgpa || '9.06';
      userWebsite = profile.website || '';
      userEmail = profile.emailId || '';
      userContact = profile.contact || '';
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }

  const skillsContext = `
**Candidate's Skills:**
- Languages: Java, Python, C/C++, JavaScript, TypeScript
- Frontend: React.js, Next.js, Tailwind CSS, Bootstrap, shadcn/ui, Zod, Chart.js
- Backend: Node.js, Express.js, RESTful APIs, JWT/OAuth, WebSockets, Socket.io
- Databases: PostgreSQL, MySQL, MongoDB, Redis, DynamoDB
- CS Core: DSA, OOP, Operating Systems, DBMS, Software Architecture
- Tools: Git, GitHub, Postman, Figma, GitHub Actions (basic), Firebase Console
- Cloud/DevOps: AWS (EC2, S3), GCP, Docker, Vercel (CI/CD), Linux (basic)
- Methodologies: Agile (Scrum, Kanban), Waterfall, Spiral, Git Flow
`;

  const projectsContext = `
**Projects:**
${userProjects || '- CogniVue – AI-powered Interview Preparation Platform\n- LT-Companion – Chrome Extension for LeetCode\n- Smart Rental Tracker – Equipment Rental Management System'}
`;

  const experienceContext = `
**Experience:**
${userExperience || '- Bharat Electronics Ltd, Ministry of Defence (Internship)'}
`;

  const prompt = `You are an expert career coach and professional writer. Write a compelling, professional cover letter for a software engineering role.

**Candidate Details:**
- Name: ${userName}
- Education: ${userDegree} (${userGradYear}), ${userUniversity} (CGPA: ${userCGPA})
- Email: ${userEmail}
- Phone: ${userContact}
- Website: ${userWebsite}
${skillsContext}
${projectsContext}
${experienceContext}

**Job Details:**
- Company: ${companyName}
- Role: ${role}
- Job ID: ${jobId || 'N/A'}
- Job Link: ${jobLink || 'N/A'}
- Description: ${jobDescription || 'Not provided'}

**Additional Instructions:**
${additionalInstructions || "None"}

**Requirements:**
1. **Format:** Standard business letter format.
   - Header: Candidate Name, Contact Info.
   - Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
   - Recipient: Hiring Manager, ${companyName}.
   - Address: [Company Address] (Keep this placeholder exactly as is).
   - Salutation: "Dear Hiring Manager,"
2. **Tone:** Professional, confident, enthusiastic, and authentic.
3. **Content:**
   - **Opening:** State the role applied for and express strong interest. Mention the Job ID if available.
   - **Body Paragraph 1 (Experience/Skills):** Connect candidate's skills (Java, Python, React, Node.js, etc.) and experience to the specific requirements in the Job Description. Highlight relevant projects.
   - **Body Paragraph 2 (Why this company/role):** Demonstrate understanding of the company/role and why the candidate is a perfect fit. Use the "Passion Statement" logic: align passion with the JD (e.g., scalable systems, full-stack, AI, etc.).
   - **Closing:** Reiterate enthusiasm and request an interview.
   - **Sign-off:** "Sincerely," followed by Candidate Name.
4. **Style:** Clear, concise paragraphs. No bullet points unless absolutely necessary for impact.
5. **Length:** ~300-400 words.

**Output:**
Provide ONLY the body of the cover letter (including header/date/salutation/sign-off). Do not include any conversational filler before or after.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    let generatedText: string;
    if (response && 'text' in response) {
      generatedText = (response as any).text;
    } else if (response && 'candidates' in response && Array.isArray((response as any).candidates)) {
      const candidates = (response as any).candidates;
      if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
        generatedText = candidates[0].content.parts
          .map((part: any) => part.text || '')
          .join('');
      } else {
        throw new Error("No text content in response candidates");
      }
    } else {
      throw new Error(`Unexpected response format.`);
    }

    return generatedText;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter. Please try again.");
  }
};

export const modifyResume = async (latexCode: string, userRequest: string): Promise<string> => {
  if (!latexCode.trim()) {
    throw new Error("Please provide your LaTeX resume code first.");
  }

  if (!userRequest.trim()) {
    throw new Error("Please tell me what you'd like to change.");
  }

  const prompt = `You are a LaTeX resume editor assistant. The user has a resume in LaTeX format and wants to make changes.

**Current LaTeX Code:**
\`\`\`latex
${latexCode}
\`\`\`

**User Request:** "${userRequest}"

**Instructions:**
1. Analyze the user's request carefully
2. Modify ONLY the content that the user requested to change
3. Maintain the EXACT formatting, spacing, structure, and style
4. Do NOT change:
   - Document class or packages
   - Custom commands or macros
   - Overall layout or margins
   - Section formatting
5. If the request is unclear or ambiguous, ask for clarification

**Common Requests and How to Handle Them:**
- "Add skill: X" → Add X to the appropriate skills section
- "Change CGPA to Y" → Update the CGPA value in the education section
- "Remove project Z" → Delete the entire project entry
- "Add experience at Company" → Add a new experience entry
- "Make summary shorter" → Condense the summary while keeping key points

**Output Format:**
If the request is clear and can be executed:
- Return ONLY the complete modified LaTeX code
- Do NOT include any explanations before or after the code
- Do NOT use markdown code blocks

If the request is unclear:
- Start with "CLARIFICATION NEEDED:" followed by your question
- Do NOT modify the LaTeX code

Now, process the user's request:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    let generatedText: string;
    if (response && 'text' in response) {
      generatedText = (response as any).text;
    } else if (response && 'candidates' in response && Array.isArray((response as any).candidates)) {
      const candidates = (response as any).candidates;
      if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
        generatedText = candidates[0].content.parts
          .map((part: any) => part.text || '')
          .join('');
      } else {
        throw new Error("No text content in response candidates");
      }
    } else {
      throw new Error(`Unexpected response format.`);
    }

    return generatedText.trim();
  } catch (error) {
    console.error("Error modifying resume:", error);
    throw new Error("Failed to modify resume. Please try again.");
  }
};

