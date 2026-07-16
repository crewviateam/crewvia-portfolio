import { supabase } from "./supabase";

function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export type ContactFormData = {
  name: string;
  email: string;
  projectType?: string;
  budget?: string;
  message: string;
};

export type LeadFormData = {
  name?: string;
  email: string;
};

export async function submitContactInquiry(data: ContactFormData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      // Mock submission if Supabase is not configured
      console.log("Mock Contact Submission:", data);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    }

    const { error } = await supabase.from("inquiries").insert({
      type: "contact",
      name: data.name,
      email: data.email,
      project_type: data.projectType || null,
      budget: data.budget || null,
      message: data.message,
      session_id: getStorageItem("crewvia_sid"),
    });

    if (error) throw error;
    
    return { success: true };
  } catch (err: any) {
    console.error("Failed to submit contact inquiry:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function submitLeadCapture(data: LeadFormData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      // Mock submission if Supabase is not configured
      console.log("Mock Lead Capture:", data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    }

    const { error } = await supabase.from("inquiries").insert({
      type: "lead",
      name: data.name || null,
      email: data.email,
      session_id: getStorageItem("crewvia_sid"),
    });

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("Failed to submit lead capture:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}
