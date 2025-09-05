import { createServerClient } from "@/lib/supabase/server"

export interface AuditEvent {
  action: string
  resourceType: string
  resourceId?: string
  metadata?: Record<string, any>
}

export async function logAuditEvent(event: AuditEvent) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        user_id: user.id,
        action: event.action,
        resource_type: event.resourceType,
        resource_id: event.resourceId,
        metadata: event.metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error("Audit logging error:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Audit logging failed:", error)
    return null
  }
}

// Predefined audit actions for medical compliance
export const AUDIT_ACTIONS = {
  // Data access
  VIEW_FUNDUS_IMAGE: "view_fundus_image",
  VIEW_ERG_DATA: "view_erg_data",
  VIEW_ANALYSIS_RESULT: "view_analysis_result",

  // Data modification
  UPLOAD_FUNDUS_IMAGE: "upload_fundus_image",
  UPLOAD_ERG_DATA: "upload_erg_data",
  DELETE_FUNDUS_IMAGE: "delete_fundus_image",
  DELETE_ERG_DATA: "delete_erg_data",

  // AI operations
  START_AI_ANALYSIS: "start_ai_analysis",
  COMPLETE_AI_ANALYSIS: "complete_ai_analysis",

  // Authentication
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",

  // Consent management
  CONSENT_GRANTED: "consent_granted",
  CONSENT_WITHDRAWN: "consent_withdrawn",

  // Data export
  EXPORT_DATA: "export_data",
  DOWNLOAD_REPORT: "download_report",
} as const

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS]
