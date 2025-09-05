import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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

    const { fundusId, ergId } = await request.json()

    if (!fundusId || !ergId) {
      return NextResponse.json({ error: "Both fundus ID and ERG ID required" }, { status: 400 })
    }

    // Verify both inputs exist and are processed
    const { data: fundusData } = await supabase
      .from("fundus_images")
      .select("*")
      .eq("id", fundusId)
      .eq("processing_status", "completed")
      .single()

    const { data: ergData } = await supabase
      .from("erg_data")
      .select("*")
      .eq("id", ergId)
      .eq("processing_status", "completed")
      .single()

    if (!fundusData || !ergData) {
      return NextResponse.json({ error: "Selected data not found or not processed" }, { status: 400 })
    }

    // Create analysis record
    const { data: analysisData, error: analysisError } = await supabase
      .from("multimodal_analyses")
      .insert({
        fundus_image_id: fundusId,
        erg_data_id: ergId,
        analysis_status: "processing",
      })
      .select()
      .single()

    if (analysisError) throw analysisError

    // Simulate AI processing (in real implementation, this would call actual AI models)
    setTimeout(async () => {
      try {
        // Mock CNN analysis of fundus image
        const fundusFeatures = fundusData.extracted_features || {}
        const fundusConfidence = Math.random() * 0.3 + 0.7 // 0.7-1.0

        // Mock MLP analysis of ERG data
        const ergFeatures = ergData.extracted_features || {}
        const ergConfidence = Math.random() * 0.3 + 0.6 // 0.6-0.9

        // Mock multimodal fusion
        const combinedConfidence = (fundusConfidence * 0.6 + ergConfidence * 0.4) * (Math.random() * 0.1 + 0.95)

        // Determine color blindness type based on combined analysis
        const colorBlindnessTypes = [
          "Normal",
          "Protanopia",
          "Deuteranopia",
          "Tritanopia",
          "Protanomaly",
          "Deuteranomaly",
        ]
        const weights = [0.4, 0.15, 0.15, 0.05, 0.125, 0.125] // Normal is most likely

        const randomValue = Math.random()
        let selectedType = "Normal"
        let cumulativeWeight = 0

        for (let i = 0; i < colorBlindnessTypes.length; i++) {
          cumulativeWeight += weights[i]
          if (randomValue <= cumulativeWeight) {
            selectedType = colorBlindnessTypes[i]
            break
          }
        }

        // Determine severity
        const severity =
          selectedType === "Normal"
            ? "None"
            : combinedConfidence > 0.8
              ? "Severe"
              : combinedConfidence > 0.6
                ? "Moderate"
                : "Mild"

        const analysisDetails = {
          cnn_features: {
            optic_disc_analysis: fundusFeatures.optic_disc_detected || false,
            macula_analysis: fundusFeatures.macula_detected || false,
            vessel_analysis: fundusFeatures.vessel_clarity || 0.8,
            color_distribution: {
              red_channel_intensity: Math.random() * 0.4 + 0.6,
              green_channel_intensity: Math.random() * 0.4 + 0.6,
              blue_channel_intensity: Math.random() * 0.4 + 0.6,
            },
          },
          mlp_features: {
            a_wave_analysis: ergFeatures.a_wave_amplitude || 100,
            b_wave_analysis: ergFeatures.b_wave_amplitude || 300,
            cone_response: ergFeatures.oscillatory_potentials || false,
            signal_integrity: ergData.signal_quality || 0.8,
          },
          fusion_weights: {
            fundus_weight: 0.6,
            erg_weight: 0.4,
            attention_scores: [0.8, 0.7, 0.9, 0.6],
          },
          model_versions: {
            cnn_version: "v2.1.0",
            mlp_version: "v1.8.0",
            fusion_version: "v1.3.0",
          },
        }

        // Update analysis with results
        await supabase
          .from("multimodal_analyses")
          .update({
            analysis_status: "completed",
            fundus_confidence: fundusConfidence,
            erg_confidence: ergConfidence,
            combined_confidence: combinedConfidence,
            color_blindness_type: selectedType,
            severity_level: severity,
            analysis_details: analysisDetails,
            completed_at: new Date().toISOString(),
          })
          .eq("id", analysisData.id)
      } catch (error) {
        console.error("Analysis processing error:", error)
        await supabase.from("multimodal_analyses").update({ analysis_status: "failed" }).eq("id", analysisData.id)
      }
    }, 5000) // 5 second processing simulation

    return NextResponse.json({
      success: true,
      analysisId: analysisData.id,
      message: "Multimodal analysis started",
    })
  } catch (error) {
    console.error("Multimodal analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
