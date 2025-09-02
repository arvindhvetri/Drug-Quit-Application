import speech_recognition as sr
from pydub import AudioSegment
import os

def convert_voice_to_text(audio_file_path):
    # Convert audio to WAV if needed
    if audio_file_path.endswith('.ogg') or audio_file_path.endswith('.mp3'):
        audio = AudioSegment.from_file(audio_file_path)
        wav_path = audio_file_path.rsplit('.', 1)[0] + ".wav"
        audio.export(wav_path, format="wav")
        audio_file_path = wav_path

    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file_path) as source:
        audio = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio)
            return text
        except sr.UnknownValueError:
            return "Could not understand audio"
        except sr.RequestError:
            return "Could not request results"