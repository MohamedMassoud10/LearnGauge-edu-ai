const API_KEY = "";

export const generateQuizFromContent = async (lectureContent) => {
  try {
    const prompt = `
      Based on the following lecture content, create a comprehensive quiz with 10 multiple-choice questions.
      
      Lecture Content:
      ${lectureContent}
      
      Please respond with a JSON object in this exact format:
      {
        "questions": [
          {
            "text": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "points": 2
          }
        ]
      }
      
      Requirements:
      - Create exactly 10 questions
      - Questions should be relevant to the lecture content
      - Each question must have exactly 4 options
      - correctAnswer should be the index (0-3) of the correct option
      - Each question is worth 2 points
      - Mix different difficulty levels
      - Test understanding, not just memorization
      - Ensure questions are clear and unambiguous
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API Error: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error("Invalid response structure from Gemini API");
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in Gemini response");
    }

    try {
      const quizData = JSON.parse(jsonMatch[0]);

      // Validate the structure
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error("Invalid quiz data structure");
      }

      // Validate each question
      quizData.questions.forEach((question, index) => {
        if (
          !question.text ||
          !question.options ||
          !Array.isArray(question.options) ||
          question.options.length !== 4
        ) {
          throw new Error(`Invalid question structure at index ${index}`);
        }
        if (
          typeof question.correctAnswer !== "number" ||
          question.correctAnswer < 0 ||
          question.correctAnswer > 3
        ) {
          throw new Error(`Invalid correctAnswer at question ${index}`);
        }
      });

      return quizData.questions;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Failed to parse quiz data from Gemini response");
    }
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    throw error;
  }
};

export const extractTextFromPDFUrl = async (pdfUrl) => {
  try {
    // This is a placeholder implementation
    // In a real application, you would need to implement actual PDF text extraction
    // Options include:
    // 1. Send PDF URL to your backend for processing
    // 2. Use a third-party service like Google Document AI
    // 3. Use pdf-parse library on the server side

    console.log("Extracting text from PDF:", pdfUrl);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return placeholder content that represents what would be extracted
    return `
      Lecture Content from PDF: ${pdfUrl}
      
      This is placeholder text that represents the actual content that would be extracted from the PDF.
      In a real implementation, this would contain:
      
      - Course introduction and objectives
      - Key concepts and definitions
      - Detailed explanations of topics
      - Examples and case studies
      - Important formulas or procedures
      - Summary and conclusions
      
      The AI will use this content to generate relevant quiz questions that test
      student understanding of the material covered in the lecture.
    `;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
