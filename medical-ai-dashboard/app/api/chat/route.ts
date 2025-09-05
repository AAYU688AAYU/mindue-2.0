import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Note: In a real implementation, you would use the Groq SDK
// For now, we'll simulate the Groq API call
async function callGroqAPI(messages: any[], systemPrompt: string) {
  // This would be replaced with actual Groq SDK call:
  // import Groq from "groq-sdk"
  // const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  // Simulate AI response for now
  const userMessage = messages[messages.length - 1]?.content || ""

  // Simple keyword-based responses for demonstration
  if (userMessage.toLowerCase().includes("erg")) {
    return "ERG (Electroretinography) measures the electrical responses of your retina. The a-wave represents photoreceptor activity, while the b-wave shows bipolar cell responses. Your ERG results help us understand how well your cone and rod cells are functioning, which is crucial for color vision assessment."
  }

  if (userMessage.toLowerCase().includes("fundus")) {
    return "Fundus photography captures detailed images of your retina, including the optic disc, macula, and blood vessels. Our AI analyzes color distribution patterns and structural features that can indicate color vision deficiencies. The combination with ERG data provides a comprehensive assessment."
  }

  if (
    userMessage.toLowerCase().includes("color blind") ||
    userMessage.toLowerCase().includes("protanopia") ||
    userMessage.toLowerCase().includes("deuteranopia")
  ) {
    return "Color blindness affects how you perceive certain colors. Protanopia affects red perception, deuteranopia affects green perception, and tritanopia affects blue perception. Our multimodal analysis combines fundus imaging and ERG data to provide accurate diagnosis and severity assessment."
  }

  return "I can help explain your medical results, ERG data interpretation, fundus image analysis, and color blindness conditions. Please feel free to ask specific questions about your test results or any medical terms you'd like clarified."
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, context, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Build system prompt with medical context
    let systemPrompt = `You are a medical AI assistant specializing in color blindness detection and retinal analysis. You help patients understand their ERG (Electroretinography) results, fundus image analysis, and multimodal AI predictions.

Key responsibilities:
- Explain ERG parameters (a-wave, b-wave, implicit time, photopic/scotopic responses)
- Interpret fundus image findings (optic disc, macula, vessel analysis)
- Clarify color blindness types (Normal, Protanopia, Deuteranopia, Tritanopia)
- Provide confidence score explanations
- Use simple, patient-friendly language
- Always recommend consulting with an ophthalmologist for medical decisions

Guidelines:
- Be empathetic and supportive
- Explain medical terms clearly
- Focus on education, not diagnosis
- Encourage professional medical consultation`

    // Add user's recent analysis context if available
    if (context && context.length > 0) {
      systemPrompt += `\n\nPatient's Recent Analysis Results:\n`
      context.forEach((analysis: any, index: number) => {
        systemPrompt += `Analysis ${index + 1}:
- Color Blindness Type: ${analysis.color_blindness_type}
- Severity: ${analysis.severity_level}
- Combined Confidence: ${(analysis.combined_confidence * 100).toFixed(1)}%
- Fundus Confidence: ${(analysis.fundus_confidence * 100).toFixed(1)}%
- ERG Confidence: ${(analysis.erg_confidence * 100).toFixed(1)}%\n`
      })
    }

    // Prepare messages for AI
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ]

    // Call Groq API (simulated for now)
    const aiResponse = await callGroqAPI(messages, systemPrompt)

    return NextResponse.json({ message: aiResponse })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
