"use client";
import { useState } from "react";

export default function SupportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double clicks

    setIsSubmitting(true);
    setStatus("جاري الإرسال...");

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("/api/support", { // أو المسار الصحيح للدالة لديك
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          inquiry_type: formData.get("inquiry_type"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });

      if (!response.ok) throw new Error("فشل الإرسال");

      setStatus("تم إرسال رسالتك بنجاح!");
      (e.target as HTMLFormElement).reset(); // Clear form on success
      
    } catch (error) {
      setStatus("حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Input Fields Here */}
      
      <button 
        type="submit" 
        disabled={isSubmitting} // Disable while submitting
        className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
          isSubmitting 
            ? "bg-gray-500 cursor-not-allowed" 
            : "bg-yellow-500 hover:bg-yellow-600 text-black"
        }`}
      >
        {isSubmitting ? "جاري الإرسال..." : "تنفيذ الإرسال"}
      </button>

      {status && <p className="text-center mt-2 text-sm">{status}</p>}
    </form>
  );
}
