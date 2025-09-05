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

    const { ergId } = await request.json()

    if (!ergId) {
      return NextResponse.json({ error: "ERG ID required" }, { status: 400 })
    }

    // Update processing status
    await supabase.from("erg_data").update({ processing_status: "processing" }).eq("id", ergId)

    // Simulate ERG signal processing (in real implementation, this would parse CSV and analyze signals)
    setTimeout(async () => {
      try {
        // Mock signal quality assessment
        const signalQuality = Math.random() * 0.4 + 0.6 // Random score between 0.6-1.0

        // Mock ERG feature extraction
        const features = {
          a_wave_amplitude: Math.random() * 100 + 50, // 50-150 μV
          b_wave_amplitude: Math.random() * 300 + 200, // 200-500 μV
          a_wave_latency: Math.random() * 5 + 12, // 12-17 ms
          b_wave_latency: Math.random() * 10 + 45, // 45-55 ms
          implicit_time: Math.random() * 20 + 40, // 40-60 ms
          oscillatory_potentials: Math.random() > 0.3, // 70% chance present
          signal_to_noise_ratio: Math.random() * 20 + 10, // 10-30 dB
          baseline_stability: Math.random() * 0.3 + 0.7, // 0.7-1.0
          artifact_detection: Math.random() > 0.8, // 20% chance of artifacts
        }

        await supabase
          .from("erg_data")
          .update({
            processing_status: "completed",
            signal_quality: signalQuality,
            extracted_features: features,
            processed_at: new Date().toISOString(),
          })
          .eq("id", ergId)
      } catch (error) {
        console.error("ERG processing error:", error)
        await supabase.from("erg_data").update({ processing_status: "failed" }).eq("id", ergId)
      }
    }, 4000) // 4 second delay to simulate signal processing

    return NextResponse.json({ success: true, message: "ERG processing started" })
  } catch (error) {
    console.error("ERG process error:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}
