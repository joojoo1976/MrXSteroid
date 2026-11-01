
export class FutureVoice {
  static async transcribeVoice(audioBlob: Blob) {
    // In production: use Web Speech API or Whisper API
    // const formData = new FormData(); formData.append('file', audioBlob); const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
    return {
      text: 'سجلت سكوات 100 كجم 5 تكرارات',
      parsed: { exercise: 'squat', weight: 100, reps: 5 },
      confidence: 90,
      model: 'whisper-stub'
    };
  }
}
