import lamejs from 'lamejs';

// Base64 to ArrayBuffer
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// ArrayBuffer to Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Format duration in mm:ss or hh:mm:ss
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const paddedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    const paddedMins = remMins < 10 ? `0${remMins}` : `${remMins}`;
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${mins}:${paddedSecs}`;
}

// Format file size in KB or MB
export function formatFileSize(bytes: number): string {
  if (isNaN(bytes) || bytes === 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Download blob directly in browser
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

// Extract waveform peaks from ArrayBuffer
export async function extractWaveformData(
  audioData: ArrayBuffer,
  numPoints: number = 64
): Promise<number[]> {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Clone array buffer because decodeAudioData detaches the buffer
    const copy = audioData.slice(0);
    const audioBuffer = await audioCtx.decodeAudioData(copy);
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(channelData.length / numPoints);
    const waveform: number[] = [];

    for (let i = 0; i < numPoints; i++) {
      const start = i * blockSize;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[start + j] || 0);
      }
      const avg = sum / blockSize;
      waveform.push(Math.min(1, avg * 3.5)); // slight gain for visual impact
    }

    await audioCtx.close();
    return waveform;
  } catch (err) {
    console.warn('Could not extract waveform data:', err);
    // Return aesthetic simulated waveform
    const simulated: number[] = [];
    for (let i = 0; i < numPoints; i++) {
      const val = 0.2 + 0.6 * Math.abs(Math.sin((i / numPoints) * Math.PI * 4) * Math.cos(i * 0.3));
      simulated.push(val);
    }
    return simulated;
  }
}

// Convert WAV ArrayBuffer to MP3 Blob using lamejs
export function convertWavToMp3(wavBuffer: ArrayBuffer, kbps: number = 192): Blob {
  try {
    const dataView = new DataView(wavBuffer);
    
    // Check RIFF header
    const riff = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3)
    );

    let channels = 1;
    let sampleRate = 24000;
    let dataOffset = 44;

    if (riff === 'RIFF') {
      channels = dataView.getUint16(22, true);
      sampleRate = dataView.getUint32(24, true);
      
      // Locate 'data' subchunk
      let pos = 12;
      while (pos < dataView.byteLength - 8) {
        const chunkId = String.fromCharCode(
          dataView.getUint8(pos),
          dataView.getUint8(pos + 1),
          dataView.getUint8(pos + 2),
          dataView.getUint8(pos + 3)
        );
        const chunkSize = dataView.getUint32(pos + 4, true);
        if (chunkId === 'data') {
          dataOffset = pos + 8;
          break;
        }
        pos += 8 + chunkSize;
      }
    }

    const pcmData = new Int16Array(wavBuffer, dataOffset);
    const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
    const mp3Chunks: BlobPart[] = [];

    const sampleBlockSize = 1152;
    if (channels === 1) {
      for (let i = 0; i < pcmData.length; i += sampleBlockSize) {
        const sampleChunk = pcmData.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
          mp3Chunks.push(new Uint8Array(mp3buf));
        }
      }
    } else {
      // Stereo deinterleave
      const left = new Int16Array(pcmData.length / 2);
      const right = new Int16Array(pcmData.length / 2);
      for (let i = 0; i < pcmData.length; i += 2) {
        left[i / 2] = pcmData[i];
        right[i / 2] = pcmData[i + 1];
      }
      for (let i = 0; i < left.length; i += sampleBlockSize) {
        const leftChunk = left.subarray(i, i + sampleBlockSize);
        const rightChunk = right.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
        if (mp3buf.length > 0) {
          mp3Chunks.push(new Uint8Array(mp3buf));
        }
      }
    }

    const finalBuf = mp3Encoder.flush();
    if (finalBuf.length > 0) {
      mp3Chunks.push(new Uint8Array(finalBuf));
    }

    return new Blob(mp3Chunks, { type: 'audio/mp3' });
  } catch (err) {
    console.error('Error encoding MP3 with lamejs:', err);
    // Return original WAV as fallback
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }
}

// Convert WAV to OGG/WebM using AudioContext and MediaRecorder if supported
export async function convertWavToOggOrWebm(wavBuffer: ArrayBuffer): Promise<Blob> {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const copy = wavBuffer.slice(0);
    const audioBuffer = await audioCtx.decodeAudioData(copy);

    const dest = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(dest);

    // Pick supported mime type
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      mimeType = 'audio/ogg;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    }

    const mediaRecorder = new MediaRecorder(dest.stream, { mimeType });
    const chunks: Blob[] = [];

    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        audioCtx.close();
        resolve(new Blob(chunks, { type: mimeType.split(';')[0] }));
      };

      mediaRecorder.start();
      source.start();

      source.onended = () => {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 150);
      };
    });
  } catch {
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }
}

// Clean SSML tags for browser fallback speech
export function stripSsmlTags(ssml: string): string {
  if (!ssml) return '';
  return ssml
    .replace(/<sub\s+alias="([^"]+)">.*?<\/sub>/gi, '$1')
    .replace(/<phoneme\s+[^>]*>(.*?)<\/phoneme>/gi, '$1')
    .replace(/<break\s+[^>]*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Browser Web Speech API fallback for zero-network situations
export function speakWithBrowserTts(
  text: string,
  lang: string = 'en-US',
  rate: number = 1.0,
  pitch: number = 1.0,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) return null;

  window.speechSynthesis.cancel();
  const cleanedText = stripSsmlTags(text) || text;
  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}
